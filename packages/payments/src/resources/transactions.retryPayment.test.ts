import assert from 'node:assert/strict';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { afterEach, describe, it } from 'node:test';

import { argon2id } from '@noble/hashes/argon2';
import { bytesToHex } from '@noble/hashes/utils';
import type { GraphQLClient } from 'graphql-request';

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
  server = createServer(async (req, res: ServerResponse) => {
    for await (const _chunk of req) void _chunk;
    res.writeHead(200, { 'content-type': 'application/json' });
    for (const line of lines) res.write(`${JSON.stringify(line)}\n`);
    res.end();
  });
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('no address');
  return `http://127.0.0.1:${addr.port}`;
}

/** Fake GraphQLClient that answers the operations prepareSend()/retryPayment() issue. */
function fakeClient(
  restHost: string,
  environmentType: 'LIVE' | 'SANDBOX' = 'LIVE',
  findOneTransaction: object = {
    id: 'tx1',
    wallet_id: 'w1',
    status: 'FAILED',
    payment_request: 'lnbc1xyz',
  },
): GraphQLClient {
  const masterKey = bytesToHex(argon2id(PASSWORD, TEAM_ID, { dkLen: 32, t: 3, m: 64000, p: 4 }));
  const encrypted_symmetric_key = nip44Encrypt(SYMMETRIC_KEY, masterKey);
  const encrypted_macaroon = nip44Encrypt(MACAROON_HEX, SYMMETRIC_KEY);

  const request = async (arg: { document: string } | string): Promise<unknown> => {
    const document = typeof arg === 'string' ? arg : arg.document;
    if (document.includes('GetTransaction')) {
      return { payment: { transaction: { find_one: findOneTransaction } } };
    }
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
        payment: { transaction: { create_send: findOneTransaction } },
      };
    }
    throw new Error(`unexpected document: ${document.slice(0, 40)}`);
  };

  return { request } as unknown as GraphQLClient;
}

describe('Transactions.retryPayment', () => {
  it("resends the FAILED transaction's own payment_request via create_send, using a prepared macaroon", async () => {
    const host = await startNode([{ result: { status: 'SUCCEEDED', payment_hash: 'ph2' } }]);
    const transactions = new Transactions(fakeClient(host));

    await transactions.prepareSend({ walletId: 'w1', password: PASSWORD });
    const result = await transactions.retryPayment('tx1');

    assert.ok(result.payment);
    assert.equal(result.payment.status, 'SUCCEEDED');
    assert.equal(result.payment.paymentHash, 'ph2');
    assert.equal(result.transaction.payment_request, 'lnbc1xyz');
  });

  it('throws PaymentSendError for a live wallet with no prepared macaroon', async () => {
    const host = await startNode([]);
    const transactions = new Transactions(fakeClient(host));

    await assert.rejects(transactions.retryPayment('tx1'), /password/);
  });

  it('returns payment: null for a sandbox wallet without preparing anything', async () => {
    const host = await startNode([]);
    const transactions = new Transactions(fakeClient(host, 'SANDBOX'));

    const result = await transactions.retryPayment('tx1');

    assert.equal(result.payment, null);
    assert.equal(result.transaction.id, 'tx1');
  });

  it('throws PaymentSendError when the transaction is not FAILED', async () => {
    const host = await startNode([]);
    const transactions = new Transactions(
      fakeClient(host, 'LIVE', {
        id: 'tx1',
        wallet_id: 'w1',
        status: 'PENDING',
        payment_request: 'lnbc1xyz',
      }),
    );

    await assert.rejects(transactions.retryPayment('tx1'), /not retryable/);
  });

  it('throws PaymentSendError when the invoice has expired', async () => {
    const host = await startNode([]);
    const transactions = new Transactions(
      fakeClient(host, 'LIVE', {
        id: 'tx1',
        wallet_id: 'w1',
        status: 'FAILED',
        payment_request: 'lnbc1xyz',
        expires_at: new Date(Date.now() - 60_000).toISOString(),
      }),
    );

    await assert.rejects(transactions.retryPayment('tx1'), /expired/);
  });

  it('throws PaymentSendError when the transaction has no payment_request', async () => {
    const host = await startNode([]);
    const transactions = new Transactions(
      fakeClient(host, 'LIVE', { id: 'tx1', wallet_id: 'w1', status: 'FAILED' }),
    );

    await assert.rejects(transactions.retryPayment('tx1'), /payment_request/);
  });
});
