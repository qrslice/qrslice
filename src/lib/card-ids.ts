// Copyright (c) 2026 QRslice. All rights reserved.
// Card ID generator and validator using Crockford base32 (excluding ambiguous 0/O and 1/I/L).

/**
 * Unambiguous character set for Card IDs.
 * Strictly excludes:
 * - '0' and 'O'
 * - '1', 'I', and 'L'
 * - 'U' (to prevent accidental offensive word generation)
 */
export const CARD_ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
export const CARD_ID_PREFIX = "QS-";
export const CARD_ID_RANDOM_LENGTH = 7;

const CARD_ID_REGEX = new RegExp(`^${CARD_ID_PREFIX}[${CARD_ID_ALPHABET}]{${CARD_ID_RANDOM_LENGTH}}$`);

/**
 * Generates a cryptographically secure random Card ID.
 * Format: QS-XXXXXXX (e.g., QS-8F3K2MN)
 */
export function generateCardId(): string {
  const bytes = new Uint8Array(CARD_ID_RANDOM_LENGTH);
  crypto.getRandomValues(bytes);

  let id = CARD_ID_PREFIX;
  const alphabetLength = CARD_ID_ALPHABET.length;
  for (let i = 0; i < CARD_ID_RANDOM_LENGTH; i++) {
    id += CARD_ID_ALPHABET[bytes[i] % alphabetLength];
  }
  return id;
}

/**
 * Validates whether a given string is a correctly formatted Card ID.
 */
export function isValidCardId(cardId: string | null | undefined): boolean {
  if (!cardId || typeof cardId !== "string") {
    return false;
  }
  return CARD_ID_REGEX.test(cardId.trim().toUpperCase());
}

/**
 * Normalizes user-entered card IDs:
 * - Trims whitespace
 * - Converts to uppercase
 * - Automatically prepends QS- if the user only entered the 7-character suffix
 */
export function normalizeCardId(rawInput: string | null | undefined): string | null {
  if (!rawInput || typeof rawInput !== "string") {
    return null;
  }

  let cleaned = rawInput.trim().toUpperCase();

  // If user only typed the 7-character code without 'QS-' prefix
  if (cleaned.length === CARD_ID_RANDOM_LENGTH && !cleaned.startsWith(CARD_ID_PREFIX)) {
    cleaned = `${CARD_ID_PREFIX}${cleaned}`;
  }

  return isValidCardId(cleaned) ? cleaned : null;
}
