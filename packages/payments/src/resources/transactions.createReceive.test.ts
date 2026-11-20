import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { GraphQLClient } from 'graphql-request';

import { Transactions } from './transactions.js';

const CHECKOUT = {
  id: 'co1',
  url: 'https://ambosspay.com/checkout/co1',
  success_url: 'https://shop.example.com/thanks',
  return_url: null,
  style_id: null,
};

type Call = { document: string; variables: unknown };

function fakeClient(): { client: GraphQLClient; calls: Call[] } {
  const calls: Call[] = [];
  const request = async (call: Call): Promise<unknown> => {
    calls.push(call);
    return {
      payment: {
        transaction: {
          create_receive: { id: 'tx1', wallet_id: 'w1', status: 'PENDING', checkout: CHECKOUT },
        },
      },
    };
  };
  return { client: { request } as unknown as GraphQLClient, calls };
}

describe('Transactions.createReceive', () => {
  it('creates a checkout link and returns its url', async () => {
    const { client, calls } = fakeClient();
    const transactions = new Transactions(client);
    const input = {
      wallet_id: 'w1',
      amount: '21000',
      checkout: { success_url: 'https://shop.example.com/thanks' },
    };

    const result = await transactions.createReceive(input);

    assert.equal(result.checkout?.url, CHECKOUT.url);
    assert.deepEqual(calls[0]?.variables, { input });
    assert.match(calls[0]?.document ?? '', /checkout\s*{\s*\.\.\.PaymentsCheckoutFields/);
  });
});
