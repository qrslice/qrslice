// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { generateBatchCards } from "@/lib/card-store";

export const dynamic = "force-dynamic";

const schema = z.object({ count: z.number().int().min(1).max(500) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { batchId } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "count must be 1–500" }, { status: 422 });
  }
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://qrslice.com";
    const { batch, reveals } = await generateBatchCards(batchId, parsed.data.count, baseUrl);
    // Raw claim tokens are returned ONCE here and never stored.
    return NextResponse.json({ batch, reveals });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generate failed" },
      { status: 422 },
    );
  }
}
