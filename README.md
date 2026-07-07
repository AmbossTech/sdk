# ambosstech-sdk

Official TypeScript SDKs for the Amboss platform.

## Packages

| Package                                       | Description                                                    | npm                    |
| --------------------------------------------- | -------------------------------------------------------------- | ---------------------- |
| [`@ambosstech/core`](./packages/core)         | Shared client, HTTP layer, errors, GraphQL transport           | `@ambosstech/core`     |
| [`@ambosstech/payments`](./packages/payments) | Payments domain: webhooks, environments, wallets, transactions | `@ambosstech/payments` |

## Install

```bash
pnpm add @ambosstech/payments
```

`@ambosstech/core` is pulled in as a transitive dependency — no need to install directly.

## Quick start

```ts
import { Payments } from '@ambosstech/payments';

const payments = new Payments({
  serviceApiKey: process.env.AMBOSS_API_KEY,
  webhookSecret: process.env.AMBOSS_WEBHOOK_SECRET,
});

// verify an incoming webhook (no key required for this)
const event = payments.webhooks.verify({
  payload: rawBody,
  signature: headers['x-webhook-signature'],
  timestamp: headers['x-webhook-timestamp'],
});

// call the API (requires serviceApiKey)
const [environment] = await payments.environments.list();
const wallets = await payments.wallets.list({ environmentId: environment.id });
```

See [`packages/payments/README.md`](./packages/payments/README.md) for full docs.

## License

MIT — see [LICENSE](./LICENSE).
