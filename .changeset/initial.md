---
'@ambosstech/core': minor
'@ambosstech/payments': minor
---

Initial release of the Amboss SDK monorepo.

- `@ambosstech/core` — shared `AmbossClient` base, GraphQL transport, and error classes (`ApiError`, `ConfigError`, `NetworkError`).
- `@ambosstech/payments` — webhook verification (`payments.webhooks.verify`), environments, wallets, and receive-side transactions over the Amboss GraphQL API.
