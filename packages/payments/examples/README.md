# @ambosstech/payments examples

Runnable scripts that exercise the SDK against a live API. They are repo-only —
not shipped in the published package.

## Setup

```bash
# from packages/payments
pnpm install
pnpm build               # examples import the built @ambosstech/payments

cp examples/.env.example examples/.env
# edit examples/.env and fill in AMBOSS_API_KEY (+ send vars if sending)
```

`examples/.env` is gitignored. Never commit real keys or passwords.

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
