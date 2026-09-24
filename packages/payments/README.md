# @ambosstech/payments

TypeScript SDK for the Amboss Payments API. Verify webhook events and manage environments, wallets, and transactions over GraphQL.

## Install

```bash
pnpm add @ambosstech/payments
# or
npm install @ambosstech/payments
```

Requires Node.js ≥ 18.18.

## Quick start

```ts
import { Payments } from '@ambosstech/payments';

const payments = new Payments({
  serviceApiKey: process.env.AMBOSS_API_KEY,
  webhookSecret: process.env.AMBOSS_WEBHOOK_SECRET,
});

// Verify an incoming webhook (no key required)
const event = payments.webhooks.verify({
  payload: rawBody,
  signature: req.headers['x-webhook-signature'],
  timestamp: req.headers['x-webhook-timestamp'],
});

// Call the API (requires serviceApiKey)
const envs = await payments.environments.list();
const wallets = await payments.wallets.list({ environmentId: envs[0].id });
```

## Configuration

```ts
new Payments({
  serviceApiKey?: string,      // scoped payments key (sent as x-api-key); omit for webhook-only use
  webhookSecret?: string,      // omit if you only call the API
  baseUrl?: string,            // default: https://app.amboss.tech/graphql
  fetch?: typeof fetch,        // override for tests / non-Node runtimes
  timeoutMs?: number,          // default: 30000
  send?: Array<{ walletId: string, password?: string, teamId?: string }>, // pre-cache retry credentials
});
```

## Webhooks

### Instance API

```ts
const event = payments.webhooks.verify({
  payload,        // string | Buffer — RAW request body
  signature,      // x-webhook-signature header value
  timestamp,      // x-webhook-timestamp header value
  toleranceSeconds?: number,   // default 300
  now?: () => number,          // inject clock for tests
});
```

### Static API

For stateless verification without constructing a client:

```ts
import { Payments } from '@ambosstech/payments';

const event = Payments.webhooks.verify({
  secret: process.env.AMBOSS_WEBHOOK_SECRET,
  payload,
  signature,
  timestamp,
});
```

### Raw body matters

HMAC is computed over `${timestamp}.${rawBody}`. If your framework parsed JSON before your handler, the re-serialized bytes will not match. Capture the raw body before any parser runs.

**NestJS (Express)**

```ts
const app = await NestFactory.create(AppModule, { rawBody: true });
```

```ts
@Post('webhook')
handle(@Req() req: RawBodyRequest<Request>, @Headers() headers: Record<string, string>) {
  return this.payments.webhooks.verify({
    payload: req.rawBody!,
    signature: headers['x-webhook-signature'],
    timestamp: headers['x-webhook-timestamp'],
  });
}
```

**Express**

```ts
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const event = payments.webhooks.verify({
    payload: req.body, // Buffer because of express.raw
    signature: req.header('x-webhook-signature')!,
    timestamp: req.header('x-webhook-timestamp')!,
  });
  res.sendStatus(200);
});
```

**Fetch / Web standard**

```ts
const rawBody = await request.text();
const event = payments.webhooks.verify({
  payload: rawBody,
  signature: request.headers.get('x-webhook-signature')!,
  timestamp: request.headers.get('x-webhook-timestamp')!,
});
```

### Webhook error codes

All verification failures throw `WebhookVerificationError` with a typed `code`:

| Code                         | Meaning                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| `missing_secret`             | Constructor `webhookSecret` was not provided (instance API).              |
| `missing_signature`          | `signature` parameter was empty.                                          |
| `missing_timestamp`          | `timestamp` parameter was empty.                                          |
| `invalid_timestamp`          | `timestamp` is not numeric.                                               |
| `timestamp_out_of_tolerance` | Clock skew exceeded `toleranceSeconds`.                                   |
| `invalid_signature_format`   | Signature is not valid hex or has wrong length.                           |
| `signature_mismatch`         | HMAC did not match — wrong secret, tampered body, or wrong payload bytes. |
| `invalid_payload_json`       | Signature verified but body is not valid JSON.                            |

## API resources

All resource calls require `serviceApiKey`. Accessing `payments.environments`, `payments.wallets`, or `payments.transactions` without `serviceApiKey` throws `ConfigError`.

### Environments

```ts
await payments.environments.list();
await payments.environments.get(id);
await payments.environments.create({ name, type: 'SANDBOX' });
await payments.environments.delete(id);
```

### Wallets

```ts
await payments.wallets.list({ environmentId }); // returns trimmed wallets (no balance/nodes)
await payments.wallets.get(id); // returns the full wallet record
await payments.wallets.create({ environment_id, asset_id, name });
await payments.wallets.delete(id);
```

### Transactions

#### Finding transactions

```ts
await payments.transactions.findOne(id); // full transaction record
await payments.transactions.findMany({ wallet_id: walletId }); // { list, pagination, total_count }
```

`findMany` accepts the same input as the backend's transaction list query —
`environment_id`, `wallet_id`, `page: { limit, offset }`, and
`filter: { date_range, direction, status }`. Each item in `list` is a trimmed
record (no `payment_hash` / `payment_request` / `error` / etc.); use `findOne`
for the full transaction.

#### Receiving

`transactions.createReceive` generates a Lightning invoice for a wallet. Unlike
sending, the backend mints the invoice on the node itself — no team password or
node macaroon needed, and it works the same for sandbox and live wallets.

```ts
const transaction = await payments.transactions.createReceive({
  wallet_id: walletId,
  amount: '1000', // in the wallet asset's base unit (sats for BTC)
  description: 'Order #1234', // optional
  expires_in_seconds: 3600, // optional
  idempotency_key, // optional
});

transaction.payment_request; // the BOLT11 invoice to share with the payer
transaction.payment_hash;
```

#### Sending

`transactions.send` mirrors the dashboard send flow without the UI. It creates the
send transaction, decrypts the node admin macaroon **in-process** using the team
password (the password never leaves your process and is never sent to the API),
then executes the payment directly against the node's REST endpoint, resolving
with the terminal result.

```ts
const { transaction, payment } = await payments.transactions.send({
  walletId,
  password, // team password — used only to decrypt the node macaroon locally
  teamId, // optional (Argon2 salt) — resolved from the wallet unless you override it
  destination: { bolt11: 'lnbc1...' },
  // or: destination: { lightningAddress: 'user@domain.com', amountSats: '1000' }
  onUpdate: ({ status }) => console.log(status), // 'IN_FLIGHT' | ...
});

payment.status; // 'SUCCEEDED' | 'FAILED'
payment.paymentHash;
```

Base-asset wallets pay over LND; Taproot Asset wallets pay over litd — the SDK
selects the endpoint automatically from the wallet's asset. A wrong password
throws `DecryptionError`; a node-side failure throws `PaymentSendError`.

If the invoice was already paid (a genuine duplicate, or a replayed `idempotencyKey`), the backend returns the existing `COMPLETED` transaction instead of creating a new one; the SDK detects this and resolves immediately with `payment.status === 'SUCCEEDED'` without re-paying on the node. `payment.paymentPreimage` is `undefined` in this case — the transaction record doesn't store it.

To pay an invoice issued by the same node — for example, paying your own Taproot Asset wallet's invoice from your BTC wallet — pass `allowSelfPayment: true`. It is off by default, and LND rejects a payment to its own node without it.

**Sandbox wallets** need no node or macaroon, but a non-empty `password` is
still mandatory so sandbox and production sends use the same call shape. Any
non-empty value such as `Password123` works because sandbox settlement does not
use it. `payment` comes back `null`; observe the outcome
via webhooks or by polling the transaction status. The backend settles
asynchronously per the `amb_sandbox_behavior` metadata (`complete` / `fail` /
`expire`; default `expire`):

```ts
const { transaction, payment } = await payments.transactions.send({
  walletId, // a sandbox wallet
  password: 'Password123', // any non-empty value works in sandbox
  destination: { bolt11: 'lnbc1...' },
  metadata: { amb_sandbox_behavior: 'complete' }, // force success in sandbox
});

payment; // null — settlement happens server-side
```

#### Preparing credentials for retries

`prepareSend` fetches a wallet's send context and node permissions, performs the
two Argon2id passes, and caches only the decrypted macaroon. The cache is used
by `retryPayment`, which intentionally has no password parameter. A new `send`
always requires `password` and derives credentials afresh.

```ts
await payments.transactions.prepareSend({ walletId, password });

payments.transactions.isSendReady(walletId); // true — macaroon is in memory

payments.transactions.forgetSend(walletId); // drop it again
```

Pass `send` to the constructor to start this during startup instead:

```ts
const payments = new Payments({
  serviceApiKey,
  send: [{ walletId, password }],
});

// ...prepared in the background; poll until it lands
payments.transactions.isSendReady(walletId);
```

The constructor form is fire-and-forget and **ignores failures**. Use
`await prepareSend(...)` when you need to observe preparation errors.

Notes:

- **Argon2id runs on a shared worker thread**, so its CPU-bound work does not
  block the event loop.
- Each wallet costs its own derivation, so a long `send` list takes a while.
  Entries are prepared one at a time (running them concurrently would not
  overlap anything).
- `isSendReady` is `false` while a preparation is still running, `true` only
  once the macaroon is resident.
- `send` never reads or replaces the cache. A typo'd password fails that call
  without disturbing credentials prepared for a later retry.
- The cache has no expiry. Call `forgetSend(walletId)` to pick up rotated node
  credentials — or to stop holding decrypted node admin access in memory once a
  run of sends is finished. Only the macaroon is retained; the Argon2 master key
  is discarded after the decrypt.
- Sandbox wallets can prepare too; this only caches the fact that no node
  payment is needed.

#### Retrying a failed send

`transactions.retryPayment(paymentId)` retries a `FAILED` send without minting
a new invoice: it looks up the transaction, checks it is retryable (status
`FAILED`, invoice not expired), then pays its existing `payment_request`
directly against the node. It never calls `create_send` — doing so would
persist a second transaction row for the same invoice instead of letting the
existing failed row's status update. It throws a `PaymentSendError` if the
transaction isn't retryable.

```ts
const { transaction, payment } = await payments.transactions.retryPayment(paymentId);
```

It relies on a cached macaroon: call `prepareSend({ walletId, password })`
before retrying. Without one, it fails with a `PaymentSendError` asking you to
prepare the wallet first.

## Examples

Runnable scripts live in [`examples/`](./examples). They run against a live API
using credentials from `examples/.env` (gitignored):

```bash
pnpm build
cp examples/.env.example examples/.env   # then fill in AMBOSS_API_KEY
node --env-file=examples/.env examples/send.ts
```

`send.ts` lists your environments and wallets, then optionally sends a payment.
See [`examples/README.md`](./examples/README.md) for details.

`verify-webhook.mjs` / `verify-webhook.cjs` need no API key — they sign and
verify a webhook offline, exercising the ESM and CJS builds respectively.
They double as the CI check for the dual build (`pnpm run test:examples`).

## Errors

API errors thrown by resource calls are typed as `ApiError`:

```ts
import { ApiError, ConfigError, NetworkError } from '@ambosstech/payments';

try {
  await payments.wallets.list({ environmentId });
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.status, err.message, err.graphqlErrors);
  } else if (err instanceof ConfigError) {
    console.error('SDK misconfigured:', err.message);
  } else if (err instanceof NetworkError) {
    console.error('Network failure:', err.message);
  } else {
    throw err;
  }
}
```

## Signature algorithm

```
expected = HMAC_SHA256(secret, `${timestamp}.${rawBody}`)
header   = expected.toString('hex')
```

Comparison uses `crypto.timingSafeEqual`.

## License

MIT
