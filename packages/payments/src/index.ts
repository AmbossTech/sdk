import type { Environments } from './resources/environments.js';
import type { Transactions } from './resources/transactions.js';
import type { Wallets } from './resources/wallets.js';

export { Payments, type PaymentsConfig } from './client.js';
export { Webhooks } from './resources/webhooks.js';
export { Environments } from './resources/environments.js';
export { Wallets } from './resources/wallets.js';
export { Transactions } from './resources/transactions.js';

export { WebhookVerificationError, DecryptionError, PaymentSendError } from './errors.js';
export type { WebhookVerificationErrorCode } from './errors.js';

export type {
  SendDestination,
  SendParams,
  SendProgress,
  SendResult,
} from './resources/transactions.types.js';
export type { NodePaymentResult, PaymentLifecycleStatus } from './node/types.js';

// These methods' param/result types (e.g. `CreateReceiveTransactionInput`,
// `PaymentsTransactionFieldsFragment`) come from the generated GraphQL SDK,
// which isn't part of the public entrypoint. Derive them from the resource
// classes themselves rather than duplicating the generated types by hand.
export type CreateReceiveParams = Parameters<Transactions['createReceive']>[0];
export type CreateReceiveResult = Awaited<ReturnType<Transactions['createReceive']>>;

export type CreateWalletParams = Parameters<Wallets['create']>[0];
export type CreateWalletResult = Awaited<ReturnType<Wallets['create']>>;

export type CreateEnvironmentParams = Parameters<Environments['create']>[0];
export type CreateEnvironmentResult = Awaited<ReturnType<Environments['create']>>;

export type {
  AssetAmount,
  PaymentDetails,
  PaymentDirection,
  PaymentEvent,
  PaymentEventData,
  PaymentEventType,
  PaymentStatus,
  PaymentType,
  VerifyWebhookEventInput,
  VerifyWebhookEventParams,
} from './types/webhooks.js';

export { ApiError, AmbossSdkError, ConfigError, NetworkError } from '@ambosstech/core';
