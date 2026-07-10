# Integrating Amboss Payments

A self-contained guide to accepting and sending Bitcoin Lightning payments
with [`@ambosstech/payments`](https://www.npmjs.com/package/@ambosstech/payments).
It covers everything from install to production checklist — you can also hand
this single file to an AI coding agent as the spec for your integration.

## What you get

- **Receive** — mint Lightning (BOLT11) invoices for any of your wallets.
- **Send** — pay BOLT11 invoices or Lightning addresses from your wallets.
- **Webhooks** — signed `payment.pending` / `payment.completed` /
  `payment.failed` events pushed to your endpoint.
- **Sandbox environments** — test the full flow with no real money and no
  Lightning node.

## Prerequisites

| Requirement                 | Where to get it                                                        |
| --------------------------- | ---------------------------------------------------------------------- |
| Node.js ≥ 18.18             | Uses native `fetch` and `crypto`; no polyfills needed.                 |
| Service API key             | Amboss dashboard → API keys. Sent as the `x-api-key` header.           |
| Webhook secret              | Amboss dashboard → webhook settings (only if you consume webhooks).    |
| Team password (sends only)  | Your team's password — used locally to decrypt the node macaroon.      |

```bash
npm install @ambosstech/payments   # or: pnpm add @ambosstech/payments
```

The package is ESM-only. `@ambosstech/core` comes along as a transitive
dependency — do not install it directly.

## Step 1 — Create the client

```ts
import { Payments } from '@ambosstech/payments';

const payments = new Payments({
  serviceApiKey: process.env.AMBOSS_API_KEY, // required for API calls
  webhookSecret: process.env.AMBOSS_WEBHOOK_SECRET, // required for webhook verify
});
```

All options:

```ts
new Payments({
  serviceApiKey?: string, // omit for webhook-only usage
  webhookSecret?: string, // omit if you only call the API
  baseUrl?: string,       // default: https://rails.amboss.tech/graphql
  fetch?: typeof fetch,   // override for tests / non-Node runtimes
  timeoutMs?: number,     // default: 30000
});
```

Keep both secrets in environment variables — never in source control.

## Step 2 — Find (or create) an environment and wallet

Environments separate sandbox from production. Wallets live inside an
environment and hold one asset (e.g. BTC).

```ts
// discover what you already have
const environments = await payments.environments.list();
const wallets = await payments.wallets.list({
  environmentId: environments[0].id,
});

// or create a sandbox environment to test in
const sandbox = await payments.environments.create({
  name: 'integration-tests',
  type: 'SANDBOX',
});
```

`wallets.list` returns trimmed records; `wallets.get(id)` returns the full
wallet including balance.

## Step 3 — Receive a payment

`createReceive` mints a BOLT11 Lightning invoice server-side. No node
credentials or password needed, and it works identically for sandbox and live
wallets.

```ts
const transaction = await payments.transactions.createReceive({
  wallet_id: walletId,
  amount: '1000', // in the wallet asset's base unit (sats for BTC)
  description: 'Order #1234', // optional
  expires_in_seconds: 3600, // optional
  idempotency_key: orderId, // optional but recommended — safe retries
});

transaction.payment_request; // BOLT11 invoice — show this to the payer (QR/link)
transaction.payment_hash; // correlate with the webhook event later
```

Do not poll for settlement — consume the `payment.completed` webhook (Step 5).

## Step 4 — Send a payment

`send` creates the transaction, decrypts your node's admin macaroon
**in-process** using the team password (the password never leaves your
process and is never sent to the API), then executes the payment against the
node and resolves with the terminal result.

```ts
const { transaction, payment } = await payments.transactions.send({
  walletId,
  password: process.env.TEAM_PASSWORD, // live wallets only
  teamId, // required with a service API key
  feeLimitSats: '50', // max routing fee you accept
  destination: { bolt11: 'lnbc1...' },
  // or: destination: { lightningAddress: 'user@domain.com', amountSats: '1000' }
  idempotencyKey: payoutId, // recommended — prevents double-sends on retry
  onUpdate: ({ status }) => console.log(status), // in-flight progress
});

payment.status; // 'SUCCEEDED' | 'FAILED'
payment.paymentHash;
```

Notes:

- For a **zero-amount** BOLT11 invoice, add `amountSats` to the destination.
- Base-asset wallets pay over LND; Taproot Asset wallets over litd — the SDK
  picks the endpoint from the wallet's asset automatically.
- Wrong password → `DecryptionError`. Node-side failure → `PaymentSendError`.

**Sandbox wallets** need no password and no node — the backend settles the
transaction asynchronously and `payment` resolves `null`. Control the outcome
with metadata and observe it via webhooks:

```ts
await payments.transactions.send({
  walletId: sandboxWalletId,
  feeLimitSats: '50',
  destination: { bolt11: 'lnbc1...' },
  metadata: { amb_sandbox_behavior: 'complete' }, // 'complete' | 'fail' | 'expire' (default)
});
```

## Step 5 — Consume webhooks

Amboss signs every webhook: HMAC-SHA256 over `${timestamp}.${rawBody}`, sent
in the `x-webhook-signature` and `x-webhook-timestamp` headers. `verify`
checks the signature (timing-safe) and timestamp tolerance (default 300s),
then returns the parsed, fully-typed event.

**Critical: verify against the RAW request body.** If your framework parses
JSON before your handler, re-serialized bytes will not match the signature.

```ts
// Express
import express from 'express';

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = payments.webhooks.verify({
      payload: req.body, // Buffer, thanks to express.raw
      signature: req.header('x-webhook-signature')!,
      timestamp: req.header('x-webhook-timestamp')!,
    });

    switch (event.event_type) {
      case 'payment.completed':
        // fulfill the order; correlate via event.data.payment_details.payment_hash
        break;
      case 'payment.failed':
        // mark as failed / retry
        break;
      case 'payment.pending':
        // optional: show "payment detected" state
        break;
    }
    res.sendStatus(200);
  } catch {
    res.sendStatus(400); // signature failed — do NOT process the body
  }
});
```

Other runtimes:

```ts
// NestJS (Express adapter): enable raw body capture at bootstrap
const app = await NestFactory.create(AppModule, { rawBody: true });
// then in the handler: payload: req.rawBody

// Fetch / Web-standard (Next.js route handlers, Cloudflare Workers, ...):
const event = payments.webhooks.verify({
  payload: await request.text(),
  signature: request.headers.get('x-webhook-signature')!,
  timestamp: request.headers.get('x-webhook-timestamp')!,
});
```

No client needed? Verify statelessly:

```ts
import { Payments } from '@ambosstech/payments';

const event = Payments.webhooks.verify({
  secret: process.env.AMBOSS_WEBHOOK_SECRET,
  payload: rawBody,
  signature,
  timestamp,
});
```

### Event shape

```ts
PaymentEvent {
  id: string;
  wallet_id: string;
  node_id: string | null;
  event_type: 'payment.pending' | 'payment.completed' | 'payment.failed';
  environment: 'sandbox' | 'production';
  environment_id: string;
  data: {
    id: string;
    amount: AssetAmount;            // { amount, asset_id, precision, asset_symbol }
    fee: AssetAmount | null;
    settle_amount: AssetAmount;
    status: 'pending' | 'completed' | 'failed';
    direction: 'send' | 'receive';
    expires_at: string | null;
    settled_at: string | null;
    description: string | null;
    exchange_rate: string | null;
    metadata: Record<string, unknown> | null;
    payment_details: {
      payment_hash: string;
      payment_type: 'bolt11' | 'bolt12' | 'onchain' | 'lnurl';
      payment_request: string;
    };
  };
}
```

Verification failures throw `WebhookVerificationError` with a typed `code`
(`signature_mismatch`, `timestamp_out_of_tolerance`, ...) — see the
[package README](../packages/payments/README.md#webhook-error-codes) for the
full table.

## Error handling

Every API call can throw one of three typed errors:

```ts
import { ApiError, ConfigError, NetworkError } from '@ambosstech/payments';

try {
  await payments.wallets.list({ environmentId });
} catch (err) {
  if (err instanceof ApiError) {
    // the API rejected the call — err.status, err.graphqlErrors
  } else if (err instanceof NetworkError) {
    // transport failure / timeout — err.cause; safe to retry
  } else if (err instanceof ConfigError) {
    // SDK misconfigured (e.g. missing serviceApiKey) — fix your setup
  } else {
    throw err;
  }
}
```

Send-specific: `DecryptionError` (wrong team password) and `PaymentSendError`
(node rejected or failed the payment).

## Production checklist

- [ ] `AMBOSS_API_KEY` and `AMBOSS_WEBHOOK_SECRET` come from your secret
      manager, not source control.
- [ ] Webhook endpoint verifies the signature against the **raw** body and
      returns 400 on `WebhookVerificationError`.
- [ ] Fulfillment is driven by `payment.completed` webhooks, not by polling
      or by the invoice being created.
- [ ] Webhook handling is idempotent — the same event id processed twice must
      not double-fulfill.
- [ ] `idempotency_key` / `idempotencyKey` set on receives and sends so your
      retries are safe.
- [ ] Sends set a sane `feeLimitSats` and handle `DecryptionError` /
      `PaymentSendError` distinctly.
- [ ] The full flow was exercised against a `SANDBOX` environment first
      (`amb_sandbox_behavior: 'complete' | 'fail' | 'expire'` covers all
      outcomes).

## Further reference

- [`packages/payments/README.md`](../packages/payments/README.md) — full API
  reference for every resource and error code.
- [`packages/payments/examples/`](../packages/payments/examples) — runnable
  `receive.ts` / `send.ts` scripts against the live API.
- Working on this repo itself (or pointing an agent at it)? Start at
  [`AGENTS.md`](../AGENTS.md).
