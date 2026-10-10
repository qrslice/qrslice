// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  generateClaimPin,
  generateClaimToken,
  hashClaimSecret,
  verifyClaimPin,
  CLAIM_PIN_LENGTH,
} from "./claim-tokens";

describe("claim-tokens", () => {
  it("generates a 6-digit numeric PIN", () => {
    const pin = generateClaimPin();
    expect(pin).toMatch(/^\d{6}$/);
    expect(pin.length).toBe(CLAIM_PIN_LENGTH);
  });

  it("generates a valid UUID claim token", () => {
    const token = generateClaimToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("hashes secrets to consistent 64-character SHA-256 hex strings", async () => {
    const secret = "847291";
    const hash1 = await hashClaimSecret(secret);
    const hash2 = await hashClaimSecret(secret);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verifies a valid PIN against its stored hash successfully", async () => {
    const pin = "381902";
    const hash = await hashClaimSecret(pin);

    const isValid = await verifyClaimPin(pin, hash);
    expect(isValid).toBe(true);
  });

  it("rejects an incorrect PIN", async () => {
    const pin = "381902";
    const hash = await hashClaimSecret(pin);

    const isValid = await verifyClaimPin("381903", hash);
    expect(isValid).toBe(false);
  });

  it("rejects empty or null inputs safely", async () => {
    const hash = await hashClaimSecret("123456");
    expect(await verifyClaimPin("", hash)).toBe(false);
    expect(await verifyClaimPin("123456", "")).toBe(false);
  });
});
