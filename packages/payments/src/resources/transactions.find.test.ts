import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { GraphQLClient } from 'graphql-request';

import { Transactions } from './transactions.js';

/** Fake GraphQLClient that answers GetTransaction / ListTransactions. */
function fakeClient(): { client: GraphQLClient; ops: string[] } {
  const ops: string[] = [];
  const request = async ({ document }: { document: string }): Promise<unknown> => {
    ops.push(document);
    if (document.includes('GetTransaction')) {
      return {
        payment: {
          transaction: {
            find_one: { id: 'tx1', wallet_id: 'w1', status: 'COMPLETED' },
          },
        },
      };
    }
    if (document.includes('ListTransactions')) {
      return {
        payment: {
          transaction: {
            find_many: {
              list: [{ id: 'tx1', wallet_id: 'w1', status: 'COMPLETED' }],
              pagination: { limit: 20, offset: 0 },
              total_count: 1,
            },
          },
        },
      };
    }
    throw new Error(`unexpected document: ${document.slice(0, 40)}`);
  };
  return { client: { request } as unknown as GraphQLClient, ops };
}

describe('Transactions.findOne', () => {
  it('calls GetTransaction and returns the transaction', async () => {
    const { client, ops } = fakeClient();
    const transactions = new Transactions(client);

    const result = await transactions.findOne('tx1');

    assert.equal(result.id, 'tx1');
    assert.ok(ops.some((document) => document.includes('GetTransaction')));
  });
});

describe('Transactions.findMany', () => {
  it('calls ListTransactions and returns list, pagination, and total_count', async () => {
    const { client, ops } = fakeClient();
    const transactions = new Transactions(client);

    const result = await transactions.findMany({ wallet_id: 'w1' });

    assert.equal(result.total_count, 1);
    assert.equal(result.pagination.limit, 20);
    assert.equal(result.list.length, 1);
    assert.equal(result.list[0]?.id, 'tx1');
    assert.ok(ops.some((document) => document.includes('ListTransactions')));
  });
});
