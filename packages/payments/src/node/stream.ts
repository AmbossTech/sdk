import { Agent, fetch } from 'undici';

import { PaymentSendError } from '../errors.js';
import { normalizeStringToHex } from '../crypto/normalizeStringToHex.js';

/**
 * Builds an undici dispatcher that trusts the node's self-signed TLS cert as a
 * CA. Lightning nodes typically present self-signed certs; when one is provided
 * we pin it, otherwise we fall back to the default dispatcher (system trust).
 */
function buildDispatcher(tlsCert?: string | null): Agent | undefined {
  if (!tlsCert) return undefined;
  return new Agent({ connect: { ca: tlsCert } });
}

export interface PaymentStreamParams {
  url: string;
  macaroon: string;
  body: unknown;
  tlsCert?: string | null;
  signal?: AbortSignal;
}

/**
 * POSTs to a node REST endpoint and consumes the newline-delimited JSON stream,
 * invoking `onLine` with each parsed update. The macaroon is sent hex-encoded in
 * the `Grpc-Metadata-macaroon` header (litd/LND convention). Returns once the
 * stream ends; the caller decides which line is terminal.
 *
 * Ported from amboss-rails `src/network/api/lnd|lit/index.ts` (the streaming
 * loop), minus React, with TLS handling for Node.
 */
export async function postPaymentStream<TUpdate>(
  params: PaymentStreamParams,
  onLine: (update: TUpdate) => void,
): Promise<void> {
  const { url, macaroon, body, tlsCert, signal } = params;
  const dispatcher = buildDispatcher(tlsCert);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Grpc-Metadata-macaroon': normalizeStringToHex(macaroon),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
    ...(dispatcher ? { dispatcher } : {}),
  });

  if (!response.body) {
    throw new PaymentSendError('Payment stream returned no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        // The gateway emits one JSON object per line; skip anything unparseable
        // rather than aborting an in-flight payment on a stray chunk.
        let parsed: TUpdate;
        try {
          parsed = JSON.parse(line) as TUpdate;
        } catch {
          continue;
        }
        onLine(parsed);
      }
    }
  } finally {
    await dispatcher?.close();
  }
}
