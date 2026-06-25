import { PaymentSendError } from '../errors.js';
import { postPaymentStream } from './stream.js';
import type {
  LndPaymentUpdate,
  NodePaymentResult,
  PaymentLifecycleStatus,
  SendLndPaymentBody,
} from './types.js';

export interface SendLndPaymentParams {
  restHost: string;
  macaroon: string;
  body: SendLndPaymentBody;
  tlsCert?: string | null;
  onUpdate?: (status: PaymentLifecycleStatus) => void;
  signal?: AbortSignal;
}

/**
 * Executes a Lightning payment via LND's `POST /v2/router/send`, streaming
 * status until a terminal `SUCCEEDED`/`FAILED`. Ported from amboss-rails
 * `sendPaymentV2`.
 */
export async function sendLndPayment(params: SendLndPaymentParams): Promise<NodePaymentResult> {
  const { restHost, macaroon, body, tlsCert, onUpdate, signal } = params;
  let terminal: NodePaymentResult | null = null;
  let updateCount = 0;
  let lastStatus: string | undefined;

  await postPaymentStream<LndPaymentUpdate>(
    { url: `${restHost}/v2/router/send`, macaroon, body, tlsCert, signal },
    (update) => {
      updateCount += 1;
      if (update.error) {
        throw new PaymentSendError(update.error.message || 'Payment stream error');
      }
      const result = update.result;
      if (!result) return;
      lastStatus = result.status;
      onUpdate?.(result.status);
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
    throw new PaymentSendError(
      `Payment stream ended without a terminal status ` +
        `(received ${updateCount} update(s); ` +
        `${lastStatus ? `last status: ${lastStatus}` : 'no result in stream'}). ` +
        `Set AMBOSS_SDK_DEBUG=1 to log the raw stream.`,
    );
  }
  return terminal;
}
