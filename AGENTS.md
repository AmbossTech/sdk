# AGENTS.md

Guide for AI coding agents (and humans) working in this repo. Integrating the
published SDK into your own product instead? Read
[`docs/INTEGRATION.md`](./docs/INTEGRATION.md) — it is self-contained.

## Project overview

Monorepo of Amboss TypeScript SDKs. Two packages:

| Package                | Path                | Purpose                                              |
| ---------------------- | ------------------- | ---------------------------------------------------- |
| `@ambosstech/core`     | `packages/core`     | Shared client, errors, GraphQL transport             |
| `@ambosstech/payments` | `packages/payments` | Payments API: environments, wallets, transactions, webhooks |

## Commands

```bash
pnpm install                # install all deps
pnpm build                  # build all packages (core first, then payments)
pnpm test                   # build core, then run all tests (tsx --test)
pnpm typecheck              # build core, then typecheck all packages
pnpm format                 # prettier --write .
pnpm format:check           # prettier --check .
pnpm clean                  # rm dist in all packages

# Per-package (run from repo root)
pnpm --filter @ambosstech/core run build
pnpm --filter @ambosstech/payments run codegen    # regenerate GraphQL SDK from schema
pnpm --filter @ambosstech/core run refresh-schema # pull latest schema from rails.amboss.tech
```

## Architecture

### `packages/core` — `@ambosstech/core`

Shared HTTP/GraphQL transport. Not consumed directly by end users.

- `AmbossClient` — base class; wraps `graphql-request`. Accepts
  `{ apiKey?, serviceApiKey?, baseUrl?, fetch?, timeoutMs? }`.
  Default `baseUrl`: `https://rails.amboss.tech/graphql`.
- Two auth headers: `apiKey` is sent as `Authorization: Bearer ...`
  (cross-product key); `serviceApiKey` is sent as `x-api-key`
  (scoped payments key). Payments resources require `serviceApiKey`.
- `requireApiKey(operation)` / `requireServiceApiKey(operation)` — throw
  `ConfigError` when the key is missing. Called by resource getters.
- `gqlRequest<TData, TVariables>` — typed GraphQL request with error translation.
- `translateError(err)` — maps `ClientError` → `ApiError`, `Error` → `NetworkError`.
- **Errors**: `AmbossSdkError` (base) → `ConfigError`, `ApiError`
  (has `.status`, `.graphqlErrors`), `NetworkError` (has `.cause`).
- Exposes `./schema` export pointing at `schema/amboss.graphql`.

### `packages/payments` — `@ambosstech/payments`

Payments API client. `Payments` extends `AmbossClient`.

```ts
new Payments({
  serviceApiKey?: string, // scoped payments key (x-api-key); omit for webhook-only use
  webhookSecret?: string, // omit if you only call the API
  baseUrl?: string,
  fetch?: typeof fetch,
  timeoutMs?: number,
  send?: readonly PrepareSendParams[], // wallets to pre-warm for sending, in the background
});
```

Resource getters are lazy and call `requireServiceApiKey`:

| Getter          | Class          | Operations                                                    |
| --------------- | -------------- | ------------------------------------------------------------- |
| `.environments` | `Environments` | `list()`, `get(id)`, `create(input)`, `delete(id)`            |
| `.wallets`      | `Wallets`      | `list({ environmentId })`, `get(id)`, `create(input)`, `delete(id)` |
| `.transactions` | `Transactions` | `createReceive(input)`, `send(params)`, `prepareSend(params)`, `isSendReady(walletId)`, `forgetSend(walletId)` |
| `.webhooks`     | `Webhooks`     | `verify(input)` — does NOT require any API key                |

`Payments.webhooks` is also a static reference to `Webhooks` for stateless use.

#### Transactions

- `createReceive` mints a Lightning invoice server-side — no password or
  macaroon needed; identical for sandbox and live wallets.
- `send` creates the send transaction, decrypts the node admin macaroon
  **in-process** using the team password (never sent to the API), then pays
  directly against the node's REST endpoint. Base-asset wallets pay over LND;
  Taproot Asset wallets over litd. Sandbox wallets need no password — the
  backend settles asynchronously (`payment` resolves `null`); behavior is
  driven by `metadata.amb_sandbox_behavior` (`complete` / `fail` / `expire`).
- Send errors: wrong password → `DecryptionError`; node-side failure →
  `PaymentSendError`.
- `send` is split into a **prepare** step (wallet send context →
  `GetWalletSendContext`; node permissions → `GetWalletNodePermissions`; two
  Argon2id passes; nip44 decrypt) and the payment itself (`CreateSendTransaction`
  + node REST call). The prepare step is cached per wallet in
  `Transactions.#ready`, so it runs once, not per send.
- `prepareSend(params)` runs that step ahead of time; `isSendReady(walletId)`
  reports whether the macaroon is resident (`false` while still deriving —
  it checks `#ready`, not the in-flight `#pending` slots); `forgetSend(walletId)`
  evicts. `PaymentsConfig.send` pre-warms an array of wallets from the
  constructor, sequentially and fire-and-forget (errors swallowed there;
  `send()` re-derives and surfaces them).
- Cache invariants worth preserving: only the **macaroon** is retained, never
  `masterKey` / `masterPasswordHash`; a slot records a sha256 fingerprint of the
  password plus the `teamId` the derivation actually used, so a `send` with a
  different password re-derives instead of reusing another password's macaroon
  while one naming the wallet's own team explicitly still hits the cache; a slot
  also records *whether* that `teamId` was an explicit override, because a `send`
  omitting `teamId` asks for the wallet's own team and must not be answered from
  an overridden slot; `#pending` holds **every** in-flight derivation for a
  wallet, not just the newest, so a second caller's wrong password neither
  displaces a good derivation already running nor discards its result; and a
  rejected derivation drops only its own `#pending` slot, so a wallet already
  prepared in `#ready` survives someone else's bad password.
- Argon2id is **synchronous** and blocks the event loop for seconds — prepare is
  `async` because of the API calls, not because key derivation yields.

#### Webhooks

HMAC-SHA256 over `${timestamp}.${rawBody}`, compared with `timingSafeEqual`.
Default tolerance 300s. Failure codes on `WebhookVerificationError.code`:
`missing_secret` | `missing_signature` | `missing_timestamp` |
`invalid_timestamp` | `timestamp_out_of_tolerance` | `invalid_signature_format` |
`signature_mismatch` | `invalid_payload_json`.

Event payload types (`src/types/webhooks.ts`): `PaymentEvent`,
`PaymentEventData`, `PaymentEventType`
(`payment.pending` | `payment.completed` | `payment.failed`), `PaymentType`
(`bolt11` | `bolt12` | `onchain` | `lnurl`), `AssetAmount`.

#### GraphQL codegen

Operations live in `src/operations/*.graphql`. Generated client in
`src/generated/sdk.ts`. Run
`pnpm --filter @ambosstech/payments run codegen` after changing operations or
the schema.

#### Examples

Runnable scripts in `packages/payments/examples/` (`receive.ts`, `send.ts`) run
against the live API with credentials from `examples/.env` (gitignored; copy
`examples/.env.example`). `verify-webhook.mjs`/`verify-webhook.cjs` need no
credentials (webhook verification is offline) and run in CI as
`pnpm run test:examples`, exercising the built `dist`/`dist-cjs` output of
both packages — the regression check for the dual build. `send.cts`/
`receive.cts` are CJS counterparts of `send.ts`/`receive.ts` that are only
type-checked in CI (`pnpm run typecheck:examples`), never executed, since
running them would hit the live API the same as their `.ts` counterparts.

## Key constraints

- Source is ESM (`"type": "module"`), all relative imports must use `.js`
  extensions; each package builds a `require()`-compatible CommonJS output
  (`dist-cjs/`) alongside the ESM one (`dist/`) so both `import` and
  `require()` consumers work.
- Node ≥ 18.18 required (native `fetch`, `crypto`).
- `@ambosstech/core` must be built before `@ambosstech/payments` — root
  `build`/`test`/`typecheck` scripts handle the order.
- No framework dependencies. `fetch` is injectable for tests / other runtimes.
- Never commit files matching `.gitignore` (e.g. `examples/.env`).

## Releases

[release-please](https://github.com/googleapis/release-please) drives releases
from conventional commits on `main`; merging the release PR publishes to npm
via OIDC trusted publishing (pnpm ≥ 11). Use conventional commit messages
(`feat:`, `fix:`, `docs:`, ...) — they determine version bumps.

## Docs to keep in sync

When you change the public API surface, update all of:

1. `packages/payments/README.md` — package reference
2. `docs/INTEGRATION.md` — business integration guide
3. This file's resource table
