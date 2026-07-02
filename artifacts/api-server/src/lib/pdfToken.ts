import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Short-lived, HMAC-signed PDF download tokens
// Format: <userId>.<expiresAt>.<random>.<hmac>
// - expiresAt: Unix timestamp in seconds
// - random: 8 hex bytes to prevent token reuse within the same second
// - hmac: HMAC-SHA256(userId:expiresAt:random, SESSION_SECRET)

const PDF_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set");
  return secret;
}

function computeHmac(userId: number, expiresAt: number, rand: string): string {
  return createHmac("sha256", getSecret())
    .update(`${userId}:${expiresAt}:${rand}`)
    .digest("hex");
}

export function generatePdfToken(userId: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + PDF_TOKEN_TTL_SECONDS;
  const rand = randomBytes(8).toString("hex");
  const hmac = computeHmac(userId, expiresAt, rand);
  return `${userId}.${expiresAt}.${rand}.${hmac}`;
}

export function verifyPdfToken(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [rawUserId, rawExpiresAt, rand, providedHmac] = parts;
  const userId = parseInt(rawUserId, 10);
  const expiresAt = parseInt(rawExpiresAt, 10);

  if (isNaN(userId) || isNaN(expiresAt)) return null;

  // Check expiry
  if (Math.floor(Date.now() / 1000) > expiresAt) return null;

  // Constant-time HMAC comparison
  const expectedHmac = computeHmac(userId, expiresAt, rand);
  try {
    const a = Buffer.from(providedHmac, "hex");
    const b = Buffer.from(expectedHmac, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return userId;
}
