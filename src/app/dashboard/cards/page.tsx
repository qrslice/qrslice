// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import OwnerCardsClient, { type OwnerCardItem } from "./OwnerCardsClient";

export const dynamic = "force-dynamic";

export default async function OwnerCardsPage() {
  let user = await getSessionUser();
  if (!user && process.env.NODE_ENV !== "production") {
    user = {
      userId: "dev-owner-preview",
      role: "owner",
      restaurantId: "dev-res-preview",
    };
  } else if (!user || !user.restaurantId) {
    redirect("/sign-in?returnUrl=/dashboard/cards");
  }

  const supabase = createSupabaseAdmin();

  const [{ data: restaurant }, { data: cards }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name")
      .eq("id", user.restaurantId)
      .single(),
    supabase
      .from("cards")
      .select("id, card_id, status, purpose, activation_url, created_at, claimed_at")
      .eq("tenant_id", user.restaurantId)
      .order("created_at", { ascending: false }),
  ]);

  let initialCards = (cards as OwnerCardItem[]) || [];

  if (initialCards.length === 0 && process.env.NODE_ENV !== "production") {
    initialCards = [
      {
        id: "card-demo-1",
        card_id: "QS-2W4K8Z9",
        status: "active",
        purpose: "reputation",
        activation_url: "http://localhost:3000/a/QS-2W4K8Z9",
        created_at: new Date().toISOString(),
        claimed_at: new Date().toISOString(),
      },
      {
        id: "card-demo-2",
        card_id: "QS-7X3M9P4",
        status: "active",
        purpose: "custom_url",
        destination_url: "https://instagram.com/urbanelegance",
        activation_url: "http://localhost:3000/a/QS-7X3M9P4",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        claimed_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10 max-w-5xl mx-auto">
      <OwnerCardsClient
        initialCards={initialCards}
        restaurantName={restaurant?.name || "Urban Elegance"}
      />
    </main>
  );
}
