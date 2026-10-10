import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { SUBSCRIPTION_PLANS, PlanId } from "@/lib/subscription";
import { createRazorpayOrder } from "@/lib/razorpay";

const CheckoutSchema = z.object({
  planKey: z.enum(["PRO_MONTHLY", "PRO_ANNUAL"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const { planKey } = parsed.data;
    const plan = SUBSCRIPTION_PLANS[planKey];
    if (!plan || plan.pricePaise <= 0) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    const receipt = `SUB-${user.restaurantId.substring(0, 8)}-${Date.now()}`;

    // Create server-authoritative Razorpay order
    const rzpOrder = await createRazorpayOrder({
      amountPaise: plan.pricePaise,
      currency: "INR",
      receipt,
      notes: {
        tenant_id: user.restaurantId,
        plan_id: planKey,
      },
    });

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";

    return NextResponse.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amountPaise: plan.pricePaise,
      currency: "INR",
      keyId,
      planName: plan.name,
    });
  } catch (err: any) {
    console.error("[POST /api/dashboard/billing/checkout] Error:", err);
    return NextResponse.json({ error: "Failed to initialize subscription checkout" }, { status: 500 });
  }
}
