// Copyright (c) 2026 QRslice. All rights reserved.
// Server-only: Authenticated session resolution, role verification, and super-admin authorization.

import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PIN_SESSION_COOKIE, verifyPinSession } from "@/lib/pin-auth";

export type SessionUser = {
  userId: string;
  email?: string;
  role: "super_admin" | "owner" | "manager" | "staff" | "kitchen" | "waiter";
  restaurantId: string | null;
  authMethod?: "clerk" | "password" | "pin" | "dev_admin";
};

// Trusted super admin emails
const DEFAULT_SUPER_ADMIN_EMAILS = ["suraj@qrslice.com"];

export function getSuperAdminEmails(): string[] {
  const envEmails = process.env.SUPER_ADMIN_EMAILS
    ? process.env.SUPER_ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : [];
  return Array.from(new Set([...DEFAULT_SUPER_ADMIN_EMAILS, ...envEmails]));
}

/**
 * Server-only: resolves current authenticated user from Clerk or PIN session.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // 1. Try Clerk session authentication
  try {
    const clerkAuth = await auth();
    if (clerkAuth.userId) {
      let email: string | undefined;
      let role: SessionUser["role"] = "owner";
      let restaurantId: string | null = null;

      try {
        const user = await currentUser();
        if (user) {
          email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
          const publicRole = (user.publicMetadata?.role as string)?.toLowerCase();
          const privateRole = (user.privateMetadata?.role as string)?.toLowerCase();

          // Check if explicit super admin role is set in Clerk metadata or email whitelist
          const superAdminEmails = getSuperAdminEmails();
          if (
            process.env.NODE_ENV === "development" ||
            publicRole === "super_admin" ||
            privateRole === "super_admin" ||
            (email && superAdminEmails.includes(email))
          ) {
            role = "super_admin";
          } else if (publicRole) {
            role = publicRole as SessionUser["role"];
          }

          restaurantId = (user.publicMetadata?.restaurantId as string) || (process.env.NODE_ENV === "development" ? "dev-restaurant-id" : null);
        }
      } catch {
        // Clerk currentUser fetch failed, continue with clerkAuth.userId
      }

      // Check cafe_profiles table if Supabase is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const { createSupabaseAdmin } = await import("@/lib/supabase/admin");
          const adminDb = createSupabaseAdmin();
          const { data: profile } = await adminDb
            .from("cafe_profiles")
            .select("role, restaurant_id, active")
            .eq("id", clerkAuth.userId)
            .maybeSingle();

          if (profile && profile.active) {
            restaurantId = profile.restaurant_id || restaurantId;
            if (profile.role === "super_admin") {
              role = "super_admin";
            } else if (profile.role && role !== "super_admin") {
              role = profile.role as SessionUser["role"];
            }
          }
        } catch {
          // Fallback
        }
      }

      if (process.env.NODE_ENV === "development") {
        role = "super_admin";
        restaurantId = restaurantId || "dev-restaurant-id";
      }

      return {
        userId: clerkAuth.userId,
        email: email || "suraj@qrslice.com",
        role,
        restaurantId,
        authMethod: "clerk",
      };
    }
  } catch {
    // Running outside Clerk request context (e.g., unit tests)
  }

  // 2. Try PIN counter session for kitchen/waiter counter terminals
  const pinUser = await getPinSessionUser();
  if (pinUser) return pinUser;

  // 3. Local development fallback (strictly guarded)
  // In development mode, automatically authorize local developer as super_admin
  if (process.env.NODE_ENV === "development") {
    return {
      userId: "dev-superadmin-id",
      email: "suraj@qrslice.com",
      role: "super_admin",
      restaurantId: "dev-restaurant-id",
      authMethod: "dev_admin",
    };
  }

  return null;
}

/**
 * Server-only: verifies super-admin status. Returns SessionUser or null.
 */
export async function requireSuperAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "super_admin") return null;
  return user;
}

/**
 * Shared server-side authorization utility for API handlers.
 * Returns 401 for unauthenticated requests and 403 for non-admins.
 */
export async function verifySuperAdminAuth(req?: Request): Promise<{
  authorized: boolean;
  user?: SessionUser;
  status: 200 | 401 | 403;
  error?: string;
}> {
  // Check optional dev header in development mode only
  if (process.env.NODE_ENV === "development") {
    const devHeader = req?.headers?.get("x-dev-admin-key");
    if (devHeader && devHeader === process.env.DEV_ADMIN_KEY) {
      return {
        authorized: true,
        user: {
          userId: "dev-superadmin-id",
          email: "suraj@qrslice.com",
          role: "super_admin",
          restaurantId: null,
          authMethod: "dev_admin",
        },
        status: 200,
      };
    }
  }

  const user = await getSessionUser();

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "UNAUTHORIZED: Authentication session required.",
    };
  }

  if (user.role !== "super_admin") {
    return {
      authorized: false,
      status: 403,
      error: "FORBIDDEN: Elevated super-admin permissions required.",
    };
  }

  return {
    authorized: true,
    user,
    status: 200,
  };
}

/**
 * Server-only: resolves PIN quick sign-in session for counter staff.
 */
async function getPinSessionUser(): Promise<SessionUser | null> {
  let token: string | undefined;
  try {
    token = (await cookies()).get(PIN_SESSION_COOKIE)?.value;
  } catch {
    return null;
  }
  if (!token) return null;

  let payload: { sub: string; rid: string; role: string } | null = null;
  try {
    payload = await verifyPinSession(token);
  } catch {
    return null;
  }
  if (!payload) return null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createSupabaseAdmin } = await import("@/lib/supabase/admin");
      const adminDb = createSupabaseAdmin();
      const { data: profile } = await adminDb
        .from("cafe_profiles")
        .select("role, restaurant_id, active")
        .eq("id", payload.sub)
        .eq("restaurant_id", payload.rid)
        .maybeSingle();

      if (!profile || !profile.active) return null;

      const rawRole = String(profile.role || "staff").toLowerCase();
      const normalizedRole: SessionUser["role"] =
        rawRole === "kitchen" || rawRole === "chef"
          ? "kitchen"
          : rawRole === "waiter"
          ? "waiter"
          : "staff";

      return {
        userId: payload.sub,
        role: normalizedRole,
        restaurantId: profile.restaurant_id,
        authMethod: "pin",
      };
    } catch {
      // Fallback
    }
  }

  return null;
}
