// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import {
  verifyRazorpayWebhookSignature,
  validatePaymentForActivation,
  activateTenantSubscription,
} from "@/lib/razorpay";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "MISSING_SIGNATURE_OR_SECRET" }, { status: 400 });
    }

    const rawBody = await req.text();

    // 1. Verify HMAC SHA-256 signature
    const isValidSignature = await verifyRazorpayWebhookSignature(rawBody, signature, secret);
    if (!isValidSignature) {
      console.warn("[POST /api/billing/webhook] Invalid webhook signature detected.");
      return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 403 });
    }

    const eventData = JSON.parse(rawBody);
    const event = eventData.event;

    // Handle captured payments and subscription renewals
    if (event === "payment.captured" || event === "order.paid" || event === "subscription.charged") {
      const payment = eventData.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ error: "MISSING_PAYMENT_ENTITY" }, { status: 400 });
      }

      // 2. Validate payment status, currency, and exact amount in paise (lesson 0.4)
      const validation = validatePaymentForActivation(payment);
      if (!validation.valid || !validation.tenantId || !validation.planId) {
        console.error("[POST /api/billing/webhook] Payment validation failed:", validation.error);
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // 3. Atomically activate or extend tenant subscription
      const supabase = createSupabaseAdmin();
      const activation = await activateTenantSubscription(
        {
          tenantId: validation.tenantId,
          planId: validation.planId as "PRO_MONTHLY" | "PRO_ANNUAL",
          paymentId: payment.id,
        },
        supabase,
      );

      if (!activation.success) {
        return NextResponse.json({ error: activation.error }, { status: 500 });
      }
    } else if (event === "payment.failed") {
      const payment = eventData.payload?.payment?.entity;
      const tenantId = payment?.notes?.tenant_id;
      if (tenantId) {
        const supabase = createSupabaseAdmin();
        await supabase
          .from("restaurants")
          .update({
            billing_status: "overdue",
            updated_at: new Date().toISOString(),
          })
          .eq("id", tenantId);
      }
    } else if (event === "subscription.cancelled" || event === "subscription.halted") {
      const subEntity = eventData.payload?.subscription?.entity;
      const tenantId = subEntity?.notes?.tenant_id;
      if (tenantId) {
        const supabase = createSupabaseAdmin();
        await supabase
          .from("restaurants")
          .update({
            billing_status: "cancelled",
            plan: "free",
            tier: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("id", tenantId);
      }
    }

    // Always return 200 OK idempotently to Razorpay
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[POST /api/billing/webhook] Error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
