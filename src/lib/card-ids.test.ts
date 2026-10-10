// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  generateCardId,
  isValidCardId,
  normalizeCardId,
  CARD_ID_ALPHABET,
  CARD_ID_PREFIX,
  CARD_ID_RANDOM_LENGTH,
} from "./card-ids";

describe("card-ids", () => {
  it("generates a card ID matching QS- + 7 Crockford characters", () => {
    const id = generateCardId();
    expect(id).toMatch(/^QS-[2-9ABCDEFGHJKMNPQRSTVWXYZ]{7}$/);
    expect(id.length).toBe(CARD_ID_PREFIX.length + CARD_ID_RANDOM_LENGTH);
  });

  it("never includes ambiguous characters (0, O, 1, I, L) in generated IDs", () => {
    const forbidden = ["0", "O", "1", "I", "L", "U"];
    for (let i = 0; i < 500; i++) {
      const id = generateCardId();
      for (const char of forbidden) {
        expect(id).not.toContain(char);
      }
    }
  });

  it("produces unique IDs across a 10,000 batch sample with zero collisions", () => {
    const seen = new Set<string>();
    const count = 10000;
    for (let i = 0; i < count; i++) {
      const id = generateCardId();
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
    expect(seen.size).toBe(count);
  });

  it("validates well-formed IDs correctly", () => {
    expect(isValidCardId("QS-8F3K2MN")).toBe(true);
    expect(isValidCardId("QS-2345678")).toBe(true);
    expect(isValidCardId("qs-8f3k2mn")).toBe(true); // case-insensitive check
  });

  it("rejects invalid, malformed, or ambiguous IDs", () => {
    expect(isValidCardId(null)).toBe(false);
    expect(isValidCardId("")).toBe(false);
    expect(isValidCardId("QS-8F3K2")).toBe(false); // only 5 chars
    expect(isValidCardId("QS-8F3K2MNP")).toBe(false); // 8 chars
    expect(isValidCardId("QS-8F302MN")).toBe(false); // contains '0'
    expect(isValidCardId("QS-8FO82MN")).toBe(false); // contains 'O'
    expect(isValidCardId("QS-8F182MN")).toBe(false); // contains '1'
    expect(isValidCardId("QS-8FI82MN")).toBe(false); // contains 'I'
    expect(isValidCardId("QS-8FL82MN")).toBe(false); // contains 'L'
    expect(isValidCardId("QR-8F3K2MN")).toBe(false); // wrong prefix
  });

  it("normalizes user inputs with or without prefix and handles whitespace", () => {
    expect(normalizeCardId("  QS-8f3k2mn  ")).toBe("QS-8F3K2MN");
    expect(normalizeCardId("8f3k2mn")).toBe("QS-8F3K2MN");
    expect(normalizeCardId("invalid")).toBeNull();
    expect(normalizeCardId("8F302MN")).toBeNull(); // contains forbidden 0
  });
});
