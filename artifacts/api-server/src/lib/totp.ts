import crypto from "crypto";

function base32Decode(base32: string): Buffer {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (const ch of cleaned) {
    const idx = chars.indexOf(ch);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const msg = Buffer.alloc(8);
  msg.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

/**
 * Verify a TOTP code (RFC 6238, SHA1, 30s period, 6 digits).
 * Accepts ±2 windows (±60s) to tolerate clock drift.
 */
export function verifyTotp(secret: string, token: string): boolean {
  const t = Math.floor(Date.now() / 1000 / 30);
  for (let w = -2; w <= 2; w++) {
    if (hotp(secret, t + w) === token.trim()) return true;
  }
  return false;
}

/**
 * Generate the current TOTP code (useful for testing).
 */
export function generateTotp(secret: string): string {
  const t = Math.floor(Date.now() / 1000 / 30);
  return hotp(secret, t);
}
