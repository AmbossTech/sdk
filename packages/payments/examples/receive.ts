/**
 * Manual smoke test for the @ambosstech/payments SDK receive flow.
 *
 * Run from packages/payments (Node 24 runs .ts directly):
 *   node --env-file=examples/.env examples/receive.ts
 * or with tsx:
 *   pnpm exec tsx --env-file=examples/.env examples/receive.ts
 *
 * Behaviour:
 *  1. If WALLET_ID is unset, lists your environments + wallets so you can grab one.
 *  2. If WALLET_ID is set, mints a Lightning invoice via transactions.createReceive
 *     and prints the BOLT11 payment_request to pay.
 *
 * Unlike sending, receiving needs no team password or macaroon — the backend
 * mints the invoice on the node. Works the same for sandbox and live wallets.
 *
 * Copy examples/.env.example -> examples/.env and fill it in. Do NOT commit .env.
 */
import { Payments, ApiError } from '@ambosstech/payments';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  const serviceApiKey = required('AMBOSS_API_KEY'); // the scoped payments service key (amb_live...)
  const baseUrl = process.env.AMBOSS_BASE_URL; // optional; defaults to https://rails.amboss.tech/graphql

  const payments = new Payments({ serviceApiKey, ...(baseUrl ? { baseUrl } : {}) });

  const walletId = process.env.WALLET_ID;

  // No wallet chosen yet — list environments + wallets so you can pick one.
  if (!walletId) {
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
    console.log('\nSet WALLET_ID (and optionally RECEIVE_AMOUNT_SATS) to mint an invoice.');
    return;
  }

  const amount = process.env.RECEIVE_AMOUNT_SATS ?? '1000'; // base unit (sats for BTC)
  const description = process.env.RECEIVE_DESCRIPTION;

  console.log('\n--- creating receive invoice ---');
  console.log('walletId:', walletId, '| amount:', amount);

  try {
    const transaction = await payments.transactions.createReceive({
      wallet_id: walletId,
      amount,
      ...(description ? { description } : {}),
    });
    console.log('\n✅ invoice created');
    console.log('payment_request:', transaction.payment_request);
    console.log('payment_hash:', transaction.payment_hash);
    console.log('transaction:', JSON.stringify(transaction, null, 2));
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('\n❌ API error:', error.status, error.message, error.graphqlErrors);
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
