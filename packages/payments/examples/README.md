# @ambosstech/payments examples

Runnable scripts that exercise the SDK. `send.ts`/`receive.ts` hit a live API;
`verify-webhook.mjs`/`verify-webhook.cjs` are fully offline. `send.cts`/
`receive.cts` are CJS counterparts of `send.ts`/`receive.ts` that are only
type-checked, never run (see below). They are repo-only — not shipped in the
published package.

## Setup

```bash
# from packages/payments
pnpm install
pnpm build               # examples import the built @ambosstech/payments
```

`send.ts`/`receive.ts` additionally need real credentials:

```bash
cp examples/.env.example examples/.env
# edit examples/.env and fill in AMBOSS_API_KEY (+ send vars if sending)
```

`examples/.env` is gitignored. Never commit real keys or passwords.
`verify-webhook.mjs`/`verify-webhook.cjs` need none of this — see below.

## Running

Node ≥ 24 runs TypeScript directly:

```bash
node --env-file=examples/.env examples/send.ts
```

On older Node, use tsx:

```bash
pnpm exec tsx --env-file=examples/.env examples/send.ts
```

## Scripts

### `send.ts` — discovery + optional send

1. **Always** lists your environments and wallets — a read-only check that the
   API key works.
2. **If** `WALLET_ID`, `TEAM_PASSWORD`, and a destination are set, performs a
   real payment via `payments.transactions.send`.

Destinations (set one):

- `BOLT11` — a BOLT11 invoice (`AMOUNT_SATS` only needed for zero-amount invoices).
- `LIGHTNING_ADDRESS` + `AMOUNT_SATS` — pay a Lightning address.

The team password is used only to decrypt the node admin macaroon locally; it is
never sent to the API. See `.env.example` for every supported variable.

### `verify-webhook.mjs` / `verify-webhook.cjs` — offline webhook verification

Sign and verify a webhook event locally — no API key or network needed, since
HMAC verification is fully offline. `.mjs` imports the built ESM output
(`dist/`), `.cjs` requires the built CJS output (`dist-cjs/`); together they
are the CI check for the dual build (`pnpm run test:examples`, wired into
`.github/workflows/ci.yml` after the `build` step). If either build's exports
map or output breaks, one of these throws and CI fails.

```bash
node examples/verify-webhook.mjs
node examples/verify-webhook.cjs
```

### `send.cts` / `receive.cts` — CJS compile check

Type-check-only CommonJS TypeScript (`.cts`) counterparts of `send.ts`/
`receive.ts`. They `require('@ambosstech/payments')` the same real usage
(destination unions, error classes, send/receive params) but are never
executed — running them for real would attempt a live payment or mint a live
invoice, same as their `.ts` counterparts. `.cts`'s module/resolution
semantics under `moduleResolution: NodeNext` force the import to resolve via
the package's `require` export condition, so this is a genuine check that a
CJS TypeScript consumer can type-check this usage against the built
`dist-cjs/` declarations. Wired into CI as `pnpm run typecheck:examples`
(after the `build` step, alongside `test:examples`).

```bash
pnpm exec tsc --noEmit -p tsconfig.examples.cjs.json
```

### `receive.ts` — discovery + mint an invoice

1. **If** `WALLET_ID` is unset, lists your environments and wallets so you can
   grab one.
2. **If** `WALLET_ID` is set, mints a Lightning invoice via
   `payments.transactions.createReceive` and prints the BOLT11 `payment_request`.

Receiving needs no team password or macaroon and works the same for sandbox and
live wallets. Set `RECEIVE_AMOUNT_SATS` (default `1000`) and optionally
`RECEIVE_DESCRIPTION`.

```bash
node --env-file=examples/.env examples/receive.ts
```
