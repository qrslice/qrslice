// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getTenantFeedback, getFeedbackStats } from "@/lib/feedback-service";
import { evaluateTenantEntitlements } from "@/lib/subscription";
import FeedbackInboxClient from "./FeedbackInboxClient";

export const dynamic = "force-dynamic";

export default async function FeedbackInboxPage() {
  const user = await getSessionUser();
  if (!user || !user.restaurantId) {
    redirect("/sign-in?returnUrl=/dashboard/inbox");
  }

  const supabase = createSupabaseAdmin();

  // Fetch restaurant details and subscription state
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, plan, tier, billing_status, trial_ends_at, subscription_ends_at")
    .eq("id", user.restaurantId)
    .single();

  const entitlements = evaluateTenantEntitlements(restaurant);

  // If expired and past grace period, redirect to billing upgrade page
  if (!entitlements.canAccessInbox && process.env.NODE_ENV === "production") {
    redirect("/dashboard/billing?upgrade=inbox");
  }

  const [feedbackItems, stats] = await Promise.all([
    getTenantFeedback(user.restaurantId, undefined, supabase),
    getFeedbackStats(user.restaurantId, supabase),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10 max-w-5xl mx-auto">
      <FeedbackInboxClient
        initialFeedback={feedbackItems}
        initialStats={stats}
        tenantName={restaurant?.name || "Your Restaurant"}
      />
    </main>
  );
}
