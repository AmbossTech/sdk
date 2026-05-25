import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, it } from 'node:test';

import { WebhookVerificationError } from '../errors.js';
import { Payments } from '../client.js';
import { Webhooks } from './webhooks.js';

const SECRET = 'whsec_test_secret_value';
const TIMESTAMP = '1779712479';
const BODY = JSON.stringify({
  id: 'payment.completed:b24bdb74-f7b7-4deb-ae66-74b2d23ef232',
  data: {
    id: 'b24bdb74-f7b7-4deb-ae66-74b2d23ef232',
    fee: null,
    amount: {
      amount: '100',
      asset_id: '00000000-0000-0000-0000-000000000000',
      precision: 11,
      asset_symbol: 'BTC',
    },
    status: 'completed',
    metadata: null,
    direction: 'receive',
    expires_at: '2026-05-25T12:44:34.188Z',
    settled_at: '2026-05-25T12:34:39.365Z',
    description: null,
    exchange_rate: '77316',
    settle_amount: {
      amount: '100',
      asset_id: '00000000-0000-0000-0000-000000000000',
      precision: 11,
      asset_symbol: 'BTC',
    },
    payment_details: {
      payment_hash: '787a14966f86721bef98ed711d3d320696a33b8078967a113c5f50f3909cb6a2',
      payment_type: 'bolt11',
      payment_request: 'lnbcrt1u1p4pgsw6...',
    },
  },
  node_id: null,
  wallet_id: 'b0c63d20-7ccd-44a0-a0c5-31d31bc856fe',
  event_type: 'payment.completed',
  environment: 'sandbox',
  environment_id: 'e7f88ffe-8088-44c7-beb5-75d1ea11bd8a',
});

function sign(secret: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

const FROZEN_NOW = (): number => Number(TIMESTAMP);

describe('Webhooks.verify (static)', () => {
  it('returns parsed event for valid signature', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    const event = Webhooks.verify({
      secret: SECRET,
      payload: BODY,
      signature,
      timestamp: TIMESTAMP,
      now: FROZEN_NOW,
    });
    assert.equal(event.event_type, 'payment.completed');
    assert.equal(event.data.status, 'completed');
    assert.equal(event.wallet_id, 'b0c63d20-7ccd-44a0-a0c5-31d31bc856fe');
  });

  it('accepts Buffer payload', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    const event = Webhooks.verify({
      secret: SECRET,
      payload: Buffer.from(BODY, 'utf8'),
      signature,
      timestamp: TIMESTAMP,
      now: FROZEN_NOW,
    });
    assert.equal(event.id, 'payment.completed:b24bdb74-f7b7-4deb-ae66-74b2d23ef232');
  });

  it('accepts numeric timestamp', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    const event = Webhooks.verify({
      secret: SECRET,
      payload: BODY,
      signature,
      timestamp: Number(TIMESTAMP),
      now: FROZEN_NOW,
    });
    assert.equal(event.event_type, 'payment.completed');
  });

  it('throws missing_secret when secret is empty', () => {
    assert.throws(
      () =>
        Webhooks.verify({
          secret: '',
          payload: BODY,
          signature: 'a'.repeat(64),
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) => err instanceof WebhookVerificationError && err.code === 'missing_secret',
    );
  });

  it('throws signature_mismatch on bad signature', () => {
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY,
          signature: 'deadbeef'.repeat(8),
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) =>
        err instanceof WebhookVerificationError && err.code === 'signature_mismatch',
    );
  });

  it('throws signature_mismatch when secret is wrong', () => {
    const signature = sign('different_secret', TIMESTAMP, BODY);
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY,
          signature,
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) =>
        err instanceof WebhookVerificationError && err.code === 'signature_mismatch',
    );
  });

  it('throws signature_mismatch when body is tampered', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY + ' ',
          signature,
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) =>
        err instanceof WebhookVerificationError && err.code === 'signature_mismatch',
    );
  });

  it('throws invalid_signature_format on non-hex signature', () => {
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY,
          signature: 'not-hex-!!!',
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) =>
        err instanceof WebhookVerificationError && err.code === 'invalid_signature_format',
    );
  });

  it('throws timestamp_out_of_tolerance when timestamp too old', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY,
          signature,
          timestamp: TIMESTAMP,
          now: () => Number(TIMESTAMP) + 10_000,
        }),
      (err: unknown) =>
        err instanceof WebhookVerificationError && err.code === 'timestamp_out_of_tolerance',
    );
  });

  it('skips skew check when toleranceSeconds is Infinity', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    const event = Webhooks.verify({
      secret: SECRET,
      payload: BODY,
      signature,
      timestamp: TIMESTAMP,
      toleranceSeconds: Number.POSITIVE_INFINITY,
      now: () => Number(TIMESTAMP) + 10_000_000,
    });
    assert.equal(event.event_type, 'payment.completed');
  });

  it('throws missing_signature when signature absent', () => {
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY,
          signature: '',
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) => err instanceof WebhookVerificationError && err.code === 'missing_signature',
    );
  });

  it('throws missing_timestamp when timestamp absent', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY,
          signature,
          timestamp: '',
          now: FROZEN_NOW,
        }),
      (err: unknown) => err instanceof WebhookVerificationError && err.code === 'missing_timestamp',
    );
  });

  it('throws invalid_timestamp on non-numeric timestamp', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: BODY,
          signature,
          timestamp: 'not-a-number',
          now: FROZEN_NOW,
        }),
      (err: unknown) => err instanceof WebhookVerificationError && err.code === 'invalid_timestamp',
    );
  });

  it('throws invalid_payload_json on non-JSON body', () => {
    const badBody = 'not json';
    const signature = sign(SECRET, TIMESTAMP, badBody);
    assert.throws(
      () =>
        Webhooks.verify({
          secret: SECRET,
          payload: badBody,
          signature,
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) =>
        err instanceof WebhookVerificationError && err.code === 'invalid_payload_json',
    );
  });
});

describe('Payments.webhooks (instance)', () => {
  it('verifies with constructor webhookSecret', () => {
    const payments = new Payments({ webhookSecret: SECRET });
    const signature = sign(SECRET, TIMESTAMP, BODY);
    const event = payments.webhooks.verify({
      payload: BODY,
      signature,
      timestamp: TIMESTAMP,
      now: FROZEN_NOW,
    });
    assert.equal(event.event_type, 'payment.completed');
  });

  it('throws missing_secret when webhookSecret not in constructor', () => {
    const payments = new Payments({});
    const signature = sign(SECRET, TIMESTAMP, BODY);
    assert.throws(
      () =>
        payments.webhooks.verify({
          payload: BODY,
          signature,
          timestamp: TIMESTAMP,
          now: FROZEN_NOW,
        }),
      (err: unknown) => err instanceof WebhookVerificationError && err.code === 'missing_secret',
    );
  });

  it('static Payments.webhooks.verify works without instance', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);
    const event = Payments.webhooks.verify({
      secret: SECRET,
      payload: BODY,
      signature,
      timestamp: TIMESTAMP,
      now: FROZEN_NOW,
    });
    assert.equal(event.event_type, 'payment.completed');
  });
});
