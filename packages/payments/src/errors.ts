import { AmbossSdkError } from '@ambosstech/core';

/**
 * Thrown when the admin macaroon cannot be decrypted — typically a wrong team
 * password, a missing/garbled symmetric key, or corrupted ciphertext.
 */
export class DecryptionError extends AmbossSdkError {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'DecryptionError';
    this.cause = cause;
  }
}

/**
 * Thrown when the node reports a terminal failure for a send, or the payment
 * stream errors/ends without a terminal status.
 */
export class PaymentSendError extends AmbossSdkError {
  readonly failureReason?: string;

  constructor(message: string, failureReason?: string) {
    super(message);
    this.name = 'PaymentSendError';
    this.failureReason = failureReason;
  }
}

export class WebhookVerificationError extends Error {
  readonly code: WebhookVerificationErrorCode;

  constructor(code: WebhookVerificationErrorCode, message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
    this.code = code;
  }
}

export type WebhookVerificationErrorCode =
  | 'missing_signature'
  | 'missing_secret'
  | 'missing_timestamp'
  | 'invalid_timestamp'
  | 'timestamp_out_of_tolerance'
  | 'invalid_signature_format'
  | 'signature_mismatch'
  | 'invalid_payload_json';
