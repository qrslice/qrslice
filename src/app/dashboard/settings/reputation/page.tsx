// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import ReputationSettingsClient from "./ReputationSettingsClient";

export const dynamic = "force-dynamic";

export default async function ReputationSettingsPage() {
  const user = await getSessionUser();
  if (!user || !user.restaurantId) {
    redirect("/sign-in?returnUrl=/dashboard/settings/reputation");
  }

  const supabase = createSupabaseAdmin();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, google_review_url")
    .eq("id", user.restaurantId)
    .single();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10 max-w-3xl mx-auto">
      <ReputationSettingsClient
        restaurantId={user.restaurantId}
        initialGoogleReviewUrl={restaurant?.google_review_url || ""}
        restaurantName={restaurant?.name || "Your Restaurant"}
      />
    </main>
  );
}
