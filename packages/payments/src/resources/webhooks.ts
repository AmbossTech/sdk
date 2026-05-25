import { createHmac, timingSafeEqual } from 'node:crypto';

import { WebhookVerificationError } from '../errors.js';
import type {
  PaymentEvent,
  VerifyWebhookEventInput,
  VerifyWebhookEventParams,
} from '../types/webhooks.js';

const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

export class Webhooks {
  readonly #secret: string | undefined;

  constructor(secret?: string) {
    this.#secret = secret;
  }

  verify(input: VerifyWebhookEventInput): PaymentEvent {
    if (!this.#secret) {
      throw new WebhookVerificationError(
        'missing_secret',
        'webhookSecret was not provided to the Payments constructor',
      );
    }
    return Webhooks.verify({ ...input, secret: this.#secret });
  }

  static verify(params: VerifyWebhookEventParams): PaymentEvent {
    const {
      secret,
      payload,
      signature,
      timestamp,
      toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
      now = () => Math.floor(Date.now() / 1000),
    } = params;

    if (!secret) {
      throw new WebhookVerificationError('missing_secret', 'secret is required');
    }
    if (!signature) {
      throw new WebhookVerificationError('missing_signature', 'signature is required');
    }
    if (timestamp === undefined || timestamp === null || timestamp === '') {
      throw new WebhookVerificationError('missing_timestamp', 'timestamp is required');
    }

    const timestampStr = String(timestamp);
    const timestampNum = Number(timestampStr);
    if (!Number.isFinite(timestampNum)) {
      throw new WebhookVerificationError(
        'invalid_timestamp',
        `timestamp is not a number: ${timestampStr}`,
      );
    }

    if (Number.isFinite(toleranceSeconds)) {
      const skew = Math.abs(now() - timestampNum);
      if (skew > toleranceSeconds) {
        throw new WebhookVerificationError(
          'timestamp_out_of_tolerance',
          `timestamp skew ${skew}s exceeds tolerance ${toleranceSeconds}s`,
        );
      }
    }

    const bodyBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8');
    const signedPayload = Buffer.concat([Buffer.from(`${timestampStr}.`, 'utf8'), bodyBuffer]);
    const expected = createHmac('sha256', secret).update(signedPayload).digest();

    let received: Buffer;
    try {
      received = Buffer.from(signature, 'hex');
    } catch {
      throw new WebhookVerificationError('invalid_signature_format', 'signature is not hex');
    }
    if (received.length !== expected.length) {
      throw new WebhookVerificationError('invalid_signature_format', 'signature length mismatch');
    }
    if (!timingSafeEqual(received, expected)) {
      throw new WebhookVerificationError(
        'signature_mismatch',
        'signature does not match expected HMAC',
      );
    }

    const bodyString = bodyBuffer.toString('utf8');
    try {
      return JSON.parse(bodyString) as PaymentEvent;
    } catch (err) {
      throw new WebhookVerificationError(
        'invalid_payload_json',
        `payload is not valid JSON: ${(err as Error).message}`,
      );
    }
  }
}
