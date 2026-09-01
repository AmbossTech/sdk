import type { GraphQLClient } from 'graphql-request';

import { createMasterPasswordHash } from '../crypto/argon2.js';
import { decryptAdminMacaroonWithMasterKey } from '../crypto/decryptAdminMacaroon.js';
import { PaymentSendError } from '../errors.js';
import {
  getSdk,
  type CreateReceiveTransactionInput,
  type CreateSendTransactionInput,
  type FindManyTransactionsFieldsFragment,
  type ListTransactionsInput,
  type PaymentsTransactionFieldsFragment,
} from '../generated/sdk.js';
import { sendAssetPayment } from '../node/lit.js';
import { sendLndPayment } from '../node/lnd.js';
import type { NodePaymentResult, PaymentLifecycleStatus } from '../node/types.js';
import { translateSdkErrors } from './sdkErrors.js';
import { selectSendNode } from './sendNode.js';
import type {
  PreparedSend,
  PrepareSendParams,
  SendDestination,
  SendParams,
  SendResult,
} from './transactions.types.js';

const DEFAULT_TIMEOUT_SECONDS = 60;

/**
 * Fee limit sent to LND/litd for every send. Fixed at 2^32 sats — far beyond
 * any real routing fee — so the node never rejects a payment for lacking a
 * fee limit, without exposing fee-limit configuration to callers.
 */
const FEE_LIMIT_SATS = '4294967296';

/**
 * Taproot asset group keys come from GraphQL as hex (a 33-byte compressed
 * secp256k1 pubkey → 66 hex chars). litd's REST gateway expects the `group_key`
 * bytes field base64-encoded; passing the hex string makes the gateway
 * base64-decode it (66 chars → 49 bytes) and tapd rejects it with
 * "error parsing group key: malformed public key: invalid length: 49".
 * Convert hex → raw bytes → base64 so tapd parses the 33-byte compressed key.
 */
function hexGroupKeyToBase64(groupKeyHex: string): string {
  return Buffer.from(groupKeyHex, 'hex').toString('base64');
}

function buildCreateSendInput(params: SendParams): CreateSendTransactionInput {
  const { walletId, destination, idempotencyKey, metadata } = params;
  const input: CreateSendTransactionInput = { wallet_id: walletId };

  if ('bolt11' in destination) {
    input.request = { bolt11: destination.bolt11 };
  } else {
    input.address = {
      lightning_address: destination.lightningAddress,
      amount: destination.amountSats,
    };
  }
  if (idempotencyKey) input.idempotency_key = idempotencyKey;
  if (metadata && Object.keys(metadata).length > 0) input.metadata = JSON.stringify(metadata);

  return input;
}

/** Amount (sats) to pass to LND — only for zero-amount BOLT11 invoices. */
function lndAmountSats(destination: SendDestination): string | undefined {
  return 'bolt11' in destination ? destination.amountSats : undefined;
}

export class Transactions {
  readonly #sdk: ReturnType<typeof getSdk>;
  /**
   * Macaroons prepared by {@link prepareSend}, keyed by wallet id. Only a
   * *successful* preparation lands here, and only `prepareSend` ever writes:
   * `send()` never adds to or evicts from this map, so no failing send can
   * disturb a prepared wallet. ponytail: no TTL — call `forgetSend()` to
   * refresh rotated credentials.
   */
  readonly #prepared = new Map<string, PreparedSend>();
  /** Preparations still running, so concurrent `prepareSend` calls share one Argon2 pass. */
  readonly #pending = new Map<string, Promise<PreparedSend>>();

  constructor(graphqlClient: GraphQLClient) {
    this.#sdk = getSdk(graphqlClient, translateSdkErrors);
  }

  /**
   * Resolves and caches everything `send()` needs before it can pay: the
   * wallet's environment type, its node endpoint, and — for live wallets — the
   * decrypted admin macaroon. Two GraphQL round-trips plus two Argon2id passes,
   * so calling this ahead of time takes seconds off the first `send()`.
   *
   * A later `send()` for the same wallet that **omits `password`** uses what
   * this cached. A `send()` that passes a `password` always derives afresh —
   * the cache never has to decide whether two sets of credentials match.
   *
   * Safe to call repeatedly: an already-prepared wallet resolves immediately,
   * and concurrent calls for one wallet share a single derivation. Call
   * {@link forgetSend} first to re-derive after credentials rotate.
   *
   * Argon2id is CPU-bound (m=64 MiB, t=3, p=4), but runs on a shared worker
   * thread so it does not block the event loop. Preparing ahead of time still
   * avoids that work on the first payment request.
   */
  async prepareSend(params: PrepareSendParams): Promise<void> {
    const { walletId } = params;
    if (this.#prepared.has(walletId)) return;

    const inFlight = this.#pending.get(walletId);
    if (inFlight) {
      await inFlight;
      return;
    }

    const promise = this.#resolveSendContext(params);
    this.#pending.set(walletId, promise);
    try {
      const prepared = await promise;
      // Skip the write if `forgetSend()` ran mid-derivation — the caller asked
      // for this macaroon *not* to be held.
      if (this.#pending.get(walletId) === promise) this.#prepared.set(walletId, prepared);
    } finally {
      if (this.#pending.get(walletId) === promise) this.#pending.delete(walletId);
    }
  }

  /**
   * Whether `walletId`'s macaroon and node endpoint are decrypted and resident
   * in memory, so a password-less `send()` would skip straight to creating the
   * transaction. `false` while a `prepareSend()` for that wallet is still
   * running.
   */
  isSendReady(walletId: string): boolean {
    return this.#prepared.has(walletId);
  }

  /**
   * Drops a wallet's prepared context, releasing the decrypted macaroon from
   * memory. Use it to pick up rotated node credentials, or to stop holding node
   * admin access once a run of sends is done.
   */
  forgetSend(walletId: string): void {
    this.#prepared.delete(walletId);
    // Dropping the in-flight preparation too, so its result cannot land in
    // #prepared after the caller asked for the macaroon to be released.
    this.#pending.delete(walletId);
  }

  async findOne(id: string): Promise<PaymentsTransactionFieldsFragment> {
    const res = await this.#sdk.GetTransaction({ id });
    return res.payment.transaction.find_one;
  }

  async findMany(input: ListTransactionsInput): Promise<FindManyTransactionsFieldsFragment> {
    const res = await this.#sdk.ListTransactions({ input });
    return res.payment.transaction.find_many;
  }

  async createReceive(
    input: CreateReceiveTransactionInput,
  ): Promise<PaymentsTransactionFieldsFragment> {
    const res = await this.#sdk.CreateReceiveTransaction({ input });
    return res.payment.transaction.create_receive;
  }

  /**
   * Sends a Lightning / Taproot Asset payment from a wallet — the SDK equivalent
   * of the amboss-rails send dialog.
   *
   * For **live** wallets it creates the send transaction, decrypts the node
   * admin macaroon in-process using the team password, then executes the
   * payment directly against the node's REST gateway and resolves with the
   * terminal result.
   *
   * For **sandbox** wallets there is no node and no real settlement: the SDK
   * just creates the send and returns (`payment` is `null`). The backend
   * settles the transaction asynchronously according to the
   * `amb_sandbox_behavior` metadata (`complete` / `fail` / `expire`; default
   * `expire`). No password is required.
   *
   * Call {@link prepareSend} beforehand (or pass `send` to the `Payments`
   * constructor) to move steps 1–2 off this path entirely.
   */
  async send(params: SendParams): Promise<SendResult> {
    const { destination, onUpdate, signal } = params;
    const timeoutSeconds = params.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS;

    // 1–2. Resolve the node endpoint + decrypted macaroon. A caller who passes
    //      a `password` always gets a fresh derivation; only a password-less
    //      send reads what `prepareSend()` cached. Either way a wrong password
    //      fails here, before any transaction is created.
    const prepared = await this.#sendContext(params);

    // 3. Create the send transaction → backend returns the bolt11 to pay.
    const createRes = await this.#sdk.CreateSendTransaction({
      input: buildCreateSendInput(params),
    });
    const transaction = createRes.payment.transaction.create_send;

    if (prepared.kind === 'sandbox') return { transaction, payment: null };

    // Already-completed: `create_send` found an existing COMPLETED transaction
    // with the same payment hash (a genuine duplicate, or an idempotency-key
    // replay) and returned it instead of creating a new one. Paying it again
    // on the node would fail (or double-pay), so short-circuit and report it
    // as the successful send it already is.
    if (transaction.status === 'COMPLETED') {
      return {
        transaction,
        payment: {
          status: 'SUCCEEDED',
          paymentHash: transaction.payment_hash ?? undefined,
          // `fee` is already sats today (backend writes it from LND's
          // `safe_fee`) — same unit as `feeSat`, so no numeric conversion.
          feeSat: transaction.fee ?? undefined,
          // PaymentsTransaction has no preimage field, so it can't be
          // recovered for an already-settled transaction — only a payment
          // actually executed on the node below returns one.
          paymentPreimage: undefined,
        },
      };
    }

    if (!transaction.payment_request) {
      throw new PaymentSendError('Backend did not return a payment request.');
    }

    // 4. Execute the payment against the node.
    const payment = await this.#payAtNode(prepared, transaction.payment_request, {
      amountSats: lndAmountSats(destination),
      timeoutSeconds,
      onUpdate,
      signal,
    });

    return { transaction, payment };
  }

  /**
   * Retries a `FAILED` send **without minting a new invoice**: looks up the
   * transaction, checks it is actually retryable, then pays its own
   * `payment_request` directly against the node — the same node-execution
   * logic {@link send}'s step 4 uses, but skipping `send()`'s `create_send`
   * step entirely. Calling `create_send` again would persist a second
   * `payments_transaction` row for the same invoice instead of letting the
   * existing failed row's status update, so this never touches it.
   *
   * Throws {@link PaymentSendError} if the transaction is not in `FAILED`
   * status, its invoice has expired, or it has no `payment_request` to retry.
   *
   * Takes no password: like a password-less {@link send}, it relies on
   * {@link prepareSend} having already cached the wallet's macaroon (as it
   * would for the original `send()` call that failed). If nothing is cached
   * for the transaction's wallet, this fails the same way an unprepared,
   * password-less `send()` does — a `PaymentSendError` asking for a team
   * password via `prepareSend()` first.
   */
  async retryPayment(paymentId: string): Promise<SendResult> {
    const transaction = await this.findOne(paymentId);

    if (transaction.status !== 'FAILED') {
      throw new PaymentSendError(
        `Transaction ${paymentId} is not retryable: status is ${transaction.status}, expected FAILED.`,
      );
    }
    if (transaction.expires_at && new Date(transaction.expires_at).getTime() <= Date.now()) {
      throw new PaymentSendError(`Transaction ${paymentId}'s invoice has expired.`);
    }
    if (!transaction.payment_request) {
      throw new PaymentSendError(`Transaction ${paymentId} has no payment_request to retry.`);
    }

    const prepared = await this.#sendContext({ walletId: transaction.wallet_id });
    if (prepared.kind === 'sandbox') return { transaction, payment: null };

    const payment = await this.#payAtNode(prepared, transaction.payment_request, {
      amountSats: transaction.amount_sats ?? undefined,
      timeoutSeconds: DEFAULT_TIMEOUT_SECONDS,
    });

    return { transaction, payment };
  }

  /**
   * The context `send()` will pay with. Passing a `password` means "use these
   * credentials", so it always derives; omitting one means "use what was
   * prepared", falling through to a derivation when nothing was — which is how
   * sandbox wallets (no password, nothing to decrypt) still work unprepared,
   * and how an unprepared live wallet gets its "password required" error.
   */
  #sendContext(params: PrepareSendParams): Promise<PreparedSend> {
    if (params.password !== undefined) return this.#resolveSendContext(params);

    const prepared = this.#prepared.get(params.walletId);
    return prepared ? Promise.resolve(prepared) : this.#resolveSendContext(params);
  }

  async #resolveSendContext(params: PrepareSendParams): Promise<PreparedSend> {
    const { walletId, password } = params;

    // 1. The wallet's environment type (to detect sandbox) and team id. Both are
    //    readable with only the service API key — no team password required yet.
    //    Sandbox wallets settle server-side, so there is nothing to decrypt.
    const ctxRes = await this.#sdk.GetWalletSendContext({ id: walletId });
    const walletCtx = ctxRes.payment.wallet.find_one;
    if (walletCtx.environment.type === 'SANDBOX') return { kind: 'sandbox' };

    // 2. Live wallet — a team password is required to decrypt the node macaroon.
    //    teamId is the Argon2 salt; it comes back on the wallet above, so no
    //    separate lookup is needed. Callers may still override it explicitly.
    if (!password) {
      throw new PaymentSendError('A team password is required to send from a live wallet.');
    }
    const teamId = params.teamId ?? walletCtx.team_id;
    const { masterKey, masterPasswordHash } = await createMasterPasswordHash(password, teamId);

    // 3. Resolve the node + its credentials — node_permissions is gated on the
    //    password hash, so a wrong password is rejected here before any payment.
    const permRes = await this.#sdk.GetWalletNodePermissions({
      id: walletId,
      password_hash: masterPasswordHash,
    });
    const wallet = permRes.payment.wallet.find_one;
    const isAsset = wallet.asset.type !== 'BASE_ASSET';
    const node = selectSendNode(wallet.node_permissions.nodes, isAsset);
    if (!node) {
      throw new PaymentSendError(
        isAsset
          ? 'No litd endpoint available for this wallet.'
          : 'No LND endpoint available for this wallet.',
      );
    }

    // 4. Decrypt the admin macaroon in-process (reusing the master key). Only
    //    the macaroon is kept: `masterKey` and `masterPasswordHash` go out of
    //    scope here rather than being cached, so a prepared wallet holds node
    //    access for one node instead of the key to every wallet in the team.
    const macaroon = decryptAdminMacaroonWithMasterKey({
      masterKey,
      encryptedSymmetricKey: wallet.node_permissions.encrypted_symmetric_key,
      encryptedMacaroon: node.encryptedMacaroon,
    });
    const groupKeyHex = wallet.asset.taproot_asset_details?.group_key;

    return {
      kind: 'node',
      restHost: node.restHost,
      macaroon,
      tlsCert: node.tlsCert,
      isAsset,
      ...(groupKeyHex ? { groupKeyBase64: hexGroupKeyToBase64(groupKeyHex) } : {}),
    };
  }

  /**
   * Pays an already-minted `payment_request` against the node — LND directly
   * for base-asset wallets, litd for Taproot Asset wallets. Shared by
   * `send()`'s step 4 (paying the invoice `create_send` just minted) and
   * `retryPayment()` (paying a `FAILED` transaction's existing invoice again),
   * so the macaroon/credential handling and node-call shape live in one place.
   */
  async #payAtNode(
    prepared: Extract<PreparedSend, { kind: 'node' }>,
    paymentRequest: string,
    options: {
      amountSats?: string;
      timeoutSeconds: number;
      onUpdate?: SendParams['onUpdate'];
      signal?: AbortSignal;
    },
  ): Promise<NodePaymentResult> {
    const { amountSats, timeoutSeconds, onUpdate, signal } = options;
    const onStatus = onUpdate
      ? (status: PaymentLifecycleStatus) => onUpdate({ status })
      : undefined;
    const common = {
      restHost: prepared.restHost,
      macaroon: prepared.macaroon,
      tlsCert: prepared.tlsCert,
      onUpdate: onStatus,
      signal,
    };

    return prepared.isAsset
      ? sendAssetPayment({
          ...common,
          body: {
            payment_request: {
              payment_request: paymentRequest,
              fee_limit_sat: FEE_LIMIT_SATS,
              timeout_seconds: timeoutSeconds,
            },
            ...(prepared.groupKeyBase64 ? { group_key: prepared.groupKeyBase64 } : {}),
          },
        })
      : sendLndPayment({
          ...common,
          body: {
            payment_request: paymentRequest,
            ...(amountSats ? { amt: amountSats } : {}),
            fee_limit_sat: FEE_LIMIT_SATS,
            timeout_seconds: timeoutSeconds,
          },
        });
  }
}
