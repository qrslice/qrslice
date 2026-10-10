// Copyright (c) 2026 QRslice. All rights reserved.
// Service layer for view-only digital menus (paise conversion, slugging, item validation).

export interface MenuItem {
  id: string;
  name: string;
  price_paise: number; // strictly integer paise
  desc: string;
  is_veg: boolean;
  category: string;
  available: boolean;
}

export interface RestaurantMenu {
  tenant_id: string;
  slug: string;
  categories: string[];
  items: MenuItem[];
  zomato_url: string | null;
  swiggy_url: string | null;
  updated_at: string;
}

/**
 * Formats money stored as integer paise into standard Indian Rupee display.
 * Example: 25000 -> "₹250", 19950 -> "₹199.50"
 */
export function formatPaiseToRupees(paise: number): string {
  if (!Number.isFinite(paise) || paise < 0) {
    return "₹0";
  }
  const rupees = paise / 100;
  if (Number.isInteger(rupees)) {
    return `₹${rupees}`;
  }
  return `₹${rupees.toFixed(2)}`;
}

/**
 * Converts a rupee input (number or user input string) into integer paise.
 * Example: 250 -> 25000, "199.50" -> 19950
 */
export function rupeesToPaise(rupees: number | string): number {
  const parsed = typeof rupees === "string" ? parseFloat(rupees.trim()) : rupees;
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed * 100);
}

/**
 * Generates an SEO and URL-safe slug from a restaurant name.
 * Example: "Blue Tokai Coffee (Saket)" -> "blue-tokai-coffee-saket"
 */
export function generateMenuSlug(rawName: string): string {
  if (!rawName || typeof rawName !== "string") {
    return "menu";
  }
  const slug = rawName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "menu";
}

/**
 * Validates outbound delivery platform links (Zomato or Swiggy).
 */
export function isValidDeliveryUrl(
  url: string | null | undefined,
  platform: "zomato" | "swiggy",
): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (platform === "zomato") {
      return host === "zomato.com" || host.endsWith(".zomato.com");
    }
    if (platform === "swiggy") {
      return host === "swiggy.com" || host.endsWith(".swiggy.com");
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Validates a menu item before saving.
 */
export function validateMenuItem(item: Partial<MenuItem>): { valid: boolean; error?: string } {
  if (!item.name || typeof item.name !== "string" || item.name.trim().length === 0) {
    return { valid: false, error: "Item name is required." };
  }
  if (typeof item.price_paise !== "number" || !Number.isInteger(item.price_paise) || item.price_paise < 0) {
    return { valid: false, error: "Price must be a non-negative integer in paise." };
  }
  if (typeof item.is_veg !== "boolean") {
    return { valid: false, error: "Veg flag must be boolean." };
  }
  return { valid: true };
}
