import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isAmountlessBolt11 } from './bolt11.js';

describe('isAmountlessBolt11', () => {
  it('is true when the human-readable part has no amount', () => {
    assert.equal(isAmountlessBolt11('lnbcrt1pn9xyz'), true);
    assert.equal(isAmountlessBolt11('LIGHTNING:LNTBS1PN9XYZ'), true);
  });

  it('is false when the human-readable part encodes an amount', () => {
    assert.equal(isAmountlessBolt11('lnbcrt2500u1pn9xyz'), false);
    assert.equal(isAmountlessBolt11('lnbc10n1pn9xyz'), false);
  });
});
