/**
 * CJS type-check example for @ambosstech/payments' streaming flow -- the
 * compile-only counterpart to watch.ts. Written as `require()`-based
 * CommonJS TypeScript (`.cts` forces CJS module/resolution semantics under
 * `moduleResolution: NodeNext`, so the `@ambosstech/payments` import below
 * resolves via the package's `require` export condition against the built
 * `dist-cjs/` declarations).
 *
 * Like watch.ts, running this for real would mint a live invoice and open a
 * live SSE connection -- so this file is only type-checked in CI, never
 * executed:
 *   pnpm exec tsc --noEmit -p tsconfig.examples.cjs.json
 */
import type * as PaymentsModule from '@ambosstech/payments';

const { Payments, ApiError } = require('@ambosstech/payments') as typeof PaymentsModule;

async function watch(): Promise<void> {
  const payments = new Payments({ serviceApiKey: 'amb_live_example' });

  const transaction = await payments.transactions.createReceive({
    wallet_id: 'wallet_1',
    amount: '1000',
  });

  try {
    for await (const event of payments.transactions.watch(transaction.id)) {
      console.log(event.event_type, event.data);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API error:', error.status, error.message, error.graphqlErrors);
    } else {
      console.error('unexpected error:', error);
    }
  }
}

watch().catch((error: unknown) => console.error(error));
