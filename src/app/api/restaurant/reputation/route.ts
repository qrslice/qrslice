// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isValidGoogleReviewUrl } from "@/lib/feedback-service";

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const googleReviewUrl = body?.googleReviewUrl;

    if (googleReviewUrl && !isValidGoogleReviewUrl(googleReviewUrl)) {
      return NextResponse.json(
        { error: "INVALID_URL", message: "Only legitimate Google review links are allowed." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("restaurants")
      .update({ google_review_url: googleReviewUrl || null })
      .eq("id", user.restaurantId);

    if (error) {
      return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ success: true, googleReviewUrl: googleReviewUrl || null });
  } catch (err) {
    console.error("[PUT /api/restaurant/reputation] Error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
