export type PaymentEventType = 'payment.pending' | 'payment.completed' | 'payment.failed';

export type PaymentDirection = 'send' | 'receive';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export type PaymentType = 'bolt11' | 'bolt12' | 'onchain' | 'lnurl';

export type AssetAmount = {
  amount: string;
  asset_id: string;
  precision: number;
  asset_symbol: string;
};

export type PaymentDetails = {
  payment_hash: string;
  payment_type: PaymentType;
  payment_request: string;
};

export type PaymentEventData = {
  id: string;
  fee: AssetAmount | null;
  amount: AssetAmount;
  status: PaymentStatus;
  metadata: Record<string, unknown> | null;
  direction: PaymentDirection;
  expires_at: string | null;
  settled_at: string | null;
  description: string | null;
  exchange_rate: string | null;
  settle_amount: AssetAmount;
  payment_details: PaymentDetails;
};

export type PaymentEvent = {
  id: string;
  data: PaymentEventData;
  node_id: string | null;
  wallet_id: string;
  event_type: PaymentEventType;
  environment: 'sandbox' | 'production';
  environment_id: string;
};

export type VerifyWebhookEventInput = {
  payload: string | Buffer;
  signature: string;
  timestamp: string | number;
  toleranceSeconds?: number;
  now?: () => number;
};

export type VerifyWebhookEventParams = VerifyWebhookEventInput & {
  secret: string;
};
