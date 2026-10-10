// Copyright (c) 2026 QRslice. All rights reserved.
// Service layer for private guest feedback, review routing, and low-rating alerts.

export interface FeedbackItem {
  id: string;
  tenant_id: string;
  card_id: string | null;
  rating: number;
  comment: string | null;
  status: "new" | "reviewed" | "resolved";
  created_at: string;
}

export interface FeedbackStats {
  totalCount: number;
  averageRating: number;
  lowRatingCount: number; // ratings <= 3 requiring immediate attention
  newCount: number;
}

/**
 * Validates Google review URLs.
 * Strictly accepts legitimate Google domain links.
 */
export function isValidGoogleReviewUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return (
      host === "g.page" ||
      host === "maps.app.goo.gl" ||
      host === "search.google.com" ||
      host === "google.com" ||
      host.endsWith(".google.com")
    );
  } catch {
    return false;
  }
}

/**
 * Sanitizes guest feedback comment text:
 * - Trims whitespace
 * - Enforces max 500 characters
 * - Strips hazardous tags and escapes HTML entities
 */
export function sanitizeFeedbackComment(rawComment: string | null | undefined): string | null {
  if (!rawComment || typeof rawComment !== "string") {
    return null;
  }
  const trimmed = rawComment.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const truncated = trimmed.slice(0, 500);
  return truncated
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Submits guest feedback into the private feedback table.
 */
export async function submitGuestFeedback(
  params: {
    tenantId: string;
    cardId?: string | null;
    rating: number;
    comment?: string | null;
  },
  supabaseClient: any,
): Promise<{ success: boolean; error?: string; isLowRating?: boolean }> {
  const { tenantId, cardId, rating, comment } = params;

  if (!tenantId) {
    return { success: false, error: "INVALID_TENANT" };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "INVALID_RATING" };
  }

  const sanitizedComment = sanitizeFeedbackComment(comment);
  const isLowRating = rating <= 3;

  const { error } = await supabaseClient.from("feedback").insert({
    tenant_id: tenantId,
    card_id: cardId || null,
    rating,
    comment: sanitizedComment,
    status: "new",
  });

  if (error) {
    return { success: false, error: "DATABASE_ERROR" };
  }

  return { success: true, isLowRating };
}

/**
 * Fetches feedback items for a specific tenant with optional filtering.
 */
export async function getTenantFeedback(
  tenantId: string,
  filter: { rating?: number; lowOnly?: boolean; status?: string } | undefined,
  supabaseClient: any,
): Promise<FeedbackItem[]> {
  let query = supabaseClient
    .from("feedback")
    .select("id, tenant_id, card_id, rating, comment, status, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filter?.lowOnly) {
    query = query.lte("rating", 3);
  } else if (filter?.rating) {
    query = query.eq("rating", filter.rating);
  }

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }
  return data as FeedbackItem[];
}

/**
 * Marks feedback status as reviewed or resolved.
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  tenantId: string,
  status: "new" | "reviewed" | "resolved",
  supabaseClient: any,
): Promise<boolean> {
  const { error } = await supabaseClient
    .from("feedback")
    .update({ status })
    .eq("id", feedbackId)
    .eq("tenant_id", tenantId);

  return !error;
}

/**
 * Aggregates feedback metrics for the owner dashboard.
 */
export async function getFeedbackStats(
  tenantId: string,
  supabaseClient: any,
): Promise<FeedbackStats> {
  const { data, error } = await supabaseClient
    .from("feedback")
    .select("rating, status")
    .eq("tenant_id", tenantId);

  if (error || !data || data.length === 0) {
    return { totalCount: 0, averageRating: 0, lowRatingCount: 0, newCount: 0 };
  }

  const totalCount = data.length;
  let sumRating = 0;
  let lowRatingCount = 0;
  let newCount = 0;

  for (const item of data) {
    sumRating += item.rating;
    if (item.rating <= 3) {
      lowRatingCount++;
    }
    if (item.status === "new") {
      newCount++;
    }
  }

  const averageRating = Math.round((sumRating / totalCount) * 10) / 10;
  return { totalCount, averageRating, lowRatingCount, newCount };
}
