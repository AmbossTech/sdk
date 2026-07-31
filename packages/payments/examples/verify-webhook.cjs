/**
 * Real CJS example for @ambosstech/payments' webhook verification — and the
 * CI check for the CJS half of the dual build (see verify-webhook.mjs for
 * the ESM half). Unlike send.ts/receive.ts this needs no live API key:
 * HMAC verification is fully offline, so it can run in CI against nothing
 * but the built `dist-cjs/` output.
 *
 * Run from packages/payments (after `pnpm build`):
 *   node examples/verify-webhook.cjs
 */
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');

const {
  AmbossSdkError,
  DecryptionError,
  Environments,
  Payments,
  Transactions,
  Wallets,
  WebhookVerificationError,
} = require('@ambosstech/payments');

// 1. Class hierarchy resolves correctly across the payments/core package
//    boundary (catches a dual-package hazard if dist and dist-cjs ever
//    both end up loaded for the same process).
const payments = new Payments({ serviceApiKey: 'smoke_test_key' });
assert.ok(payments.environments instanceof Environments);
assert.ok(payments.wallets instanceof Wallets);
assert.ok(payments.transactions instanceof Transactions);
assert.ok(new DecryptionError('x') instanceof AmbossSdkError);

// 2. Real usage: verify a webhook event signed the same way Amboss signs
//    outgoing webhooks (see README.md "Signature algorithm"). verify() only
//    checks the signature and JSON-parses the body — it does not validate
//    the body's shape against PaymentEvent, so `data: null` below is fine
//    for this smoke check even though the real type is non-nullable.
const secret = 'whsec_example';
const timestamp = String(Math.floor(Date.now() / 1000));
const payload = JSON.stringify({
  id: 'evt_1',
  event_type: 'payment.completed',
  wallet_id: 'wallet_1',
  environment_id: 'env_1',
  environment: 'sandbox',
  node_id: null,
  data: null,
});
const signature = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');

const event = Payments.webhooks.verify({ secret, payload, signature, timestamp });
assert.equal(event.event_type, 'payment.completed');

assert.throws(
  () => Payments.webhooks.verify({ secret: 'wrong-secret', payload, signature, timestamp }),
  WebhookVerificationError,
);

console.log('✅ CJS: @ambosstech/payments resolved from dist-cjs/ and verified a webhook');
