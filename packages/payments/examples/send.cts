/**
 * CJS type-check example for @ambosstech/payments' send flow — the
 * compile-only counterpart to send.ts. Written as `require()`-based
 * CommonJS TypeScript (`.cts` forces CJS module/resolution semantics under
 * `moduleResolution: NodeNext`, so the `@ambosstech/payments` import below
 * resolves via the package's `require` export condition against the built
 * `dist-cjs/` declarations).
 *
 * Like send.ts, running this for real would attempt a live Lightning
 * payment — so this file is only type-checked in CI, never executed:
 *   pnpm exec tsc --noEmit -p tsconfig.examples.cjs.json
 */
import type * as PaymentsModule from '@ambosstech/payments';

const { Payments, PaymentSendError, DecryptionError } =
  require('@ambosstech/payments') as typeof PaymentsModule;

async function send(): Promise<void> {
  const payments = new Payments({ serviceApiKey: 'amb_live_example' });

  const destination: PaymentsModule.SendDestination = { bolt11: 'lnbc1...' };
  const params: PaymentsModule.SendParams = {
    walletId: 'wallet_1',
    password: 'team-password',
    destination,
    onUpdate: (progress: PaymentsModule.SendProgress) => console.log('status:', progress.status),
  };

  try {
    const result = await payments.transactions.send(params);
    console.log(result.transaction);
  } catch (error) {
    if (error instanceof DecryptionError) {
      console.error('macaroon decryption failed:', error.message);
    } else if (error instanceof PaymentSendError) {
      console.error('send failed:', error.message);
    } else {
      console.error('unexpected error:', error);
    }
  }
}

send().catch((error: unknown) => console.error(error));
