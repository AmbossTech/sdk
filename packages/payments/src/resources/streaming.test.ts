import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError, NetworkError } from '@ambosstech/core';

import { Payments } from '../client.js';
import type { PaymentEvent } from '../types/webhooks.js';

const MINT_RESPONSE = {
  payment: {
    stream_token: { mint: { token: 'stream-tok-abc', expires_at: '2099-01-01T00:00:00Z' } },
  },
};

/**
 * Fake `fetch` shared by the mint (GraphQL POST) and stream (plain GET) legs
 * of `watch`/`watchEvents`. Routes on the URL so both calls can be answered
 * from one client, and records the stream request's headers for assertions.
 */
function buildFetch(opts: {
  streamBody: string | ReadableStream<Uint8Array>;
  streamStatus?: number;
  streamHeaders?: Record<string, string>;
  onStreamRequest?: (headers: Headers) => void;
}): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
    if (url.includes('/payments/stream/')) {
      if (init?.signal?.aborted) {
        throw new DOMException('The operation was aborted.', 'AbortError');
      }
      opts.onStreamRequest?.(new Headers(init?.headers));
      return new Response(opts.streamBody, {
        status: opts.streamStatus ?? 200,
        headers: { 'content-type': 'text/event-stream', ...opts.streamHeaders },
      });
    }
    return new Response(JSON.stringify({ data: MINT_RESPONSE }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) items.push(item);
  return items;
}

const SAMPLE_EVENT: PaymentEvent = {
  id: 'payment.completed:tx1',
  event_type: 'payment.completed',
  environment: 'production',
  environment_id: 'env_1',
  wallet_id: 'wal_1',
  node_id: null,
  data: {
    id: 'tx1',
    fee: null,
    amount: { amount: '1000', asset_id: 'btc', precision: 0, asset_symbol: 'BTC' },
    status: 'completed',
    metadata: null,
    direction: 'receive',
    expires_at: null,
    settled_at: '2026-01-01T00:00:00Z',
    description: null,
    exchange_rate: null,
    settle_amount: { amount: '1000', asset_id: 'btc', precision: 0, asset_symbol: 'BTC' },
    payment_details: { payment_hash: 'hash1', payment_type: 'bolt11', payment_request: 'lnbc1' },
  },
};

describe('Transactions.watch', () => {
  it('mints a stream token and yields each PaymentEvent from the SSE body', async () => {
    let sentAuth: string | null = null;
    const sse = `id: ${SAMPLE_EVENT.id}\nevent: ${SAMPLE_EVENT.event_type}\ndata: ${JSON.stringify(SAMPLE_EVENT)}\n\n`;
    const payments = new Payments({
      serviceApiKey: 'amb_live_test',
      fetch: buildFetch({
        streamBody: sse,
        onStreamRequest: (headers) => {
          sentAuth = headers.get('authorization');
        },
      }),
    });

    const events = await collect(payments.transactions.watch('tx1'));

    assert.deepEqual(events, [SAMPLE_EVENT]);
    assert.equal(sentAuth, 'Bearer stream-tok-abc');
  });

  it('stops without yielding a PaymentEvent for a stream_closed control event', async () => {
    const sse = `data: ${JSON.stringify(SAMPLE_EVENT)}\n\n` + `event: stream_closed\ndata: {}\n\n`;
    const payments = new Payments({
      serviceApiKey: 'amb_live_test',
      fetch: buildFetch({ streamBody: sse }),
    });

    const events = await collect(payments.transactions.watch('tx1'));

    assert.deepEqual(events, [SAMPLE_EVENT]);
  });

  it('throws ApiError when the stream endpoint rejects before opening (401/404)', async () => {
    const payments = new Payments({
      serviceApiKey: 'amb_live_test',
      fetch: buildFetch({
        streamBody: JSON.stringify({ error: 'unauthorized' }),
        streamStatus: 401,
        streamHeaders: { 'content-type': 'application/json' },
      }),
    });

    await assert.rejects(
      () => collect(payments.transactions.watch('tx1')),
      (err: unknown) =>
        err instanceof ApiError && err.status === 401 && err.message === 'unauthorized',
    );
  });
});

describe('Transactions.watch — abort', () => {
  it('rejects with NetworkError when options.signal aborts before the stream opens', async () => {
    const controller = new AbortController();
    controller.abort();
    const payments = new Payments({
      serviceApiKey: 'amb_live_test',
      fetch: buildFetch({ streamBody: '' }),
    });

    await assert.rejects(
      () => collect(payments.transactions.watch('tx1', { signal: controller.signal })),
      (err: unknown) => err instanceof NetworkError,
    );
  });
});

describe('Wallets.watchEvents', () => {
  it('mints a stream token and yields each PaymentEvent from the SSE body', async () => {
    const sse = `data: ${JSON.stringify(SAMPLE_EVENT)}\n\n`;
    const payments = new Payments({
      serviceApiKey: 'amb_live_test',
      fetch: buildFetch({ streamBody: sse }),
    });

    const events = await collect(payments.wallets.watchEvents('wal_1'));

    assert.deepEqual(events, [SAMPLE_EVENT]);
  });
});
