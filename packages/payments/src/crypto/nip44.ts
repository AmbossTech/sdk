import { hexToBytes } from '@noble/hashes/utils';
import { nip44 } from 'nostr-tools';

/**
 * NIP-44 v2 (ChaCha20 + HMAC-SHA256) encrypt/decrypt, keyed by a 32-byte hex key.
 * Ported from amboss-rails `src/lib/utils/crypto/encryption.ts` — same library
 * (`nostr-tools`), so the wire format is identical.
 */
export function nip44Encrypt(data: string, hexKey: string): string {
  return nip44.v2.encrypt(data, hexToBytes(hexKey));
}

export function nip44Decrypt(payload: string, hexKey: string): string {
  return nip44.v2.decrypt(payload, hexToBytes(hexKey));
}
