// Copyright (c) 2026 QRslice. All rights reserved.
// Razorpay client, webhook signature verification, and payment validation.
// Strict lesson 0.4: signature alone is not enough; require captured status + amount/currency match.

import { SUBSCRIPTION_PLANS, type PlanId } from "./subscription";

/**
 * Constant-time string equality check to prevent timing attacks.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
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
 * Verifies Razorpay webhook HMAC SHA-256 signature using standard Web Crypto.
 */
export async function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!rawBody || !signature || !secret) {
    return false;
  }
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const expectedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return timingSafeStringEqual(expectedHex.toLowerCase(), signature.trim().toLowerCase());
  } catch {
    return false;
  }
}

export interface RazorpayPaymentPayload {
  id: string;
  order_id: string;
  status: "captured" | "authorized" | "failed" | "refunded";
  amount: number; // in paise
  currency: string;
  notes?: {
    tenant_id?: string;
    plan_id?: string;
  };
}

export interface ProcessPaymentResult {
  valid: boolean;
  error?: string;
  tenantId?: string;
  planId?: string;
  amountPaise?: number;
}

/**
 * Validates a Razorpay payment object against business guardrails before activating a subscription:
 * 1. Must be in 'captured' status.
 * 2. Currency must be 'INR'.
 * 3. Amount must exactly match expected plan price in paise.
 */
export function validatePaymentForActivation(
  payment: RazorpayPaymentPayload,
): ProcessPaymentResult {
  if (!payment || !payment.id) {
    return { valid: false, error: "MISSING_PAYMENT_ID" };
  }

  // 1. Verify status is captured (lesson 0.4)
  if (payment.status !== "captured") {
    return { valid: false, error: `PAYMENT_NOT_CAPTURED (Status: ${payment.status})` };
  }

  // 2. Verify currency is INR
  if (payment.currency !== "INR") {
    return { valid: false, error: `INVALID_CURRENCY: ${payment.currency}` };
  }

  const tenantId = payment.notes?.tenant_id;
  const planId = payment.notes?.plan_id as PlanId | undefined;

  if (!tenantId) {
    return { valid: false, error: "MISSING_TENANT_ID" };
  }

  if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
    return { valid: false, error: `INVALID_PLAN_ID: ${planId}` };
  }

  // 3. Verify exact expected amount in paise
  const expectedPaise = SUBSCRIPTION_PLANS[planId].pricePaise;
  if (payment.amount !== expectedPaise) {
    return {
      valid: false,
      error: `AMOUNT_MISMATCH: expected ${expectedPaise} paise, received ${payment.amount} paise`,
    };
  }

  return {
    valid: true,
    tenantId,
    planId,
    amountPaise: payment.amount,
  };
}

/**
 * Activates a tenant subscription in the database idempotently.
 */
export async function activateTenantSubscription(
  params: {
    tenantId: string;
    planId: "PRO_MONTHLY" | "PRO_ANNUAL";
    paymentId: string;
  },
  supabaseClient: any,
): Promise<{ success: boolean; alreadyProcessed?: boolean; error?: string }> {
  const { tenantId, planId } = params;

  // 1. Idempotency check against transaction ledger
  if (params.paymentId) {
    try {
      const { data: existingTxn } = await supabaseClient
        .from("super_finance_transactions")
        .select("id")
        .eq("id", `sub_${params.paymentId}`)
        .maybeSingle();

      if (existingTxn) {
        return { success: true, alreadyProcessed: true };
      }
    } catch {
      // Continue if table not initialized
    }
  }

  // 2. Fetch tenant
  const { data: tenant } = await supabaseClient
    .from("restaurants")
    .select("id, plan, billing_status, subscription_ends_at")
    .eq("id", tenantId)
    .single();

  if (!tenant) {
    return { success: false, error: "TENANT_NOT_FOUND" };
  }

  // Calculate new subscription end date: 30 days for monthly, 365 days for annual
  const durationDays = planId === "PRO_ANNUAL" ? 365 : 30;
  const newEnd = new Date();
  newEnd.setDate(newEnd.getDate() + durationDays);

  const { error } = await supabaseClient
    .from("restaurants")
    .update({
      plan: "active",
      tier: "pro",
      billing_status: "paid",
      subscription_ends_at: newEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenantId);

  if (error) {
    return { success: false, error: "DATABASE_ERROR" };
  }

  // Record transaction ledger idempotently
  if (params.paymentId) {
    try {
      const expectedPaise = SUBSCRIPTION_PLANS[planId].pricePaise;
      const { recordFinanceTransaction } = await import('@/lib/admin-finance-store');
      await recordFinanceTransaction({
        id: `sub_${params.paymentId}`,
        type: "subscription_renewal",
        referenceId: tenantId,
        razorpayPaymentId: params.paymentId,
        grossAmountPaise: expectedPaise,
        gstPaise: 0,
        gatewayFeePaise: Math.round(expectedPaise * 0.02),
        netSettledPaise: Math.round(expectedPaise * 0.98),
        paymentMethod: "upi",
        status: "captured",
        customerName: tenant.name || "Restaurant Owner",
        customerEmail: tenant.email || "",
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Ignore if optional table
    }
  }

  return { success: true };
}

/**
 * Create a server-side Razorpay order.
 * Requires genuine RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
 * Throws a clear error if unconfigured. Never generates mock orders in production.
 */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const currency = params.currency || "INR";

  if (!keyId || !keySecret) {
    throw new Error(
      "Payments not configured: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required."
    );
  }

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency,
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay API error: ${response.status} ${errorText}`);
  }

  const orderData = (await response.json()) as { id: string; amount: number; currency: string };
  return orderData;
}

/**
 * Verify Razorpay standard checkout payment signature:
 * HMAC-SHA256(order_id + "|" + payment_id, secret) == signature
 */
export async function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  const payload = `${params.orderId}|${params.paymentId}`;
  return verifyRazorpayWebhookSignature(payload, params.signature, params.secret);
}

