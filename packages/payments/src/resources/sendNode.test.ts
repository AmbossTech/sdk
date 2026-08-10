import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { selectSendNode, type SendNodeCandidate } from './sendNode.js';

function node(sockets: SendNodeCandidate['sockets']): SendNodeCandidate {
  return { encrypted_macaroon: 'macaroon', sockets };
}

describe('selectSendNode', () => {
  it('picks the litd socket for asset sends', () => {
    const result = selectSendNode([node({ litd: { rest: 'https://litd' } })], true);
    assert.equal(result?.restHost, 'https://litd');
  });

  it('falls back to litd for base-asset sends when no lnd socket is present', () => {
    const result = selectSendNode([node({ litd: { rest: 'https://litd' } })], false);
    assert.equal(result?.restHost, 'https://litd');
  });

  it('prefers the litd socket for base-asset sends when both are present', () => {
    const result = selectSendNode(
      [node({ lnd: { rest: 'https://lnd' }, litd: { rest: 'https://litd' } })],
      false,
    );
    assert.equal(result?.restHost, 'https://litd');
  });

  it('falls back to the lnd socket for base-asset sends when litd is absent', () => {
    const result = selectSendNode([node({ lnd: { rest: 'https://lnd' } })], false);
    assert.equal(result?.restHost, 'https://lnd');
  });

  it('returns null for asset sends when only an lnd socket is present', () => {
    const result = selectSendNode([node({ lnd: { rest: 'https://lnd' } })], true);
    assert.equal(result, null);
  });
});
