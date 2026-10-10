// Copyright (c) 2026 QRslice. All rights reserved.
// Claim PIN / token generator and secure hashing utilities.

/**
 * Characters used for scratch-off claim PINs (easy to read, unambiguous numbers).
 */
export const CLAIM_PIN_ALPHABET = "0123456789";
export const CLAIM_PIN_LENGTH = 6;

/**
 * Generates a human-typeable 6-digit one-time claim PIN for the packaging scratch-off.
 * Example: "847291"
 */
export function generateClaimPin(): string {
  const bytes = new Uint8Array(CLAIM_PIN_LENGTH);
  crypto.getRandomValues(bytes);

  let pin = "";
  for (let i = 0; i < CLAIM_PIN_LENGTH; i++) {
    pin += CLAIM_PIN_ALPHABET[bytes[i] % 10];
  }
  return pin;
}

/**
 * Generates a full cryptographically secure UUID token (for batch manifests and API tokens).
 */
export function generateClaimToken(): string {
  return crypto.randomUUID();
}

/**
 * Hashes a claim PIN or token using SHA-256 via Web Crypto.
 * Returns a lowercase hex string.
 */
export async function hashClaimSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Constant-time string comparison to prevent timing attacks during verification.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verifies a user-entered claim PIN against the stored SHA-256 hash.
 */
export async function verifyClaimPin(rawPin: string, storedHash: string): Promise<boolean> {
  if (!rawPin || !storedHash) {
    return false;
  }
  const computedHash = await hashClaimSecret(rawPin);
  return timingSafeEqual(computedHash.toLowerCase(), storedHash.toLowerCase());
}
