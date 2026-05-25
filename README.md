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
  apiKey: process.env.AMBOSS_API_KEY,
  webhookSecret: process.env.AMBOSS_WEBHOOK_SECRET,
});

// verify an incoming webhook (no apiKey required for this)
const event = payments.webhooks.verify({
  payload: rawBody,
  signature: headers['x-webhook-signature'],
  timestamp: headers['x-webhook-timestamp'],
});

// call the API (requires apiKey)
const wallets = await payments.wallets.list({ environmentId: env.id });
```

See [`packages/payments/README.md`](./packages/payments/README.md) for full docs.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Refresh the pinned GraphQL schema from the dev API:

```bash
pnpm --filter @ambosstech/core run refresh-schema
```

Regenerate typed GraphQL SDK in payments:

```bash
pnpm --filter @ambosstech/payments run codegen
```

## Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

```bash
pnpm changeset            # add a changeset describing your change
pnpm changeset:version    # bump versions + update changelogs
pnpm changeset:publish    # build + publish to npm
```

CI publishes automatically when changeset PRs merge to `main`.

## License

MIT — see [LICENSE](./LICENSE).
