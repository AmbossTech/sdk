import { PaymentSendError } from '../errors.js';
import { postPaymentStream } from './stream.js';
import type {
  AssetPaymentUpdate,
  NodePaymentResult,
  PaymentLifecycleStatus,
  SendAssetPaymentBody,
} from './types.js';

export interface SendAssetPaymentParams {
  restHost: string;
  macaroon: string;
  body: SendAssetPaymentBody;
  tlsCert?: string | null;
  onUpdate?: (status: PaymentLifecycleStatus) => void;
  signal?: AbortSignal;
}

/**
 * Executes a Taproot Asset payment via litd's
 * `POST /v1/taproot-assets/channels/send-payment`, streaming status until a
 * terminal `SUCCEEDED`/`FAILED`. Ported from amboss-rails `sendAssetPayment`.
 */
export async function sendAssetPayment(params: SendAssetPaymentParams): Promise<NodePaymentResult> {
  const { restHost, macaroon, body, tlsCert, onUpdate, signal } = params;
  let terminal: NodePaymentResult | null = null;
  let updateCount = 0;
  let lastPaymentStatus: string | undefined;

  await postPaymentStream<AssetPaymentUpdate>(
    {
      url: `${restHost}/v1/taproot-assets/channels/send-payment`,
      macaroon,
      body,
      tlsCert,
      signal,
    },
    (update) => {
      updateCount += 1;
      if (update.error) {
        throw new PaymentSendError(update.error.message || 'Asset payment stream error');
      }
      const result = update.result?.payment_result;
      if (!result) return;
      lastPaymentStatus = result.status;
      onUpdate?.(result.status as PaymentLifecycleStatus);
      if (result.status === 'SUCCEEDED' || result.status === 'FAILED') {
        terminal = {
          status: result.status,
          paymentHash: result.payment_hash,
          preimage: result.payment_preimage,
          feeSat: result.fee_sat,
          failureReason: result.failure_reason,
        };
      }
    },
  );

  if (!terminal) {
    throw new PaymentSendError(
      `Asset payment stream ended without a terminal status ` +
        `(received ${updateCount} update(s); ` +
        `${lastPaymentStatus ? `last payment status: ${lastPaymentStatus}` : 'no payment_result in stream'}). ` +
        `Set AMBOSS_SDK_DEBUG=1 to log the raw stream.`,
    );
  }
  return terminal;
}
