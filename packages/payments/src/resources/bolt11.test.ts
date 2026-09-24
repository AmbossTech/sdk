import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAmountlessBolt11 } from './bolt11.js';
import { FIXED_AMOUNT_BOLT11, ZERO_AMOUNT_BOLT11 } from './bolt11.fixtures.js';

describe('isAmountlessBolt11', () => {
  it('is true for a zero-amount invoice', () => {
    assert.equal(isAmountlessBolt11(ZERO_AMOUNT_BOLT11), true);
  });

  it('accepts a lightning: prefix and upper case', () => {
    assert.equal(isAmountlessBolt11(`LIGHTNING:${ZERO_AMOUNT_BOLT11.toUpperCase()}`), true);
  });

  it('is false for an invoice that encodes an amount', () => {
    assert.equal(isAmountlessBolt11(FIXED_AMOUNT_BOLT11), false);
  });

  it('throws for a string that is not a BOLT11 invoice', () => {
    assert.throws(() => isAmountlessBolt11('lnbc1xyz'));
  });
});
