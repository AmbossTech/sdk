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
  apiKey: process.env.AMBOSS_API_KEY,
  webhookSecret: process.env.AMBOSS_WEBHOOK_SECRET,
});

// Verify an incoming webhook (no apiKey required)
const event = payments.webhooks.verify({
  payload: rawBody,
  signature: req.headers['x-webhook-signature'],
  timestamp: req.headers['x-webhook-timestamp'],
});

// Call the API (requires apiKey)
const envs = await payments.environments.list();
const wallets = await payments.wallets.list({ environmentId: envs[0].id });
```

## Configuration

```ts
new Payments({
  apiKey?: string,             // omit for webhook-only use
  webhookSecret?: string,      // omit if you only call the API
  baseUrl?: string,            // default: https://rails.amboss.tech/graphql
  fetch?: typeof fetch,        // override for tests / non-Node runtimes
  timeoutMs?: number,          // default: 30000
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

All resource calls require `apiKey`. Accessing `payments.environments`, `payments.wallets`, or `payments.transactions` without `apiKey` throws `ConfigError`.

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

```ts
await payments.transactions.createReceive({
  wallet_id,
  amount,
  idempotency_key,
  description?,
  expires_in?,
});
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
  feeLimitSats: '50',
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
