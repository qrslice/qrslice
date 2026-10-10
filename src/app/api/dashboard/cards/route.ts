// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();
    const { data: cards, error } = await supabase
      .from("cards")
      .select("id, card_id, status, purpose, activation_url, created_at, claimed_at")
      .eq("tenant_id", user.restaurantId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "DATABASE_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ cards: cards || [] });
  } catch (err) {
    console.error("[GET /api/dashboard/cards] Error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
