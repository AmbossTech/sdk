import type { GraphQLClient } from 'graphql-request';

import { AmbossClient, ApiError, NetworkError, type ResolvedClientConfig } from '@ambosstech/core';

import type { PaymentEvent } from '../types/webhooks.js';
import { parseSseStream } from './sseParser.js';
import { mintStreamToken } from './streamToken.js';
import type { StreamTokenScope } from './streamToken.types.js';
import type { WatchStreamOptions } from './streaming.types.js';

/**
 * Sent by the server (per the SSE design doc) as the final event before it
 * closes a stream for a reason other than transaction-terminal state (e.g.
 * the 30-minute max stream lifetime). It carries no `PaymentEvent` payload,
 * so it's a signal to stop iterating rather than something to yield.
 */
const STREAM_CLOSED_EVENT = 'stream_closed';

/**
 * Mints a scoped stream token, opens the SSE connection, and yields each
 * `PaymentEvent` the server sends. Shared by `Transactions.watch` and
 * `Wallets.watchEvents` — same mechanism, different scope/endpoint.
 *
 * Ends (the generator returns) when the server closes the connection —
 * either after a transaction reaches a terminal status or after the max
 * stream lifetime. An aborted `options.signal`, a pre-stream HTTP rejection
 * (401/404), or a transport failure all reject instead, as `ApiError` /
 * `NetworkError` — the same error types every other resource method throws.
 */
export async function* watchPaymentEventStream(
  graphqlClient: GraphQLClient,
  config: Pick<ResolvedClientConfig, 'baseUrl' | 'fetch'>,
  scope: StreamTokenScope,
  streamPath: string,
  id: string,
  options?: WatchStreamOptions,
): AsyncGenerator<PaymentEvent, void, void> {
  const { token } = await mintStreamToken(graphqlClient, scope, id);

  // The stream endpoints are plain HTTP routes on the same origin as the
  // GraphQL endpoint (e.g. `.../graphql` -> `.../payments/stream/...`), not
  // part of the GraphQL schema.
  const url = new URL(streamPath, new URL(config.baseUrl).origin);

  let response: Response;
  try {
    response = await config.fetch(url, {
      // A fetch-based client can set headers (unlike browser `EventSource`),
      // so prefer the header over `?token=` — the design doc calls this out
      // as the lower-exposure option (query strings land in access/proxy
      // logs; the header doesn't).
      headers: { authorization: `Bearer ${token}`, accept: 'text/event-stream' },
      signal: options?.signal,
    });
  } catch (err) {
    throw AmbossClient.translateError(err);
  }

  if (!response.ok) {
    // Rejected before the stream opens (401 missing/invalid token, 404
    // wrong scope/id/environment) — per the design doc, both come back as a
    // plain JSON body, not an SSE event.
    const body: unknown = await response.json().catch(() => undefined);
    const message =
      (body as { error?: string } | undefined)?.error ??
      `Stream request failed with HTTP ${response.status}`;
    throw new ApiError({ message, status: response.status, response: body });
  }
  if (!response.body) {
    throw new NetworkError('Stream response has no body', undefined);
  }

  try {
    for await (const parsedEvent of parseSseStream(response.body)) {
      if (parsedEvent.event === STREAM_CLOSED_EVENT) return;
      if (!parsedEvent.data) continue;

      let paymentEvent: PaymentEvent;
      try {
        paymentEvent = JSON.parse(parsedEvent.data) as PaymentEvent;
      } catch (err) {
        throw new NetworkError('Received malformed SSE payment event payload', err);
      }
      yield paymentEvent;
    }
  } catch (err) {
    // Covers a mid-stream transport failure and an aborted `options.signal`
    // (the fetch body read rejects with `AbortError`) — translated the same
    // way as the pre-stream fetch above, so every failure mode of `watch`/
    // `watchEvents` surfaces as `ApiError`/`NetworkError`.
    if (err instanceof ApiError || err instanceof NetworkError) throw err;
    throw AmbossClient.translateError(err);
  }
}
