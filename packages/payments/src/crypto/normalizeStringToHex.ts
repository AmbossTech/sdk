const HEX_RE = /^[0-9a-fA-F]+$/;

/** Even-length, hex-only string. */
export function isHex(value: string): boolean {
  return value.length > 0 && value.length % 2 === 0 && HEX_RE.test(value);
}

/** Round-trips through base64 decode/encode to confirm valid base64. */
export function isBase64(value: string): boolean {
  if (!value) return false;
  try {
    return Buffer.from(value, 'base64').toString('base64') === value;
  } catch {
    return false;
  }
}

/**
 * Normalizes a macaroon string to lowercase hex, accepting either hex or
 * base64 input. litd/LND expect the `Grpc-Metadata-macaroon` header in hex.
 * Ported from amboss-rails `src/lib/utils/convert/normalizeStringToHex.ts`.
 */
export function normalizeStringToHex(value: string): string {
  if (isHex(value)) {
    return value;
  }
  if (isBase64(value)) {
    return Buffer.from(value, 'base64').toString('hex');
  }
  throw new Error('Macaroon must be base64 or hex encoded');
}
