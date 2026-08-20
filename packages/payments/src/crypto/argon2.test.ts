import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ARGON2_PARAMS, createMasterPasswordHash, deriveMasterKey } from './argon2.js';

const PASSWORD = 'correct horse';
const TEAM_ID = 'Team-XYZ';
const EXPECTED_MASTER_KEY = 'f63aa9f891f1708717a8a77e3d50f71d5230013d96957c239959689dda858265';
const EXPECTED_MASTER_PASSWORD_HASH =
  '45181dcc67b7646fc9f0a318dc30201c31cfefa3260fbcc71e31d2b3f256881b';

describe('Argon2id worker', () => {
  it('preserves the master key and password hash outputs', async () => {
    assert.equal(await deriveMasterKey(PASSWORD, TEAM_ID), EXPECTED_MASTER_KEY);
    assert.deepEqual(await createMasterPasswordHash(PASSWORD, TEAM_ID), {
      masterKey: EXPECTED_MASTER_KEY,
      masterPasswordHash: EXPECTED_MASTER_PASSWORD_HASH,
    });
  });

  it('does not block the event loop while hashing', async () => {
    const timerFired = new Promise<number>((resolve) => {
      const start = Date.now();
      setTimeout(() => resolve(Date.now() - start), 20);
    });

    const hashPromise = deriveMasterKey(PASSWORD, TEAM_ID);
    assert.ok((await timerFired) < 500);
    await hashPromise;
  });

  it('keeps the required Argon2id parameters', () => {
    assert.deepEqual(ARGON2_PARAMS, { dkLen: 32, t: 3, m: 64000, p: 4 });
  });
});
