import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { argon2id } from '@noble/hashes/argon2';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

import { DecryptionError } from '../errors.js';
import { deriveMasterKey } from './argon2.js';
import { decryptAdminMacaroon } from './decryptAdminMacaroon.js';
import { nip44Encrypt } from './nip44.js';

// A deterministic 64-byte symmetric key (stand-in for the wallet's key).
const SYMMETRIC_KEY = bytesToHex(new Uint8Array(64).map((_, i) => (i * 7 + 3) & 0xff));
const MACAROON = '0201036c6e640224030a1077656c636f6d652d746f2d616d626f7373';

function buildFixture(password: string, teamId: string) {
  const masterKey = deriveMasterKey(password, teamId);
  return {
    encryptedSymmetricKey: nip44Encrypt(SYMMETRIC_KEY, masterKey),
    encryptedMacaroon: nip44Encrypt(MACAROON, SYMMETRIC_KEY),
  };
}

describe('argon2id (KDF)', () => {
  it('matches the RFC 9106 Argon2id test vector', () => {
    const tag = bytesToHex(
      argon2id(new Uint8Array(32).fill(0x01), new Uint8Array(16).fill(0x02), {
        t: 3,
        m: 32,
        p: 4,
        dkLen: 32,
        key: new Uint8Array(8).fill(0x03),
        personalization: new Uint8Array(12).fill(0x04),
        version: 0x13,
      }),
    );
    assert.equal(tag, '0d640df58d78766c08c037a34a8b53c9d01ef0452d75b65eb52520e96b01e659');
  });

  it('derives a stable 32-byte master key (regression lock)', () => {
    const key = deriveMasterKey('correct horse', 'Team-XYZ');
    assert.equal(hexToBytes(key).length, 32);
    assert.equal(key, 'f63aa9f891f1708717a8a77e3d50f71d5230013d96957c239959689dda858265');
  });

  it('treats the team id as a trimmed, lowercased salt', () => {
    assert.equal(deriveMasterKey('pw', 'Team-XYZ'), deriveMasterKey('pw', '  team-xyz  '));
  });
});

describe('decryptAdminMacaroon', () => {
  it('recovers the macaroon through the two-layer envelope', () => {
    const password = 'hunter2';
    const teamId = '11111111-1111-1111-1111-111111111111';
    const fixture = buildFixture(password, teamId);
    const result = decryptAdminMacaroon({ password, teamId, ...fixture });
    assert.equal(result, MACAROON);
  });

  it('throws DecryptionError on a wrong password', () => {
    const teamId = '11111111-1111-1111-1111-111111111111';
    const fixture = buildFixture('hunter2', teamId);
    assert.throws(
      () => decryptAdminMacaroon({ password: 'wrong', teamId, ...fixture }),
      DecryptionError,
    );
  });
});
