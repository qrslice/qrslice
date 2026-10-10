// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { submitGuestFeedback } from "@/lib/feedback-service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.tenantId || typeof body.rating !== "number") {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "tenantId and numeric rating (1-5) are required." },
        { status: 400 },
      );
    }

    const { tenantId, cardId, rating, comment } = body;

    const supabase = createSupabaseAdmin();
    const result = await submitGuestFeedback({ tenantId, cardId, rating, comment }, supabase);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "SUBMISSION_FAILED", message: "Failed to submit feedback." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      isLowRating: result.isLowRating,
      message: "Thank you for sharing your thoughts!",
    });
  } catch (err) {
    console.error("[POST /api/feedback/submit] Error:", err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Internal server error." },
      { status: 500 },
    );
  }
}
