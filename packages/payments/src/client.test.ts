import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ConfigError } from '@ambosstech/core';

import { Payments } from './client.js';

describe('Payments serviceApiKey gating', () => {
  it('webhooks API works without a key when webhookSecret provided', () => {
    const payments = new Payments({ webhookSecret: 'whsec_test' });
    assert.ok(payments.webhooks);
  });

  it('throws ConfigError when accessing environments without a serviceApiKey', () => {
    const payments = new Payments({ webhookSecret: 'whsec_test' });
    assert.throws(
      () => payments.environments,
      (err: unknown) => err instanceof ConfigError,
    );
  });

  it('throws ConfigError when accessing wallets without a serviceApiKey', () => {
    const payments = new Payments({});
    assert.throws(
      () => payments.wallets,
      (err: unknown) => err instanceof ConfigError,
    );
  });

  it('throws ConfigError when accessing transactions without a serviceApiKey', () => {
    const payments = new Payments({});
    assert.throws(
      () => payments.transactions,
      (err: unknown) => err instanceof ConfigError,
    );
  });

  it('rejects a bearer apiKey alone — payments is service-key only', () => {
    const payments = new Payments({ apiKey: 'bearer_test' });
    assert.throws(
      () => payments.transactions,
      (err: unknown) => err instanceof ConfigError,
    );
  });

  it('throws ConfigError when send pre-warming is configured without a serviceApiKey', () => {
    // Otherwise the missing key is swallowed by the per-wallet catch and the
    // wallets are never pre-warmed, with nothing to explain why.
    assert.throws(
      () => new Payments({ send: [{ walletId: 'w1', password: 'hunter2-pw' }] }),
      (err: unknown) => err instanceof ConfigError,
    );
  });

  it('does not throw when serviceApiKey is provided', () => {
    const payments = new Payments({ serviceApiKey: 'amb_live_test', webhookSecret: 'whsec_test' });
    assert.ok(payments.environments);
    assert.ok(payments.wallets);
    assert.ok(payments.transactions);
    assert.ok(payments.webhooks);
  });
});
