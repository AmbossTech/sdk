import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { afterEach, describe, it } from 'node:test';

import { PaymentSendError } from '../errors.js';
import { sendLndPayment } from './lnd.js';
import type { PaymentLifecycleStatus } from './types.js';

let server: Server | undefined;

afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
  server = undefined;
});

async function startServer(
  handler: (req: IncomingMessage, res: ServerResponse) => void,
): Promise<{ host: string; lastMacaroonHeader: () => string | undefined }> {
  let lastMacaroon: string | undefined;
  server = createServer((req, res) => {
    lastMacaroon = req.headers['grpc-metadata-macaroon'] as string | undefined;
    handler(req, res);
  });
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('no server address');
  return { host: `http://127.0.0.1:${addr.port}`, lastMacaroonHeader: () => lastMacaroon };
}

function writeLines(res: ServerResponse, lines: object[]): void {
  res.writeHead(200, { 'content-type': 'application/json' });
  for (const line of lines) res.write(`${JSON.stringify(line)}\n`);
  res.end();
}

describe('sendLndPayment', () => {
  it('streams updates and resolves on the terminal SUCCEEDED line', async () => {
    const { host, lastMacaroonHeader } = await startServer((_req, res) =>
      writeLines(res, [
        { result: { status: 'IN_FLIGHT' } },
        { result: { status: 'SUCCEEDED', payment_hash: 'abc', payment_preimage: 'def', fee_sat: '3' } },
      ]),
    );

    const seen: PaymentLifecycleStatus[] = [];
    const result = await sendLndPayment({
      restHost: host,
      // base64 macaroon → should be sent as hex
      macaroon: Buffer.from([0x02, 0x01, 0x03]).toString('base64'),
      body: { payment_request: 'lnbc1', fee_limit_sat: '10', timeout_seconds: 60 },
      onUpdate: (s) => seen.push(s),
    });

    assert.deepEqual(result, {
      status: 'SUCCEEDED',
      paymentHash: 'abc',
      preimage: 'def',
      feeSat: '3',
      failureReason: undefined,
    });
    assert.deepEqual(seen, ['IN_FLIGHT', 'SUCCEEDED']);
    assert.equal(lastMacaroonHeader(), '020103');
  });

  it('throws PaymentSendError when the stream reports an error', async () => {
    const { host } = await startServer((_req, res) =>
      writeLines(res, [{ error: { code: 2, message: 'no route' } }]),
    );

    await assert.rejects(
      sendLndPayment({
        restHost: host,
        macaroon: '020103',
        body: { payment_request: 'lnbc1', fee_limit_sat: '10', timeout_seconds: 60 },
      }),
      (err: unknown) => err instanceof PaymentSendError && /no route/.test((err as Error).message),
    );
  });
});
