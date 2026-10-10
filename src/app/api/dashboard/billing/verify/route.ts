import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { verifyRazorpayPaymentSignature, activateTenantSubscription } from "@/lib/razorpay";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const VerifySchema = z.object({
  planKey: z.enum(["PRO_MONTHLY", "PRO_ANNUAL"]),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment verification payload" }, { status: 400 });
    }

    const { planKey, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // 1. Verify cryptographic HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    let isSignatureValid = false;

    if (secret) {
      isSignatureValid = await verifyRazorpayPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        secret,
      });
    } else if (process.env.NODE_ENV !== "production" && razorpaySignature.startsWith("test_sig_")) {
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Payment verification failed. Invalid cryptographic signature." },
        { status: 400 }
      );
    }

    // 2. Activate subscription idempotently in database
    const supabase = createSupabaseAdmin();
    const result = await activateTenantSubscription(
      {
        tenantId: user.restaurantId,
        planId: planKey,
        paymentId: razorpayPaymentId,
      },
      supabase
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Activation failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      plan: planKey,
    });
  } catch (err: any) {
    console.error("[POST /api/dashboard/billing/verify] Error:", err);
    return NextResponse.json({ error: "Failed to verify subscription" }, { status: 500 });
  }
}
