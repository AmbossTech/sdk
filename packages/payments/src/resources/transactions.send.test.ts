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
afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
  server = undefined;
});

async function startNode(lines: object[]): Promise<string> {
  server = createServer((_req, res: ServerResponse) => {
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
function fakeClient(restHost: string, environmentType: 'LIVE' | 'SANDBOX' = 'LIVE'): GraphQLClient {
  const masterKey = deriveMasterKey(PASSWORD, TEAM_ID);
  const encrypted_symmetric_key = nip44Encrypt(SYMMETRIC_KEY, masterKey);
  const encrypted_macaroon = nip44Encrypt(MACAROON_HEX, SYMMETRIC_KEY);

  const request = async ({ document }: { document: string }): Promise<unknown> => {
    if (document.includes('GetWalletEnvironmentType')) {
      return {
        payment: {
          wallet: { find_one: { id: 'w1', environment: { id: 'e1', type: environmentType } } },
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
    if (document.includes('GetTeamId')) {
      return { user: { id: 'u1', team: { id: TEAM_ID } } };
    }
    if (document.includes('CreateSendTransaction')) {
      return {
        payment: {
          transaction: {
            create_send: { id: 'tx1', status: 'PENDING', payment_request: 'lnbc1xyz' },
          },
        },
      };
    }
    throw new Error(`unexpected document: ${document.slice(0, 40)}`);
  };

  return { request } as unknown as GraphQLClient;
}

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
      feeLimitSats: '10',
      destination: { bolt11: 'lnbc1xyz' },
      onUpdate: (p) => statuses.push(p.status),
    });

    assert.ok(result.payment); // live wallet pays over the node
    assert.equal(result.payment.status, 'SUCCEEDED');
    assert.equal(result.payment.paymentHash, 'ph');
    assert.equal(result.transaction.payment_request, 'lnbc1xyz');
    assert.deepEqual(statuses, ['IN_FLIGHT', 'SUCCEEDED']);
  });

  it('creates a sandbox send without a password and returns payment: null', async () => {
    // No node should be contacted for sandbox — point at an unroutable host
    // so any accidental node call would fail the test.
    const transactions = new Transactions(fakeClient('http://127.0.0.1:1', 'SANDBOX'));

    const result = await transactions.send({
      walletId: 'w1',
      feeLimitSats: '10',
      destination: { bolt11: 'lnbc1xyz' },
    });

    assert.equal(result.payment, null);
    assert.equal(result.transaction.payment_request, 'lnbc1xyz');
  });

  it('throws a helpful error when teamId is unresolvable (service API key only)', async () => {
    // canResolveTeamId=false ⇒ no `user` query available; teamId must be passed.
    const transactions = new Transactions(fakeClient('http://127.0.0.1:1'), false);

    await assert.rejects(
      transactions.send({
        walletId: 'w1',
        password: PASSWORD,
        feeLimitSats: '10',
        destination: { bolt11: 'lnbc1xyz' },
      }),
      /teamId is required .* service API key/,
    );
  });

  it('surfaces a wrong password as a DecryptionError before paying', async () => {
    const host = await startNode([{ result: { status: 'SUCCEEDED' } }]);
    const transactions = new Transactions(fakeClient(host));

    await assert.rejects(
      transactions.send({
        walletId: 'w1',
        password: 'wrong-password',
        feeLimitSats: '10',
        destination: { bolt11: 'lnbc1xyz' },
      }),
      /admin macaroon/,
    );
  });
});
