// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_BYTES = 2 * 1024 * 1024;

// Super-only logo upload → public `images` bucket (same qr/ pattern as SettingsTab).
export async function POST(req: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 422 });
  }
  const file = form.get("logo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing logo file" }, { status: 422 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Logo must be PNG, JPEG, WEBP, or SVG" },
      { status: 422 },
    );
  }
  if (file.size > MAX_BYTES || file.size === 0) {
    return NextResponse.json({ error: "Logo must be 1 byte – 2 MB" }, { status: 422 });
  }
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const fileName = `card-logo_${user.userId}_${Date.now()}.${ext || "png"}`;
  const path = `qr/${fileName}`;
  const db = createSupabaseAdmin();
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage
    .from("images")
    .upload(path, bytes, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
  if (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
  const {
    data: { publicUrl },
  } = db.storage.from("images").getPublicUrl(path);
  return NextResponse.json({ url: publicUrl, path });
}
