/** Lifecycle status reported by LND's router for a payment. */
export type PaymentLifecycleStatus = 'UNKNOWN' | 'INITIATED' | 'IN_FLIGHT' | 'SUCCEEDED' | 'FAILED';

/** Request body for `POST /v2/router/send` (LND). */
export interface SendLndPaymentBody {
  payment_request: string;
  amt?: string;
  fee_limit_sat: string;
  timeout_seconds: number;
}

/** Streamed update from `POST /v2/router/send` (LND). */
export interface LndPaymentUpdate {
  result?: {
    payment_hash?: string;
    value_sat?: string;
    status: PaymentLifecycleStatus;
    fee_sat?: string;
    failure_reason?: string;
  };
  error?: {
    code?: number;
    message: string;
  };
}

/** Request body for `POST /v2/taproot-assets/channels/send-payment` (litd). */
export interface SendAssetPaymentBody {
  payment_request: string;
  fee_limit_sats: string;
  timeout_seconds: number;
}

/** Streamed update from the Taproot Assets send-payment endpoint (litd). */
export interface AssetPaymentUpdate {
  result?: {
    payment_result?: {
      payment_hash?: string;
      value_sat?: string;
      status: string;
      fee_sat?: string;
      failure_reason?: string;
    };
  };
  error?: {
    code?: number;
    message: string;
  };
}

/** Terminal outcome of a node payment, normalized across LND and litd. */
export interface NodePaymentResult {
  status: 'SUCCEEDED' | 'FAILED';
  paymentHash?: string;
  feeSat?: string;
  failureReason?: string;
}
