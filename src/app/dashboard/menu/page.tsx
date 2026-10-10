// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import MenuEditorClient from "./MenuEditorClient";
import type { RestaurantMenu } from "@/lib/menu-service";

export const dynamic = "force-dynamic";

export default async function MenuDashboardPage() {
  const user = await getSessionUser();
  if (!user || !user.restaurantId) {
    redirect("/sign-in?returnUrl=/dashboard/menu");
  }

  const supabase = createSupabaseAdmin();

  const [{ data: restaurant }, { data: menu }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name, slug")
      .eq("id", user.restaurantId)
      .single(),
    supabase
      .from("menus")
      .select("*")
      .eq("tenant_id", user.restaurantId)
      .maybeSingle(),
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10 max-w-5xl mx-auto">
      <MenuEditorClient
        initialMenu={(menu as RestaurantMenu) || null}
        restaurantName={restaurant?.name || "Your Restaurant"}
        defaultSlug={restaurant?.slug || "menu"}
      />
    </main>
  );
}
