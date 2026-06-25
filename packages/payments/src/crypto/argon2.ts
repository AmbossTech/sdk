import { argon2id } from '@noble/hashes/argon2';
import { bytesToHex } from '@noble/hashes/utils';

/**
 * Argon2id parameters. These MUST match the values used by the amboss-rails UI
 * (`src/lib/utils/crypto/createMasterPasswordHash.ts`, via `argon2-browser`) and
 * the backend that originally encrypted the symmetric key — otherwise the
 * derived master key won't decrypt anything.
 *
 * `memory` is in KiB (Argon2 `m` cost). Both @noble/hashes and argon2-browser
 * implement RFC 9106 Argon2id v0x13, so identical params yield identical output.
 */
export const ARGON2_PARAMS = {
  dkLen: 32,
  t: 3,
  m: 64000,
  p: 4,
} as const;

/**
 * Derives the master key (hex) from the team password and team id.
 * The team id is used as the Argon2 salt (trimmed + lowercased), matching the UI.
 */
export function deriveMasterKey(password: string, teamId: string): string {
  const salt = teamId.trim().toLowerCase();
  const key = password.trim();
  const hash = argon2id(key, salt, {
    dkLen: ARGON2_PARAMS.dkLen,
    t: ARGON2_PARAMS.t,
    m: ARGON2_PARAMS.m,
    p: ARGON2_PARAMS.p,
  });
  return bytesToHex(hash);
}

export interface MasterPasswordHashes {
  /** Decrypts the wallet's protected symmetric key (Argon2id of password salted by teamId). */
  masterKey: string;
  /** Sent to the API as `node_permissions(password_hash:)` for server-side verification. */
  masterPasswordHash: string;
}

/**
 * Mirrors amboss-rails `createMasterPasswordHash`:
 *   masterKey          = Argon2id(password, salt = teamId)
 *   masterPasswordHash = Argon2id(masterKey, salt = password)
 *
 * `masterKey` decrypts the symmetric key locally; `masterPasswordHash` proves
 * knowledge of the password to the server when reading `node_permissions`.
 */
export function createMasterPasswordHash(password: string, teamId: string): MasterPasswordHashes {
  const masterKey = deriveMasterKey(password, teamId);
  const masterPasswordHash = bytesToHex(
    argon2id(masterKey, password.trim(), {
      dkLen: ARGON2_PARAMS.dkLen,
      t: ARGON2_PARAMS.t,
      m: ARGON2_PARAMS.m,
      p: ARGON2_PARAMS.p,
    }),
  );
  return { masterKey, masterPasswordHash };
}
