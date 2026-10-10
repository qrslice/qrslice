// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { claimCard } from "@/lib/card-service";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate owner session
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Please sign in to your restaurant account to claim cards." },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.cardId || !body.claimPin) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Card ID and Claim PIN are required." },
        { status: 400 },
      );
    }

    const { cardId, claimPin, purpose = "reputation" } = body;

    // 2. Execute claim
    const supabase = createSupabaseAdmin();
    const result = await claimCard(cardId, claimPin, user.restaurantId, purpose, supabase);

    if (!result.success) {
      if (result.error === "INVALID_PIN") {
        return NextResponse.json(
          { error: "INVALID_PIN", message: "Incorrect scratch-off PIN. Please verify the code on your packaging sleeve." },
          { status: 403 },
        );
      }
      if (result.error === "ALREADY_CLAIMED") {
        return NextResponse.json(
          { error: "ALREADY_CLAIMED", message: "This card has already been claimed by an establishment." },
          { status: 409 },
        );
      }
      if (result.error === "NOT_FOUND" || result.error === "INVALID_CARD_ID") {
        return NextResponse.json(
          { error: "INVALID_CARD", message: "Card ID was not found or is invalid." },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "SERVER_ERROR", message: "Could not activate card. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cardId: result.cardId,
      purpose: result.purpose,
      message: "Card successfully activated and linked to your restaurant!",
    });
  } catch (err) {
    console.error("[POST /api/activate] Unexpected error:", err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Internal server error." },
      { status: 500 },
    );
  }
}
