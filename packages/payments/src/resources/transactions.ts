import { createHash } from 'node:crypto';

import type { GraphQLClient } from 'graphql-request';

import { createMasterPasswordHash } from '../crypto/argon2.js';
import { decryptAdminMacaroonWithMasterKey } from '../crypto/decryptAdminMacaroon.js';
import { PaymentSendError } from '../errors.js';
import {
  getSdk,
  type CreateReceiveTransactionInput,
  type CreateSendTransactionInput,
  type PaymentsTransactionFieldsFragment,
} from '../generated/sdk.js';
import { sendAssetPayment } from '../node/lit.js';
import { sendLndPayment } from '../node/lnd.js';
import type { PaymentLifecycleStatus } from '../node/types.js';
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
 * Cache slot for one wallet's prepared send context. `value` is only set once
 * `promise` resolves, so `isSendReady` can distinguish "ready" from "still
 * deriving" — Argon2 takes seconds and the promise exists for all of it.
 */
interface PreparedSlot {
  promise: Promise<PreparedSend>;
  /** Identifies the credentials this slot was derived from — see {@link credentialFingerprint}. */
  fingerprint: string;
  value?: PreparedSend;
}

/**
 * Identifies the credentials a cache slot was derived from, so a `send()` made
 * with a *different* password can never reuse a macaroon decrypted from the old
 * one. Not a password hash: it only has to be a fast in-process equality check,
 * and the plaintext password already lives in the caller's memory.
 */
function credentialFingerprint(params: PrepareSendParams): string {
  return createHash('sha256')
    .update(`${params.password ?? ''}\u0000${params.teamId ?? ''}`)
    .digest('hex');
}

/**
 * A prepared slot is reusable when the caller supplied no password (the whole
 * point of preparing) or supplied exactly the credentials it was derived from.
 */
function isReusable(slot: PreparedSlot, params: PrepareSendParams): boolean {
  return params.password === undefined || slot.fingerprint === credentialFingerprint(params);
}

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
  /** Prepared send contexts, keyed by wallet id. ponytail: no TTL — call `forgetSend()` to refresh. */
  readonly #prepared = new Map<string, PreparedSlot>();

  constructor(graphqlClient: GraphQLClient) {
    this.#sdk = getSdk(graphqlClient, translateSdkErrors);
  }

  /**
   * Resolves and caches everything `send()` needs before it can pay: the
   * wallet's environment type, its node endpoint, and — for live wallets — the
   * decrypted admin macaroon. Two GraphQL round-trips plus two Argon2id passes,
   * so calling this ahead of time takes seconds off the first `send()`.
   *
   * Subsequent `send()` calls for the same wallet can then omit `password`.
   * Safe to call repeatedly: an already-prepared wallet resolves immediately.
   *
   * **Blocks the event loop.** Argon2id is synchronous and CPU-bound
   * (m=64 MiB, t=3, p=4); this method is `async` because of the API calls, not
   * because the key derivation yields. Prepare during startup, not while
   * serving requests.
   */
  async prepareSend(params: PrepareSendParams): Promise<void> {
    await this.#prepare(params);
  }

  /**
   * Whether `walletId`'s macaroon and node endpoint are decrypted and resident
   * in memory, so a `send()` would skip straight to creating the transaction.
   * `false` while a `prepareSend()` for that wallet is still running.
   */
  isSendReady(walletId: string): boolean {
    return this.#prepared.get(walletId)?.value !== undefined;
  }

  /**
   * Drops a wallet's prepared context, releasing the decrypted macaroon from
   * memory. Use it to pick up rotated node credentials, or to stop holding node
   * admin access once a run of sends is done.
   */
  forgetSend(walletId: string): void {
    this.#prepared.delete(walletId);
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

    // 1–2. Resolve the node endpoint + decrypted macaroon. Returns from cache
    //      when the wallet was prepared, otherwise does the full derivation
    //      here. A wrong password fails here, before any transaction is made.
    const prepared = await this.#prepare(params);

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

    const payment = prepared.isAsset
      ? await sendAssetPayment({
          ...common,
          body: {
            payment_request: {
              payment_request: transaction.payment_request,
              fee_limit_sat: FEE_LIMIT_SATS,
              timeout_seconds: timeoutSeconds,
            },
            ...(prepared.groupKeyBase64 ? { group_key: prepared.groupKeyBase64 } : {}),
          },
        })
      : await sendLndPayment({
          ...common,
          body: {
            payment_request: transaction.payment_request,
            ...(lndAmountSats(destination) ? { amt: lndAmountSats(destination) } : {}),
            fee_limit_sat: FEE_LIMIT_SATS,
            timeout_seconds: timeoutSeconds,
          },
        });

    return { transaction, payment };
  }

  /** Returns the wallet's prepared context, deriving and caching it on first use. */
  #prepare(params: PrepareSendParams): Promise<PreparedSend> {
    const { walletId } = params;
    const cached = this.#prepared.get(walletId);
    if (cached && isReusable(cached, params)) return cached.promise;

    const promise = this.#resolveSendContext(params);
    const slot: PreparedSlot = { promise, fingerprint: credentialFingerprint(params) };
    this.#prepared.set(walletId, slot);

    // Attaching handlers here also marks `promise` as handled, so the
    // fire-and-forget constructor pre-warm can never raise `unhandledRejection`.
    promise.then(
      (value) => {
        if (this.#prepared.get(walletId) === slot) {
          this.#prepared.set(walletId, { ...slot, value });
        }
      },
      () => {
        // Evict on failure so a transient error doesn't poison later sends.
        // The rejection still reaches whoever awaits `promise`.
        if (this.#prepared.get(walletId) === slot) this.#prepared.delete(walletId);
      },
    );

    return promise;
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
    const { masterKey, masterPasswordHash } = createMasterPasswordHash(password, teamId);

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
}
