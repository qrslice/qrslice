// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { createBatch, listBatches } from "@/lib/card-store";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  theme: z.enum(["premium-plum", "google-review", "minimal-mono"]).optional(),
  quantity: z.number().int().min(1).max(500).optional(),
  design: z
    .object({
      businessName: z.string().max(80).optional(),
      logoUrl: z.string().max(2048).nullable().optional(),
      headline: z.string().max(140).optional(),
      backTitle: z.string().max(80).optional(),
      backLine1: z.string().max(120).optional(),
      backLine2: z.string().max(120).optional(),
      contactLine: z.string().max(120).optional(),
    })
    .optional(),
});

export async function GET(req: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const batches = await listBatches(q);
  return NextResponse.json({ batches });
}

export async function POST(req: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid batch payload" }, { status: 422 });
  }
  const batch = await createBatch({
    name: parsed.data.name,
    theme: parsed.data.theme,
    quantity: parsed.data.quantity ?? 25,
    design: { ...(parsed.data.design ?? {}), theme: parsed.data.theme ?? "premium-plum" },
    createdBy: user.userId,
  });
  return NextResponse.json({ batch }, { status: 201 });
}
