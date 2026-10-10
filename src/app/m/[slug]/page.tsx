// Copyright (c) 2026 QRslice. All rights reserved.
import React from "react";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import PublicMenuClient from "./PublicMenuClient";
import type { MenuItem } from "@/lib/menu-service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createSupabaseAdmin();

  // 1. Fetch menu by slug
  const { data: menu, error } = await supabase
    .from("menus")
    .select(`
      tenant_id,
      slug,
      categories,
      items,
      zomato_url,
      swiggy_url,
      restaurants (
        name,
        logo_url,
        tagline
      )
    `)
    .eq("slug", slug.toLowerCase().trim())
    .maybeSingle();

  if (error || !menu || !menu.restaurants) {
    notFound();
  }

  const restaurant = Array.isArray(menu.restaurants) ? menu.restaurants[0] : menu.restaurants;
  const categories = (menu.categories as string[]) || ["All"];
  const items = (menu.items as MenuItem[]) || [];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <PublicMenuClient
        restaurant={{
          name: restaurant.name,
          logoUrl: restaurant.logo_url ?? null,
          tagline: restaurant.tagline ?? null,
        }}
        categories={categories}
        items={items}
        zomatoUrl={menu.zomato_url ?? null}
        swiggyUrl={menu.swiggy_url ?? null}
      />
    </main>
  );
}
