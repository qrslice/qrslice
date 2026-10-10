// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { getBatch, updateBatch } from "@/lib/card-store";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  theme: z.enum(["premium-plum", "google-review", "minimal-mono"]).optional(),
  quantity: z.number().int().min(1).max(500).optional(),
  status: z.enum(["draft", "exported", "manufactured"]).optional(),
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { batchId } = await params;
  const batch = await getBatch(batchId);
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  return NextResponse.json({ batch });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { batchId } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid batch payload" }, { status: 422 });
  }
  try {
    const batch = await updateBatch(batchId, parsed.data);
    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    return NextResponse.json({ batch });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 422 },
    );
  }
}
