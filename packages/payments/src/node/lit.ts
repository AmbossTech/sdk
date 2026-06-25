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
 * `POST /v2/taproot-assets/channels/send-payment`, streaming status until a
 * terminal `SUCCEEDED`/`FAILED`. Ported from amboss-rails `sendAssetPayment`.
 */
export async function sendAssetPayment(params: SendAssetPaymentParams): Promise<NodePaymentResult> {
  const { restHost, macaroon, body, tlsCert, onUpdate, signal } = params;
  let terminal: NodePaymentResult | null = null;

  await postPaymentStream<AssetPaymentUpdate>(
    {
      url: `${restHost}/v2/taproot-assets/channels/send-payment`,
      macaroon,
      body,
      tlsCert,
      signal,
    },
    (update) => {
      if (update.error) {
        throw new PaymentSendError(update.error.message || 'Asset payment stream error');
      }
      const result = update.result?.payment_result;
      if (!result) return;
      onUpdate?.(result.status as PaymentLifecycleStatus);
      if (result.status === 'SUCCEEDED' || result.status === 'FAILED') {
        terminal = {
          status: result.status,
          paymentHash: result.payment_hash,
          feeSat: result.fee_sat,
          failureReason: result.failure_reason,
        };
      }
    },
  );

  if (!terminal) {
    throw new PaymentSendError('Asset payment stream ended without a terminal status');
  }
  return terminal;
}
