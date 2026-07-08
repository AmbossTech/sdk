/**
 * Manual smoke test for the @ambosstech/payments SDK send flow.
 *
 * Run from packages/payments (Node 24 runs .ts directly):
 *   node --env-file=examples/.env examples/send.ts
 * or with tsx:
 *   pnpm exec tsx --env-file=examples/.env examples/send.ts
 *
 * Behaviour:
 *  1. Always lists your environments + wallets (a read-only check that the API key works).
 *  2. If WALLET_ID + TEAM_PASSWORD + a destination are set, performs a real send.
 *
 * Copy examples/.env.example -> examples/.env and fill it in. Do NOT commit .env.
 */
import {
  Payments,
  PaymentSendError,
  DecryptionError,
  type SendDestination,
  type SendParams,
  type SendProgress,
} from '@ambosstech/payments';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function resolveDestination(): SendDestination | null {
  const bolt11 = process.env.BOLT11;
  const lightningAddress = process.env.LIGHTNING_ADDRESS;
  const amountSats = process.env.AMOUNT_SATS;

  if (bolt11) {
    return amountSats ? { bolt11, amountSats } : { bolt11 };
  }
  if (lightningAddress) {
    if (!amountSats) {
      console.error('LIGHTNING_ADDRESS requires AMOUNT_SATS.');
      process.exit(1);
    }
    return { lightningAddress, amountSats };
  }
  return null;
}

async function main(): Promise<void> {
  const serviceApiKey = required('AMBOSS_API_KEY'); // the scoped payments service key (amb_live...)
  const baseUrl = process.env.AMBOSS_BASE_URL; // optional; defaults to https://rails.amboss.tech/graphql

  const payments = new Payments({ serviceApiKey, ...(baseUrl ? { baseUrl } : {}) });

  // 1. Read-only discovery — confirms the API key works and surfaces wallet ids.
  console.log('--- environments & wallets ---');
  const environments = await payments.environments.list();
  if (environments.length === 0) {
    console.log('(no environments found for this API key)');
  }
  for (const environment of environments) {
    console.log(`${environment.name} (${environment.type}) — ${environment.id}`);
    const wallets = await payments.wallets.list({ environmentId: environment.id });
    for (const wallet of wallets) {
      console.log(`  ${wallet.name} [${wallet.asset.symbol}] — ${wallet.id}`);
    }
  }

  // 2. Optional send.
  const destination = resolveDestination();
  const walletId = process.env.WALLET_ID;
  const password = process.env.TEAM_PASSWORD;

  // Live wallets need TEAM_PASSWORD; sandbox wallets do not (the backend
  // settles the send itself — set IDEMPOTENCY_KEY/metadata as needed).
  if (!walletId || !destination) {
    console.log(
      '\nSkipping send — set WALLET_ID and a destination ' +
        '(BOLT11, or LIGHTNING_ADDRESS + AMOUNT_SATS) to send. ' +
        'Live wallets also need TEAM_PASSWORD.',
    );
    return;
  }

  const params: SendParams = {
    walletId,
    ...(password ? { password } : {}),
    feeLimitSats: process.env.FEE_LIMIT_SATS ?? '10',
    destination,
    ...(process.env.TEAM_ID ? { teamId: process.env.TEAM_ID } : {}),
    ...(process.env.IDEMPOTENCY_KEY ? { idempotencyKey: process.env.IDEMPOTENCY_KEY } : {}),
    ...(process.env.TIMEOUT_SECONDS ? { timeoutSeconds: Number(process.env.TIMEOUT_SECONDS) } : {}),
    onUpdate: (progress: SendProgress) => console.log('  status:', progress.status),
  };

  console.log('\n--- sending ---');
  console.log('destination:', JSON.stringify(destination), '| feeLimitSats:', params.feeLimitSats);

  await new Promise((r) => setTimeout(r, 5_000));

  try {
    const result = await payments.transactions.send(params);
    if (result.payment === null) {
      console.log('\n✅ sandbox send created — backend settles it asynchronously');
      console.log(
        '   (set metadata amb_sandbox_behavior=complete|fail|expire to control the outcome)',
      );
    } else {
      console.log('\n✅ send complete');
      console.log('payment:', JSON.stringify(result.payment, null, 2));
    }
    console.log('transaction:', JSON.stringify(result.transaction, null, 2));
  } catch (error) {
    if (error instanceof DecryptionError) {
      console.error('\n❌ macaroon decryption failed — check TEAM_PASSWORD:', error.message);
    } else if (error instanceof PaymentSendError) {
      console.error('\n❌ send failed:', error.message);
    } else {
      console.error('\n❌ unexpected error:', error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
