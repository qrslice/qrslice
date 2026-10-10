// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import {
  CARD_THEME_IDS,
  buildActivationUrl,
  defaultCardDesign,
  generateCardSvg,
  isCardThemeId,
} from "@/lib/card-artwork";

export const dynamic = "force-dynamic";

const schema = z.object({
  theme: z.enum(CARD_THEME_IDS),
  card_id: z.string().max(20).optional(),
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

// Live preview calls the SAME generator as export (byte-identical output).
export async function POST(req: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preview payload" }, { status: 422 });
  }
  const theme = parsed.data.theme;
  if (!isCardThemeId(theme)) {
    return NextResponse.json({ error: "Unknown theme" }, { status: 422 });
  }
  const design = {
    ...defaultCardDesign(theme),
    ...(parsed.data.design ?? {}),
    theme,
  };
  const card_id = parsed.data.card_id?.trim() || "QS-SAMPLE";
  const art = await generateCardSvg(theme, design, {
    card_id,
    activation_url: buildActivationUrl(card_id),
  });
  return NextResponse.json({ ...art, card_id });
}
