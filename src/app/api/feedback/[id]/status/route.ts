// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { updateFeedbackStatus } from "@/lib/feedback-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id: feedbackId } = await params;
    const body = await req.json().catch(() => null);

    if (!body || !body.status || !["new", "reviewed", "resolved"].includes(body.status)) {
      return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const ok = await updateFeedbackStatus(feedbackId, user.restaurantId, body.status, supabase);

    if (!ok) {
      return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: body.status });
  } catch (err) {
    console.error("[PATCH /api/feedback/[id]/status] Error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
