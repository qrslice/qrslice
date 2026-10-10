// Copyright (c) 2026 QRslice. All rights reserved.
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. SERVER-ONLY. Never import in client code.
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Supabase admin client requires service-role key.");
  }

  return createClient(
    url,
    key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

