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
    payment_preimage?: string;
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

/**
 * Request body for `POST /v1/taproot-assets/channels/send-payment` (litd).
 * `payment_request` is the nested LND `routerrpc.SendPaymentRequest` (not a bare
 * bolt11 string); litd derives the asset/RFQ from the wallet's asset channel.
 */
export interface SendAssetPaymentBody {
  payment_request: {
    payment_request: string;
    fee_limit_sat: string;
    timeout_seconds: number;
  };
  /**
   * Asset group key — identifies which asset to spend on the asset channel.
   * base64-encoded bytes (litd's REST gateway decodes this to the raw 33-byte
   * compressed pubkey), NOT hex. See `hexGroupKeyToBase64` in transactions.ts.
   */
  group_key?: string;
}

/** Streamed update from the Taproot Assets send-payment endpoint (litd). */
export interface AssetPaymentUpdate {
  result?: {
    payment_result?: {
      payment_hash?: string;
      payment_preimage?: string;
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
  /** Payment preimage (proof of payment). Present on SUCCEEDED payments. */
  preimage?: string;
  feeSat?: string;
  failureReason?: string;
}
