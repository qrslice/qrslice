// Copyright (c) 2026 QRslice. All rights reserved.
import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { exportBatch, getBatch } from "@/lib/card-store";
import { buildZip } from "@/lib/card-zip";
import {
  generateGangSheetSvg,
  paginateCardsForSheets,
} from "@/lib/card-imposition";
import { PRINT_SPEC_TEXT } from "@/lib/card-constants";

export const dynamic = "force-dynamic";

// POST /api/super/cards/batches/[batchId]/export?format=zip|json&sheet=a4_front|a4_back|sra3_front|sra3_back&page=1
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { batchId } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "zip";
  const sheetParam = url.searchParams.get("sheet");
  const pageParam = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));

  try {
    const existing = await getBatch(batchId);
    if (!existing) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    if (existing.cards.length === 0) {
      return NextResponse.json({ error: "Generate cards before export" }, { status: 422 });
    }

    // Direct single sheet export mode (for live preview or direct vector download)
    if (sheetParam) {
      const isA4 = sheetParam.startsWith("a4");
      const sheetType = isA4 ? "a4-8up" : "sra3-21up";
      const side = sheetParam.endsWith("back") ? "back" : "front";

      const cardPages = paginateCardsForSheets(
        existing.cards.map((c) => ({ card_id: c.card_id, activation_url: c.activation_url })),
        sheetType,
        existing.theme
      );

      const targetPageCards = cardPages[pageParam - 1] || cardPages[0];
      const sheetSvg = await generateGangSheetSvg({
        sheetType,
        side,
        batchId: existing.id,
        batchName: existing.name,
        theme: existing.theme,
        cards: targetPageCards,
        design: existing.design_json,
        sheetIndex: pageParam,
        totalSheets: cardPages.length,
      });

      return new NextResponse(sheetSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `inline; filename="${existing.name.replace(/[^a-z0-9-_]+/gi, "-")}-${sheetParam}-p${pageParam}.svg"`,
        },
      });
    }

    const { batch, files, manifestCsv } = await exportBatch(batchId);

    if (format === "json") {
      return NextResponse.json({
        batch,
        files,
        manifestCsv,
        note: "SVG strings frozen at export. Raw claim tokens are never re-issued.",
      });
    }

    // Generate A4 Imposition Sheets (8-Up landscape / 9-Up portrait)
    const cardUnits = existing.cards.map((c) => ({
      card_id: c.card_id,
      activation_url: c.activation_url,
    }));
    const a4Pages = paginateCardsForSheets(cardUnits, "a4-8up", batch.theme);
    const sra3Pages = paginateCardsForSheets(cardUnits, "sra3-21up", batch.theme);

    const sheetEntries: Array<{ name: string; content: string }> = [];

    // A4 sheets
    for (let i = 0; i < a4Pages.length; i++) {
      const pageCards = a4Pages[i];
      const front = await generateGangSheetSvg({
        sheetType: "a4-8up",
        side: "front",
        batchId: batch.id,
        batchName: batch.name,
        theme: batch.theme,
        cards: pageCards,
        design: batch.design_json,
        sheetIndex: i + 1,
        totalSheets: a4Pages.length,
      });
      const back = await generateGangSheetSvg({
        sheetType: "a4-8up",
        side: "back",
        batchId: batch.id,
        batchName: batch.name,
        theme: batch.theme,
        cards: pageCards,
        design: batch.design_json,
        sheetIndex: i + 1,
        totalSheets: a4Pages.length,
      });
      sheetEntries.push({ name: `sheets/a4/sheet_${i + 1}_front.svg`, content: front });
      sheetEntries.push({ name: `sheets/a4/sheet_${i + 1}_back.svg`, content: back });
    }

    // SRA3 sheets
    for (let i = 0; i < sra3Pages.length; i++) {
      const pageCards = sra3Pages[i];
      const front = await generateGangSheetSvg({
        sheetType: "sra3-21up",
        side: "front",
        batchId: batch.id,
        batchName: batch.name,
        theme: batch.theme,
        cards: pageCards,
        design: batch.design_json,
        sheetIndex: i + 1,
        totalSheets: sra3Pages.length,
      });
      const back = await generateGangSheetSvg({
        sheetType: "sra3-21up",
        side: "back",
        batchId: batch.id,
        batchName: batch.name,
        theme: batch.theme,
        cards: pageCards,
        design: batch.design_json,
        sheetIndex: i + 1,
        totalSheets: sra3Pages.length,
      });
      sheetEntries.push({ name: `sheets/sra3/sheet_${i + 1}_front.svg`, content: front });
      sheetEntries.push({ name: `sheets/sra3/sheet_${i + 1}_back.svg`, content: back });
    }

    // Build Master Production Zip
    const zip = buildZip([
      ...sheetEntries,
      ...files.map((f) => ({ name: `individual_cards/${f.name}`, content: f.svg })),
      { name: "batch-manifest.csv", content: manifestCsv },
      { name: "SPEC-SHEET.txt", content: PRINT_SPEC_TEXT },
    ]);

    return new NextResponse(Buffer.from(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="qrslice-cards-${batch.name.replace(/[^a-z0-9-_]+/gi, "-")}.zip"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 422 },
    );
  }
}
