/**
 * Manual smoke test for the @ambosstech/payments SDK streaming flow.
 *
 * Run from packages/payments (Node 24 runs .ts directly):
 *   node --env-file=examples/.env examples/watch.ts
 * or with tsx:
 *   pnpm exec tsx --env-file=examples/.env examples/watch.ts
 *
 * Behaviour:
 *  1. If TRANSACTION_ID is unset, mints a Lightning invoice via
 *     transactions.createReceive (same as receive.ts -- needs WALLET_ID) and
 *     watches that.
 *  2. If TRANSACTION_ID is set, watches it directly.
 *  3. Opens an SSE connection via transactions.watch and logs each
 *     PaymentEvent as it arrives.
 *
 * This blocks until the server closes the stream -- the transaction reaches a
 * terminal status (COMPLETED/FAILED/EXPIRED) or the token's 30-minute max
 * stream lifetime elapses. Ctrl-C to exit early.
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

  let transactionId = process.env.TRANSACTION_ID;

  if (!transactionId) {
    const walletId = required('WALLET_ID'); // needed to mint an invoice to watch
    const amount = process.env.RECEIVE_AMOUNT_SATS ?? '1000';

    console.log('--- no TRANSACTION_ID set, minting an invoice to watch ---');
    const transaction = await payments.transactions.createReceive({
      wallet_id: walletId,
      amount,
    });
    transactionId = transaction.id;
    console.log('payment_request:', transaction.payment_request);
  }

  console.log(`\n--- watching transaction ${transactionId} ---`);
  console.log(
    '(waiting for events; blocks until the transaction settles/expires or the stream closes)\n',
  );

  try {
    for await (const event of payments.transactions.watch(transactionId)) {
      console.log(`[${new Date().toISOString()}] ${event.event_type}`, JSON.stringify(event.data));
    }
    console.log('\n--- stream closed ---');
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
