// Copyright (c) 2026 QRslice. All rights reserved.
// Service layer for resolving and claiming physical NFC/QR cards.

import { isValidCardId, normalizeCardId } from "./card-ids";
import { verifyClaimPin } from "./claim-tokens";

export type CardPurpose = "menu" | "reputation" | "profile" | "custom_url" | "showcase";

export interface ShowcaseData {
  title?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  googleReviewUrl?: string;
  address?: string;
  hours?: string;
}

export type PublicCardResolveResult =
  | { status: "not_found" }
  | { status: "unclaimed"; cardId: string }
  | { status: "disabled"; cardId: string }
  | {
      status: "active";
      cardId: string;
      purpose: CardPurpose;
      destinationUrl?: string | null;
      showcaseData?: ShowcaseData | null;
      tenant: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        googleReviewUrl: string | null;
      };
    };

export type ClaimResult =
  | { success: true; cardId: string; purpose: string }
  | { success: false; error: "INVALID_CARD_ID" | "NOT_FOUND" | "ALREADY_CLAIMED" | "CARD_DISABLED" | "INVALID_PIN" | "DATABASE_ERROR" };

/**
 * Resolves a card ID server-side.
 * Returns only safe, public metadata.
 * Strips all internal secrets (claim_pin_hash).
 */
export async function resolveCard(
  rawCardId: string,
  supabaseClient: any,
): Promise<PublicCardResolveResult> {
  const normalizedId = normalizeCardId(rawCardId);
  if (!normalizedId) {
    return { status: "not_found" };
  }

  const { data: card, error } = await supabaseClient
    .from("cards")
    .select(`
      card_id,
      status,
      purpose,
      tenant_id,
      destination_url,
      showcase_data,
      restaurants (
        id,
        name,
        slug,
        logo_url,
        google_review_url
      )
    `)
    .eq("card_id", normalizedId)
    .maybeSingle();

  if (error || !card) {
    return { status: "not_found" };
  }

  if (card.status === "disabled") {
    return { status: "disabled", cardId: card.card_id };
  }

  if (card.status !== "active" || !card.tenant_id || !card.restaurants) {
    return { status: "unclaimed", cardId: card.card_id };
  }

  const restaurant = Array.isArray(card.restaurants) ? card.restaurants[0] : card.restaurants;

  return {
    status: "active",
    cardId: card.card_id,
    purpose: (card.purpose as any) || "reputation",
    destinationUrl: card.destination_url || null,
    showcaseData: card.showcase_data || null,
    tenant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      logoUrl: restaurant.logo_url ?? null,
      googleReviewUrl: restaurant.google_review_url ?? null,
    },
  };
}

/**
 * Claims an unclaimed card for a restaurant tenant using the one-time scratch-off PIN.
 */
export async function claimCard(
  rawCardId: string,
  rawPin: string,
  tenantId: string,
  purpose: "menu" | "reputation" | "profile" = "reputation",
  supabaseClient: any,
): Promise<ClaimResult> {
  const normalizedId = normalizeCardId(rawCardId);
  if (!normalizedId) {
    return { success: false, error: "INVALID_CARD_ID" };
  }

  // 1. Fetch card with claim_pin_hash (server-side only)
  const { data: card, error } = await supabaseClient
    .from("cards")
    .select("card_id, claim_pin_hash, status, tenant_id")
    .eq("card_id", normalizedId)
    .maybeSingle();

  if (error || !card) {
    return { success: false, error: "NOT_FOUND" };
  }

  if (card.status === "disabled") {
    return { success: false, error: "CARD_DISABLED" };
  }

  if (card.status === "active" || card.status === "claimed" || card.tenant_id) {
    return { success: false, error: "ALREADY_CLAIMED" };
  }

  // 2. Verify scratch-off PIN
  const isValidPin = await verifyClaimPin(rawPin, card.claim_pin_hash);
  if (!isValidPin) {
    return { success: false, error: "INVALID_PIN" };
  }

  // 3. Atomically bind card to tenant
  const { error: updateError } = await supabaseClient
    .from("cards")
    .update({
      status: "active",
      tenant_id: tenantId,
      purpose,
      claimed_at: new Date().toISOString(),
    })
    .eq("card_id", normalizedId)
    .eq("status", card.status); // concurrency guard

  if (updateError) {
    return { success: false, error: "DATABASE_ERROR" };
  }

  return { success: true, cardId: normalizedId, purpose };
}
