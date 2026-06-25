import { DecryptionError } from '../errors.js';
import { deriveMasterKey } from './argon2.js';
import { nip44Decrypt } from './nip44.js';

export interface DecryptAdminMacaroonParams {
  /** Team password supplied by the SDK caller. */
  password: string;
  /** Team id — the Argon2 salt. */
  teamId: string;
  /** Wallet-level protected symmetric key (`node_permissions.encrypted_symmetric_key`). */
  encryptedSymmetricKey: string;
  /** Node-level encrypted admin macaroon (`node_permissions.nodes[].encrypted_macaroon`). */
  encryptedMacaroon: string;
}

/**
 * Reproduces the amboss-rails client-side decryption envelope
 * (`src/lib/utils/crypto/decryptAdminMacaroon.ts`):
 *
 *   masterKey    = Argon2id(password, salt = teamId)
 *   symmetricKey = NIP44.decrypt(encryptedSymmetricKey, masterKey)
 *   macaroon     = NIP44.decrypt(encryptedMacaroon, symmetricKey)
 *
 * The decrypted macaroon never leaves the caller's process — it is used only to
 * authenticate directly against the node. Throws {@link DecryptionError} on any
 * failure (almost always a wrong password).
 */
export function decryptAdminMacaroon(params: DecryptAdminMacaroonParams): string {
  const { password, teamId, encryptedSymmetricKey, encryptedMacaroon } = params;
  try {
    const masterKey = deriveMasterKey(password, teamId);
    return decryptAdminMacaroonWithMasterKey({
      masterKey,
      encryptedSymmetricKey,
      encryptedMacaroon,
    });
  } catch (err) {
    throw new DecryptionError(
      'Failed to decrypt the admin macaroon. Check that the team password is correct.',
      err,
    );
  }
}

export interface DecryptAdminMacaroonWithMasterKeyParams {
  /** Argon2id master key (`deriveMasterKey` / `createMasterPasswordHash().masterKey`). */
  masterKey: string;
  encryptedSymmetricKey: string;
  encryptedMacaroon: string;
}

/**
 * Same decryption envelope as {@link decryptAdminMacaroon}, but takes a
 * precomputed `masterKey` so callers that already derived it (e.g. to also
 * produce the `masterPasswordHash`) don't run Argon2 twice.
 */
export function decryptAdminMacaroonWithMasterKey(
  params: DecryptAdminMacaroonWithMasterKeyParams,
): string {
  const { masterKey, encryptedSymmetricKey, encryptedMacaroon } = params;
  try {
    const symmetricKey = nip44Decrypt(encryptedSymmetricKey, masterKey);
    return nip44Decrypt(encryptedMacaroon, symmetricKey);
  } catch (err) {
    throw new DecryptionError(
      'Failed to decrypt the admin macaroon. Check that the team password is correct.',
      err,
    );
  }
}
