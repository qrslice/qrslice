// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { cardId } = await params;
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.purpose && ["menu", "reputation", "profile", "custom_url", "showcase"].includes(body.purpose)) {
      updatePayload.purpose = body.purpose;
    }

    if (body.destination_url !== undefined) {
      updatePayload.destination_url = body.destination_url;
    }

    if (body.showcase_data !== undefined) {
      updatePayload.showcase_data = body.showcase_data;
    }

    if (body.status === "disabled") {
      updatePayload.status = "disabled";
    }

    const supabase = createSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from("cards")
      .update(updatePayload)
      .eq("card_id", cardId)
      .eq("tenant_id", user.restaurantId)
      .select("id, card_id, status, purpose")
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 404 });
    }

    return NextResponse.json({ success: true, card: updated });
  } catch (err) {
    console.error("[PATCH /api/dashboard/cards/[cardId]] Error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
