// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSubscriptionStatus } from "@/lib/subscription";
import BillingClient from "./BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getSessionUser();
  if (!user || !user.restaurantId) {
    redirect("/sign-in?returnUrl=/dashboard/billing");
  }

  const supabase = createSupabaseAdmin();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, plan, trial_ends_at, subscription_ends_at")
    .eq("id", user.restaurantId)
    .single();

  const subscriptionStatus = getSubscriptionStatus(restaurant);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10 max-w-5xl mx-auto">
      <BillingClient
        restaurant={{
          id: user.restaurantId,
          name: restaurant?.name || "Your Restaurant",
          plan: restaurant?.plan || "trial",
          trialEndsAt: restaurant?.trial_ends_at || null,
          subscriptionEndsAt: restaurant?.subscription_ends_at || null,
        }}
        subscriptionStatus={subscriptionStatus}
      />
    </main>
  );
}
