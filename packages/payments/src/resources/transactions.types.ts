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

export interface SendParams {
  /** Wallet to send from. */
  walletId: string;
  /** Team password — used to decrypt the node admin macaroon in-process. */
  password: string;
  /**
   * Team id — the Argon2 salt for key derivation. Required when using a service
   * API key (which cannot read the `user` query); if omitted, it is resolved
   * from the authenticated user.
   */
  teamId?: string;
  /** Maximum routing fee, in satoshis. */
  feeLimitSats: string;
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
  /** Terminal outcome of the node payment. */
  payment: NodePaymentResult;
}
