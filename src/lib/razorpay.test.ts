// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  verifyRazorpayWebhookSignature,
  validatePaymentForActivation,
} from "./razorpay";

describe("razorpay", () => {
  const testSecret = "test_webhook_secret_12345";

  describe("verifyRazorpayWebhookSignature", () => {
    it("verifies authentic Razorpay webhook signatures", async () => {
      const payload = JSON.stringify({ event: "payment.captured", id: "pay_123" });
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(testSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
      const validSignature = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      expect(await verifyRazorpayWebhookSignature(payload, validSignature, testSecret)).toBe(true);
    });

    it("rejects forged or tampered signatures", async () => {
      const payload = JSON.stringify({ event: "payment.captured", id: "pay_123" });
      const fakeSignature = "invalid_signature_hex";

      expect(await verifyRazorpayWebhookSignature(payload, fakeSignature, testSecret)).toBe(false);
      expect(await verifyRazorpayWebhookSignature(payload, "", testSecret)).toBe(false);
    });
  });

  describe("validatePaymentForActivation (Lesson 0.4 Guardrails)", () => {
    it("accepts captured payments matching exact expected amount and INR currency", () => {
      const validMonthlyPayment = {
        id: "pay_xyz",
        order_id: "order_xyz",
        status: "captured" as const,
        amount: 29900, // exact ₹299 in paise
        currency: "INR",
        notes: {
          tenant_id: "tenant-123",
          plan_id: "PRO_MONTHLY",
        },
      };

      const res = validatePaymentForActivation(validMonthlyPayment);
      expect(res.valid).toBe(true);
      expect(res.tenantId).toBe("tenant-123");
      expect(res.amountPaise).toBe(29900);
    });

    it("accepts captured annual payment of ₹2,999 in paise", () => {
      const validAnnualPayment = {
        id: "pay_annual",
        order_id: "order_annual",
        status: "captured" as const,
        amount: 299900, // exact ₹2,999 in paise
        currency: "INR",
        notes: {
          tenant_id: "tenant-123",
          plan_id: "PRO_ANNUAL",
        },
      };

      const res = validatePaymentForActivation(validAnnualPayment);
      expect(res.valid).toBe(true);
      expect(res.amountPaise).toBe(299900);
    });

    it("rejects payments that are not in captured status", () => {
      const authorizedPayment = {
        id: "pay_auth",
        order_id: "order_auth",
        status: "authorized" as const,
        amount: 29900,
        currency: "INR",
        notes: { tenant_id: "tenant-123", plan_id: "PRO_MONTHLY" },
      };

      const res = validatePaymentForActivation(authorizedPayment);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("PAYMENT_NOT_CAPTURED");
    });

    it("rejects payments with currency other than INR", () => {
      const usdPayment = {
        id: "pay_usd",
        order_id: "order_usd",
        status: "captured" as const,
        amount: 29900,
        currency: "USD",
        notes: { tenant_id: "tenant-123", plan_id: "PRO_MONTHLY" },
      };

      const res = validatePaymentForActivation(usdPayment);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("INVALID_CURRENCY");
    });

    it("rejects payments where amount does not match expected plan paise (price tampering guard)", () => {
      const tamperedPayment = {
        id: "pay_tampered",
        order_id: "order_tampered",
        status: "captured" as const,
        amount: 100, // attempted to pay 1 rupee
        currency: "INR",
        notes: { tenant_id: "tenant-123", plan_id: "PRO_MONTHLY" },
      };

      const res = validatePaymentForActivation(tamperedPayment);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("AMOUNT_MISMATCH");
    });
  });
});
