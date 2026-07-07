import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@ambosstech/core';

import { Payments } from '../client.js';

describe('resource error translation', () => {
  it('translates a GraphQL error from a resource call into ApiError', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ errors: [{ message: 'boom' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    const payments = new Payments({ serviceApiKey: 'amb_live_test', fetch: fetchImpl });

    await assert.rejects(
      () => payments.environments.list(),
      (err: unknown) => err instanceof ApiError && err.message === 'boom',
    );
  });
});
