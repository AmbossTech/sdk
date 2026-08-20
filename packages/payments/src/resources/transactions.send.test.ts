import assert from 'node:assert/strict';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { afterEach, describe, it } from 'node:test';

import { bytesToHex } from '@noble/hashes/utils';
import type { GraphQLClient } from 'graphql-request';

import { deriveMasterKey } from '../crypto/argon2.js';
import { nip44Encrypt } from '../crypto/nip44.js';
import { Transactions } from './transactions.js';

const PASSWORD = 'hunter2-pw'; // >= 8 chars: Argon2 salts (the password, in the 2nd hash) must be >= 8 bytes
const TEAM_ID = '11111111-1111-1111-1111-111111111111';
const MACAROON_HEX = '0201036c6e6402240a';
const SYMMETRIC_KEY = bytesToHex(new Uint8Array(64).map((_, i) => (i * 5 + 1) & 0xff));

let server: Server | undefined;
let lastBody: unknown;
afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
  server = undefined;
  lastBody = undefined;
});

async function startNode(lines: object[]): Promise<string> {
  server = createServer(async (req, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    lastBody = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    res.writeHead(200, { 'content-type': 'application/json' });
    for (const line of lines) res.write(`${JSON.stringify(line)}\n`);
    res.end();
  });
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('no address');
  return `http://127.0.0.1:${addr.port}`;
}

/** Fake GraphQLClient that answers the operations send() issues. */
function fakeClient(
  restHost: string,
  environmentType: 'LIVE' | 'SANDBOX' = 'LIVE',
  createSendTransaction: object = { id: 'tx1', status: 'PENDING', payment_request: 'lnbc1xyz' },
): GraphQLClient {
  const masterKey = deriveMasterKey(PASSWORD, TEAM_ID);
  const encrypted_symmetric_key = nip44Encrypt(SYMMETRIC_KEY, masterKey);
  const encrypted_macaroon = nip44Encrypt(MACAROON_HEX, SYMMETRIC_KEY);

  const request = async ({ document }: { document: string }): Promise<unknown> => {
    if (document.includes('GetWalletSendContext')) {
      return {
        payment: {
          wallet: {
            find_one: {
              id: 'w1',
              team_id: TEAM_ID,
              environment: { id: 'e1', type: environmentType },
            },
          },
        },
      };
    }
    if (document.includes('GetWalletNodePermissions')) {
      return {
        payment: {
          wallet: {
            find_one: {
              id: 'w1',
              asset: { id: 'a1', type: 'BASE_ASSET' },
              node_permissions: {
                id: 'np1',
                encrypted_symmetric_key,
                nodes: [
                  {
                    id: 'n1',
                    node_id: 'node-1',
                    network: 'regtest',
                    encrypted_macaroon,
                    tls_cert: null,
                    sockets: { id: 's1', lnd: { id: 'l1', rest: restHost }, litd: null },
                  },
                ],
              },
            },
          },
        },
      };
    }
    if (document.includes('CreateSendTransaction')) {
      return {
        payment: {
          transaction: {
            create_send: createSendTransaction,
          },
        },
      };
    }
    throw new Error(`unexpected document: ${document.slice(0, 40)}`);
  };

  return { request } as unknown as GraphQLClient;
}

/** Wraps a fake client so a test can assert which operations were issued. */
function withCallLog(inner: GraphQLClient): { client: GraphQLClient; ops: string[] } {
  const ops: string[] = [];
  const innerRequest = (inner as unknown as { request: (args: unknown) => Promise<unknown> })
    .request;
  const request = async (args: { document: string }): Promise<unknown> => {
    ops.push(args.document);
    return innerRequest(args);
  };
  return { client: { request } as unknown as GraphQLClient, ops };
}

const countOf = (ops: readonly string[], operation: string): number =>
  ops.filter((document) => document.includes(operation)).length;

describe('Transactions.send', () => {
  it('decrypts the macaroon, creates the send, and pays via the LND node', async () => {
    const host = await startNode([
      { result: { status: 'IN_FLIGHT' } },
      { result: { status: 'SUCCEEDED', payment_hash: 'ph', fee_sat: '1' } },
    ]);
    const transactions = new Transactions(fakeClient(host));

    const statuses: string[] = [];
    const result = await transactions.send({
      walletId: 'w1',
      password: PASSWORD,
      destination: { bolt11: 'lnbc1xyz' },
      onUpdate: (p) => statuses.push(p.status),
    });

    assert.ok(result.payment); // live wallet pays over the node
    assert.equal(result.payment.status, 'SUCCEEDED');
    assert.equal(result.payment.paymentHash, 'ph');
    assert.equal(result.transaction.payment_request, 'lnbc1xyz');
    assert.deepEqual(statuses, ['IN_FLIGHT', 'SUCCEEDED']);
    assert.equal((lastBody as { fee_limit_sat: string }).fee_limit_sat, '4294967296');
  });

  it('creates a sandbox send without a password and returns payment: null', async () => {
    // No node should be contacted for sandbox — point at an unroutable host
    // so any accidental node call would fail the test.
    const transactions = new Transactions(fakeClient('http://127.0.0.1:1', 'SANDBOX'));

    const result = await transactions.send({
      walletId: 'w1',
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.equal(result.payment, null);
    assert.equal(result.transaction.payment_request, 'lnbc1xyz');
  });

  it('accepts an explicit teamId override', async () => {
    const host = await startNode([
      { result: { status: 'SUCCEEDED', payment_hash: 'ph', fee_sat: '1' } },
    ]);
    const transactions = new Transactions(fakeClient(host));

    const result = await transactions.send({
      walletId: 'w1',
      password: PASSWORD,
      teamId: TEAM_ID, // overrides the value resolved from the wallet
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.ok(result.payment);
    assert.equal(result.payment.status, 'SUCCEEDED');
  });

  it('surfaces a wrong password as a DecryptionError before paying', async () => {
    const host = await startNode([{ result: { status: 'SUCCEEDED' } }]);
    const transactions = new Transactions(fakeClient(host));

    await assert.rejects(
      transactions.send({
        walletId: 'w1',
        password: 'wrong-password',
        destination: { bolt11: 'lnbc1xyz' },
      }),
      /admin macaroon/,
    );
  });

  it('short-circuits an already-COMPLETED transaction without paying on the node', async () => {
    // Point at an unroutable host so any accidental node call fails the test.
    const transactions = new Transactions(
      fakeClient('http://127.0.0.1:1', 'LIVE', {
        id: 'tx1',
        status: 'COMPLETED',
        payment_hash: 'ph-existing',
        fee: '3',
        payment_request: 'lnbc1xyz',
      }),
    );

    const result = await transactions.send({
      walletId: 'w1',
      password: PASSWORD,
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.ok(result.payment);
    assert.equal(result.payment.status, 'SUCCEEDED');
    assert.equal(result.payment.paymentHash, 'ph-existing');
    assert.equal(result.payment.feeSat, '3');
    assert.equal(result.payment.paymentPreimage, undefined);
    assert.equal(result.transaction.status, 'COMPLETED');
  });

  it('still executes the node payment for a non-completed transaction', async () => {
    const host = await startNode([
      { result: { status: 'SUCCEEDED', payment_hash: 'ph', fee_sat: '1' } },
    ]);
    const transactions = new Transactions(
      fakeClient(host, 'LIVE', { id: 'tx1', status: 'PENDING', payment_request: 'lnbc1xyz' }),
    );

    const result = await transactions.send({
      walletId: 'w1',
      password: PASSWORD,
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.ok(result.payment);
    assert.equal(result.payment.status, 'SUCCEEDED');
    assert.ok(lastBody, 'node should have been called');
  });
});

describe('Transactions.prepareSend', () => {
  it('lets a later send() skip the context and permissions queries', async () => {
    const host = await startNode([
      { result: { status: 'SUCCEEDED', payment_hash: 'ph', fee_sat: '1' } },
    ]);
    const { client, ops } = withCallLog(fakeClient(host));
    const transactions = new Transactions(client);

    await transactions.prepareSend({ walletId: 'w1', password: PASSWORD });
    assert.equal(countOf(ops, 'GetWalletSendContext'), 1);
    assert.equal(countOf(ops, 'GetWalletNodePermissions'), 1);

    ops.length = 0;
    const result = await transactions.send({
      walletId: 'w1', // no password — the macaroon is already in memory
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.ok(result.payment);
    assert.equal(result.payment.status, 'SUCCEEDED');
    assert.equal(ops.length, 1, 'send() should issue exactly one operation');
    assert.equal(countOf(ops, 'CreateSendTransaction'), 1);
    // The cache only short-circuits credential derivation — the node call
    // itself must still carry the fee limit every send gets.
    assert.equal((lastBody as { fee_limit_sat: string }).fee_limit_sat, '4294967296');
  });

  it('reports isSendReady false while preparing and true once resolved', async () => {
    const transactions = new Transactions(fakeClient('http://127.0.0.1:1'));

    const pending = transactions.prepareSend({ walletId: 'w1', password: PASSWORD });
    assert.equal(transactions.isSendReady('w1'), false, 'not ready while Argon2 is still running');

    await pending;
    assert.equal(transactions.isSendReady('w1'), true);

    transactions.forgetSend('w1');
    assert.equal(transactions.isSendReady('w1'), false);
  });

  it('does not reuse a prepared macaroon for a send() with a different password', async () => {
    const host = await startNode([{ result: { status: 'SUCCEEDED' } }]);
    const { client, ops } = withCallLog(fakeClient(host));
    const transactions = new Transactions(client);

    await transactions.prepareSend({ walletId: 'w1', password: PASSWORD });
    ops.length = 0;

    await assert.rejects(
      transactions.send({
        walletId: 'w1',
        password: 'a-different-password',
        destination: { bolt11: 'lnbc1xyz' },
      }),
      /admin macaroon/,
    );
    assert.equal(
      countOf(ops, 'GetWalletNodePermissions'),
      1,
      'different credentials must re-derive rather than hit the cache',
    );
  });

  it('marks a sandbox wallet ready without a password', async () => {
    const transactions = new Transactions(fakeClient('http://127.0.0.1:1', 'SANDBOX'));

    await transactions.prepareSend({ walletId: 'w1' });

    assert.equal(transactions.isSendReady('w1'), true);
  });

  it('keeps an already-prepared wallet after a send() with the wrong password fails', async () => {
    const host = await startNode([
      { result: { status: 'SUCCEEDED', payment_hash: 'ph', fee_sat: '1' } },
    ]);
    const { client, ops } = withCallLog(fakeClient(host));
    const transactions = new Transactions(client);

    await transactions.prepareSend({ walletId: 'w1', password: PASSWORD });

    await assert.rejects(
      transactions.send({
        walletId: 'w1',
        password: 'a-different-password',
        destination: { bolt11: 'lnbc1xyz' },
      }),
      /admin macaroon/,
    );
    assert.equal(
      transactions.isSendReady('w1'),
      true,
      "one caller's bad password must not evict a working prepared wallet",
    );

    ops.length = 0;
    const result = await transactions.send({
      walletId: 'w1', // still no password — the surviving macaroon is used
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.ok(result.payment);
    assert.equal(countOf(ops, 'GetWalletNodePermissions'), 0, 'the survivor must still be cached');
    assert.equal(ops.length, 1, 'send() should issue exactly one operation');
  });

  it("reuses the prepared context when send() passes the wallet's own teamId", async () => {
    const host = await startNode([
      { result: { status: 'SUCCEEDED', payment_hash: 'ph', fee_sat: '1' } },
    ]);
    const { client, ops } = withCallLog(fakeClient(host));
    const transactions = new Transactions(client);

    // Prepared without teamId, so it is resolved from the wallet.
    await transactions.prepareSend({ walletId: 'w1', password: PASSWORD });
    ops.length = 0;

    const result = await transactions.send({
      walletId: 'w1',
      password: PASSWORD,
      teamId: TEAM_ID, // the same id prepareSend resolved — identical credentials
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.ok(result.payment);
    assert.equal(
      countOf(ops, 'GetWalletSendContext'),
      0,
      'identical credentials must not re-derive',
    );
    assert.equal(countOf(ops, 'GetWalletNodePermissions'), 0);
    assert.equal(ops.length, 1, 'send() should issue exactly one operation');
  });
});
