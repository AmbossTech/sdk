import type { PaymentsTransactionFieldsFragment } from '../generated/sdk.js';
import type { NodePaymentResult, PaymentLifecycleStatus } from '../node/types.js';

/**
 * Where the payment goes. Provide exactly one:
 *  - `bolt11`: pay a BOLT11 invoice. `amountSats` is only needed for
 *    zero-amount invoices (it is passed to the node as the spend amount).
 *  - `lightningAddress` + `amountSats`: pay a Lightning address for a fixed amount.
 */
export type SendDestination =
  | { bolt11: string; amountSats?: string }
  | { lightningAddress: string; amountSats: string };

export interface SendProgress {
  status: PaymentLifecycleStatus;
}

/**
 * Credentials needed to resolve a wallet's send context — everything
 * {@link SendParams} carries except the payment itself. Used by
 * `Transactions.prepareSend` and by the `send` option on `PaymentsConfig`.
 */
export interface PrepareSendParams {
  /** Wallet to send from. */
  walletId: string;
  /**
   * Team password — used to decrypt the node admin macaroon in-process.
   * Required for live wallets. Ignored for sandbox wallets, where the backend
   * settles the transaction itself and no node payment is executed.
   */
  password?: string;
  /**
   * Team id — the Argon2 salt for key derivation. Optional: it is resolved
   * automatically from the wallet. Provide it only to override the resolved
   * value.
   */
  teamId?: string;
}

/**
 * Everything `send()` needs before it can create and pay a transaction,
 * resolved once and cached per wallet, plus the team id that resolution used.
 * Only the decrypted macaroon is retained — the Argon2 master key is discarded
 * after the decrypt.
 */
export type PreparedSend =
  | { kind: 'sandbox' }
  | {
      kind: 'node';
      /**
       * Team id used as the Argon2 salt — the wallet's own unless the caller
       * overrode it. `send()` never reads this; the cache records it so a later
       * call naming the same team id explicitly is recognised as the same
       * credentials. Not a secret: the service API key alone can read it.
       */
      teamId: string;
      restHost: string;
      macaroon: string;
      tlsCert?: string | null;
      isAsset: boolean;
      /** Taproot asset group key, already converted to the base64 litd expects. */
      groupKeyBase64?: string;
    };

export interface SendParams extends PrepareSendParams {
  destination: SendDestination;
  /** Idempotency key forwarded to `create_send`. */
  idempotencyKey?: string;
  /** Arbitrary metadata stored on the transaction (serialized to JSON). */
  metadata?: Record<string, string>;
  /** Node payment timeout in seconds (default 60). */
  timeoutSeconds?: number;
  /** Called on each in-flight status update from the node. */
  onUpdate?: (progress: SendProgress) => void;
  /** Aborts the in-flight node payment. */
  signal?: AbortSignal;
}

export interface SendResult {
  /** The transaction record created by `create_send`. */
  transaction: PaymentsTransactionFieldsFragment;
  /**
   * Terminal outcome of the node payment, or `null` for sandbox wallets. In
   * sandbox the backend settles the transaction asynchronously (no node
   * payment runs), so observe the outcome via webhooks or by polling the
   * transaction status rather than this field.
   */
  payment: NodePaymentResult | null;
}
