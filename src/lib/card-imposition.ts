// Copyright (c) 2026 QRslice. All rights reserved.
import {
  CardDesign,
  CardThemeId,
  generateCardSvg,
} from "@/lib/card-artwork";

export type SheetType = "a4-8up" | "sra3-21up";

export interface SheetSpec {
  type: SheetType;
  name: string;
  widthMm: number;
  heightMm: number;
  cols: number;
  rows: number;
  capacity: number;
  marginHorizMm: number;
  marginVertMm: number;
  gutterMm: number;
}

export const SHEET_SPECS: Record<SheetType, SheetSpec> = {
  "a4-8up": {
    type: "a4-8up",
    name: "A4 Digital Print (9-Up Portrait)",
    widthMm: 210,
    heightMm: 297,
    cols: 3,
    rows: 3,
    capacity: 9,
    marginHorizMm: 15.0,
    marginVertMm: 11.1,
    gutterMm: 0.0,
  },
  "sra3-21up": {
    type: "sra3-21up",
    name: "SRA3 Commercial Offset (20-Up Portrait)",
    widthMm: 320,
    heightMm: 450,
    cols: 5,
    rows: 4,
    capacity: 20,
    marginHorizMm: 10.0,
    marginVertMm: 41.8,
    gutterMm: 0.0,
  },
};

/** All themes are portrait. Kept for API compatibility. */
export function getEffectiveSheetSpec(sheetType: SheetType, _theme?: CardThemeId): SheetSpec {
  return SHEET_SPECS[sheetType];
}

export interface CardUnit {
  card_id: string;
  activation_url: string;
}

export interface GangSheetOptions {
  sheetType: SheetType;
  side: "front" | "back";
  batchId: string;
  batchName: string;
  theme: CardThemeId;
  cards: CardUnit[];
  design: CardDesign;
  sheetIndex?: number;
  totalSheets?: number;
}

/**
 * Generate a commercial-grade vector SVG Gang Sheet for A4 or SRA3 production runs.
 * Supports duplex mirroring (horizontal column inversion for Back side so duplex press matches).
 */
export async function generateGangSheetSvg(options: GangSheetOptions): Promise<string> {
  const {
    sheetType,
    side,
    batchId,
    batchName,
    theme,
    cards,
    design,
    sheetIndex = 1,
    totalSheets = 1,
  } = options;

  const spec = getEffectiveSheetSpec(sheetType, theme);
  const cardWidthMm = 60.0;
  const cardHeightMm = 91.6;

  const sheetW = spec.widthMm;
  const sheetH = spec.heightMm;

  // Header job info
  const dateStr = new Date().toISOString().slice(0, 10);
  const sideLabel = side === "front" ? "FRONT FACE (NFC TAP)" : "BACK FACE (QR & ID)";
  const headerText = `QRSLICE HARDWARE IMPOSITION · ${batchName.toUpperCase()} (${batchId}) · ${spec.name} · SHEET ${sheetIndex}/${totalSheets} · ${sideLabel} · ${dateStr}`;
  const isPortrait = true;

  // Start SVG Canvas with millimetric units
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
      `width="${sheetW}mm" height="${sheetH}mm" viewBox="0 0 ${sheetW} ${sheetH}">`
  );

  // Background white sheet
  parts.push(`<rect width="${sheetW}" height="${sheetH}" fill="#FFFFFF"/>`);

  // Job Header and Metadata
  parts.push(
    `<g id="sheet-header" font-family="'Courier New', Courier, monospace" font-size="2.4" fill="#555555">` +
      `<text x="${spec.marginHorizMm}" y="6">${escapeXml(headerText)}</text>` +
      `<text x="${sheetW - spec.marginHorizMm}" y="6" text-anchor="end">CR80 TRIM: ${isPortrait ? "54 × 85.6" : "85.6 × 54"} mm (3mm BLEED)</text>` +
      `</g>`
  );

  // Color Registration Targets & CMYK density bars
  parts.push(renderRegistrationMarks(sheetW, sheetH, spec.marginHorizMm, spec.marginVertMm));

  // Render Cards Grid
  const cardSvgs = new Map<string, { front: string; back: string }>();
  for (const c of cards) {
    if (!cardSvgs.has(c.card_id)) {
      const generated = await generateCardSvg(theme, design, c);
      cardSvgs.set(c.card_id, generated);
    }
  }

  for (let r = 0; r < spec.rows; r++) {
    for (let c = 0; c < spec.cols; c++) {
      const slotIndex = r * spec.cols + c;
      if (slotIndex >= cards.length) continue;

      // Duplex alignment rule: On the Back side, column 0 of front must map to column (cols - 1) of back
      const targetCol = side === "back" ? spec.cols - 1 - c : c;
      const card = cards[slotIndex];
      const cardSvgPair = cardSvgs.get(card.card_id);
      if (!cardSvgPair) continue;

      const x = spec.marginHorizMm + targetCol * (cardWidthMm + spec.gutterMm);
      const y = spec.marginVertMm + r * (cardHeightMm + spec.gutterMm);

      const rawSvg = side === "front" ? cardSvgPair.front : cardSvgPair.back;

      // Extract inner content of card SVG to nest cleanly inside <g transform="...">
      const innerContent = extractSvgInner(rawSvg);

      parts.push(
        `<g id="slot-${r}-${targetCol}-${card.card_id}" transform="translate(${x.toFixed(2)}, ${y.toFixed(2)})">`
      );

      // Embedded Card SVG
      parts.push(innerContent);

      // Add Corner Crop / Cut Marks for die-cutter
      parts.push(renderCropMarks(cardWidthMm, cardHeightMm, 3.0));

      parts.push(`</g>`);
    }
  }

  parts.push(`</svg>`);
  return parts.join("\n");
}

/**
 * Split a list of cards into multiple paginated gang sheets
 */
export function paginateCardsForSheets(
  cards: CardUnit[],
  sheetType: SheetType,
  theme?: CardThemeId
): CardUnit[][] {
  const capacity = getEffectiveSheetSpec(sheetType, theme).capacity;
  const pages: CardUnit[][] = [];
  for (let i = 0; i < cards.length; i += capacity) {
    pages.push(cards.slice(i, i + capacity));
  }
  return pages;
}

function renderRegistrationMarks(
  sheetW: number,
  sheetH: number,
  marginH: number,
  marginV: number
): string {
  const targets = [
    { cx: marginH / 2, cy: marginV / 2 },
    { cx: sheetW - marginH / 2, cy: marginV / 2 },
    { cx: marginH / 2, cy: sheetH - marginV / 2 },
    { cx: sheetW - marginH / 2, cy: sheetH - marginV / 2 },
  ];

  const marks = targets
    .map(
      (t) =>
        `<g transform="translate(${t.cx.toFixed(1)}, ${t.cy.toFixed(1)})" stroke="#000000" stroke-width="0.2" fill="none">` +
        `<circle r="2"/>` +
        `<line x1="-3" y1="0" x2="3" y2="0"/>` +
        `<line x1="0" y1="-3" x2="0" y2="3"/>` +
        `</g>`
    )
    .join("");

  // CMYK color density test patches at bottom
  const cmykColors = ["#00FFFF", "#FF00FF", "#FFFF00", "#000000"];
  const cmykBars = cmykColors
    .map(
      (col, idx) =>
        `<rect x="${(sheetW / 2 - 12 + idx * 6).toFixed(1)}" y="${(sheetH - 5).toFixed(1)}" width="5" height="3" fill="${col}"/>`
    )
    .join("");

  return `<g id="registration-and-cmyk">${marks}${cmykBars}</g>`;
}

function renderCropMarks(w: number, h: number, bleed: number): string {
  const lineLen = 2.5;
  const strokeW = 0.18;
  const col = "#000000";

  // Trim box coordinates (inner cut line without bleed)
  const left = bleed;
  const top = bleed;
  const right = w - bleed;
  const bottom = h - bleed;

  return (
    `<g stroke="${col}" stroke-width="${strokeW}" fill="none">` +
    // Top-Left
    `<line x1="${left - lineLen}" y1="${top}" x2="${left}" y2="${top}"/>` +
    `<line x1="${left}" y1="${top - lineLen}" x2="${left}" y2="${top}"/>` +
    // Top-Right
    `<line x1="${right}" y1="${top}" x2="${right + lineLen}" y2="${top}"/>` +
    `<line x1="${right}" y1="${top - lineLen}" x2="${right}" y2="${top}"/>` +
    // Bottom-Left
    `<line x1="${left - lineLen}" y1="${bottom}" x2="${left}" y2="${bottom}"/>` +
    `<line x1="${left}" y1="${bottom}" x2="${left}" y2="${bottom + lineLen}"/>` +
    // Bottom-Right
    `<line x1="${right}" y1="${bottom}" x2="${right + lineLen}" y2="${bottom}"/>` +
    `<line x1="${right}" y1="${bottom}" x2="${right}" y2="${bottom + lineLen}"/>` +
    `</g>`
  );
}

function extractSvgInner(svg: string): string {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return match ? match[1] : svg;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
