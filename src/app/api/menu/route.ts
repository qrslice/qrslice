// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  generateMenuSlug,
  validateMenuItem,
  isValidDeliveryUrl,
  type MenuItem,
} from "@/lib/menu-service";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();
    const { data: menu } = await supabase
      .from("menus")
      .select("*")
      .eq("tenant_id", user.restaurantId)
      .maybeSingle();

    return NextResponse.json({ menu: menu || null });
  } catch (err) {
    console.error("[GET /api/menu] Error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.restaurantId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const { items, categories, zomatoUrl, swiggyUrl, customSlug } = body;

    // Validate delivery URLs if provided
    if (zomatoUrl && !isValidDeliveryUrl(zomatoUrl, "zomato")) {
      return NextResponse.json(
        { error: "INVALID_ZOMATO_URL", message: "Invalid Zomato link format." },
        { status: 400 },
      );
    }
    if (swiggyUrl && !isValidDeliveryUrl(swiggyUrl, "swiggy")) {
      return NextResponse.json(
        { error: "INVALID_SWIGGY_URL", message: "Invalid Swiggy link format." },
        { status: 400 },
      );
    }

    // Validate each menu item
    if (Array.isArray(items)) {
      for (const itm of items) {
        const val = validateMenuItem(itm);
        if (!val.valid) {
          return NextResponse.json(
            { error: "INVALID_ITEM", message: `Item "${itm?.name || ""}": ${val.error}` },
            { status: 400 },
          );
        }
      }
    }

    const supabase = createSupabaseAdmin();

    // Fetch restaurant name for slug fallback
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("name, slug")
      .eq("id", user.restaurantId)
      .single();

    const slug = customSlug
      ? generateMenuSlug(customSlug)
      : restaurant?.slug || generateMenuSlug(restaurant?.name || "menu");

    const payload = {
      tenant_id: user.restaurantId,
      slug,
      categories: Array.isArray(categories) && categories.length > 0 ? categories : ["All", "Mains", "Beverages"],
      items: Array.isArray(items) ? items : [],
      zomato_url: zomatoUrl || null,
      swiggy_url: swiggyUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("menus").upsert(payload, { onConflict: "tenant_id" });

    if (error) {
      console.error("[PUT /api/menu] Upsert error:", error);
      return NextResponse.json({ error: "DATABASE_ERROR", message: "Failed to save menu." }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error("[PUT /api/menu] Error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
