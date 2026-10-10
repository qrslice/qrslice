// Copyright (c) 2026 QRslice. All rights reserved.
import crypto from "crypto";
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { CARD_THEME_IDS, type CardThemeId } from "./card-constants";

export { CARD_THEME_IDS, type CardThemeId };

// Default card logo: print-sized QRslice wordmark from /public, embedded as
// a data URI so exported SVGs stay standalone (no external file refs).
let cachedDefaultLogoUri: string | null | undefined;
function defaultLogoUri(): string | null {
  if (cachedDefaultLogoUri !== undefined) return cachedDefaultLogoUri;
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "logo-card.png"));
    cachedDefaultLogoUri = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    cachedDefaultLogoUri = null;
  }
  return cachedDefaultLogoUri;
}

// ─── Theme Model ─────────────────────────────────────────────────────────────

export interface CardTheme {
  id: CardThemeId;
  label: string;
  frontBg: string;
  frontInk: string;
  frontMuted: string;
  backBg: string;
  backInk: string;
  backMuted: string;
  accent: string;
  accent2: string;
  frame: string;
  qrInk: string;
  headlineFont: string;
}

export const CARD_THEMES: Record<CardThemeId, CardTheme> = {
  "google-review": {
    id: "google-review",
    label: "Google 5-Star Official",
    frontBg: "#FFFFFF",
    frontInk: "#1E293B",
    frontMuted: "#64748B",
    backBg: "#FFFFFF",
    backInk: "#1E293B",
    backMuted: "#64748B",
    accent: "#4285F4",
    accent2: "#34A853",
    frame: "#4285F4",
    qrInk: "#0F172A",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "premium-plum": {
    id: "premium-plum",
    label: "Royal Plum & Gold",
    frontBg: "#1E0E38",
    frontInk: "#FFF9F0",
    frontMuted: "#D1C4E9",
    backBg: "#17082E",
    backInk: "#FFF9F0",
    backMuted: "#C5B3E6",
    accent: "#D4AF37",
    accent2: "#F3E5AB",
    frame: "#D4AF37",
    qrInk: "#1E0E38",
    headlineFont: "'Playfair Display', Georgia, serif",
  },
  "minimal-mono": {
    id: "minimal-mono",
    label: "Architectural Mono",
    frontBg: "#0C0D0E",
    frontInk: "#F8FAFC",
    frontMuted: "#94A3B8",
    backBg: "#0C0D0E",
    backInk: "#F8FAFC",
    backMuted: "#94A3B8",
    accent: "#E2E8F0",
    accent2: "#64748B",
    frame: "#334155",
    qrInk: "#0F172A",
    headlineFont: "'JetBrains Mono', 'SF Mono', monospace",
  },
  "instagram-follow": {
    id: "instagram-follow",
    label: "Instagram Follow",
    frontBg: "#14081E",
    frontInk: "#FFFFFF",
    frontMuted: "#E9D5FF",
    backBg: "#14081E",
    backInk: "#FFFFFF",
    backMuted: "#E9D5FF",
    accent: "#E1306C",
    accent2: "#FCAF45",
    frame: "#E1306C",
    qrInk: "#14081E",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "wifi-connect": {
    id: "wifi-connect",
    label: "Instant Wi-Fi Tap",
    frontBg: "#071A2E",
    frontInk: "#F0F9FF",
    frontMuted: "#7DD3FC",
    backBg: "#071A2E",
    backInk: "#F0F9FF",
    backMuted: "#7DD3FC",
    accent: "#00D2FF",
    accent2: "#0284C7",
    frame: "#00D2FF",
    qrInk: "#071A2E",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "digital-bizcard": {
    id: "digital-bizcard",
    label: "Executive vCard",
    frontBg: "#121316",
    frontInk: "#FFFFFF",
    frontMuted: "#A1A1AA",
    backBg: "#121316",
    backInk: "#FFFFFF",
    backMuted: "#A1A1AA",
    accent: "#3B82F6",
    accent2: "#60A5FA",
    frame: "#3B82F6",
    qrInk: "#121316",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "menu-order": {
    id: "menu-order",
    label: "Dine-In Menu & Order",
    frontBg: "#240E06",
    frontInk: "#FFFBEB",
    frontMuted: "#FDE68A",
    backBg: "#240E06",
    backInk: "#FFFBEB",
    backMuted: "#FDE68A",
    accent: "#F59E0B",
    accent2: "#D97706",
    frame: "#F59E0B",
    qrInk: "#240E06",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "appointment-book": {
    id: "appointment-book",
    label: "Salon & Studio Booking",
    frontBg: "#04241C",
    frontInk: "#ECFDF5",
    frontMuted: "#6EE7B7",
    backBg: "#04241C",
    backInk: "#ECFDF5",
    backMuted: "#6EE7B7",
    accent: "#10B981",
    accent2: "#34D399",
    frame: "#10B981",
    qrInk: "#04241C",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "loyalty-rewards": {
    id: "loyalty-rewards",
    label: "VIP Loyalty & Stamp",
    frontBg: "#02261E",
    frontInk: "#ECFDF5",
    frontMuted: "#A7F3D0",
    backBg: "#02261E",
    backInk: "#ECFDF5",
    backMuted: "#A7F3D0",
    accent: "#FBBF24",
    accent2: "#F59E0B",
    frame: "#FBBF24",
    qrInk: "#02261E",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "upi-payment": {
    id: "upi-payment",
    label: "Instant UPI & Tap Pay",
    frontBg: "#03283B",
    frontInk: "#F0FDF4",
    frontMuted: "#BAE6FD",
    backBg: "#03283B",
    backInk: "#F0FDF4",
    backMuted: "#BAE6FD",
    accent: "#06B6D4",
    accent2: "#10B981",
    frame: "#06B6D4",
    qrInk: "#03283B",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "event-badge": {
    id: "event-badge",
    label: "Summit & Pass Badge",
    frontBg: "#0C0E28",
    frontInk: "#EEF2FF",
    frontMuted: "#C7D2FE",
    backBg: "#0C0E28",
    backInk: "#EEF2FF",
    backMuted: "#C7D2FE",
    accent: "#818CF8",
    accent2: "#6366F1",
    frame: "#818CF8",
    qrInk: "#0C0E28",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "feedback-survey": {
    id: "feedback-survey",
    label: "Private Voice of Guest",
    frontBg: "#171736",
    frontInk: "#EEF2FF",
    frontMuted: "#C7D2FE",
    backBg: "#171736",
    backInk: "#EEF2FF",
    backMuted: "#C7D2FE",
    accent: "#FBBF24",
    accent2: "#818CF8",
    frame: "#FBBF24",
    qrInk: "#171736",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  "custom-url": {
    id: "custom-url",
    label: "Universal Smart Link",
    frontBg: "#0F0F14",
    frontInk: "#FAFAFA",
    frontMuted: "#D8B4FE",
    backBg: "#0F0F14",
    backInk: "#FAFAFA",
    backMuted: "#D8B4FE",
    accent: "#A855F7",
    accent2: "#C084FC",
    frame: "#A855F7",
    qrInk: "#0F0F14",
    headlineFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
};

export function isCardThemeId(v: string): v is CardThemeId {
  return (CARD_THEME_IDS as readonly string[]).includes(v);
}

// ─── Design Model ────────────────────────────────────────────────────────────

export interface CardDesign {
  businessName: string;
  logoUrl?: string | null;
  theme: CardThemeId;
  headline: string;
  backTitle: string;
  backLine1: string;
  backLine2: string;
  contactLine: string;
}

export const FEEDBACK_FIRST_DEFAULTS: Omit<CardDesign, "businessName" | "logoUrl" | "theme"> = {
  headline: "Tap with smartphone or scan QR code",
  backTitle: "Enjoyed your visit?",
  backLine1: "Your feedback keeps us cooking.",
  backLine2: "Scan to connect instantly.",
  contactLine: "Table Service & Guest Concierge",
};

export function defaultCardDesign(theme: CardThemeId = "premium-plum"): CardDesign {
  return {
    businessName: "",
    logoUrl: null,
    theme,
    ...FEEDBACK_FIRST_DEFAULTS,
  };
}

export interface CardRef {
  card_id: string;
  activation_url: string;
}

export const PRINT_SPEC = {
  cardMm: { w: 53.98, h: 85.6 },
  bleedMm: 3,
  canvasMm: { w: 60, h: 91.6 },
  cornerRadiusMm: 3.18,
  qrMinMm: 18,
  qrBackMm: 30,
  quietZoneModules: 4,
  ecLevel: "H",
} as const;

export const PRINT_SPEC_TEXT =
  "CR80 53.98 x 85.6 mm Portrait + 3 mm bleed (canvas 60 x 91.6 mm) -- 3.18 mm corners -- QR >= 18 mm EC-H 4-module quiet zone";

export const CARD_ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CARD_ID_PREFIX = "QS-";
export const CARD_ID_RANDOM_LEN = 7;

export function generateCardId(): string {
  const bytes = crypto.randomBytes(CARD_ID_RANDOM_LEN);
  let out = CARD_ID_PREFIX;
  for (let i = 0; i < CARD_ID_RANDOM_LEN; i += 1) {
    out += CARD_ID_ALPHABET[bytes[i] % CARD_ID_ALPHABET.length];
  }
  return out;
}

export function isValidCardId(id: string): boolean {
  if (typeof id !== "string") return false;
  if (!id.startsWith(CARD_ID_PREFIX)) return false;
  const rest = id.slice(CARD_ID_PREFIX.length);
  if (rest.length !== CARD_ID_RANDOM_LEN) return false;
  for (const c of rest) {
    if (!CARD_ID_ALPHABET.includes(c)) return false;
  }
  return true;
}

export function generateClaimToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hashClaimToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

export function buildActivationUrl(cardId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://qrslice.com";
  return `${base.replace(/\/+$/, "")}/a/${encodeURIComponent(cardId)}`;
}

// ─── QR Code Engine ──────────────────────────────────────────────────────────

interface QrMatrix {
  size: number;
  get: (row: number, col: number) => boolean;
}

const qrCache = new Map<string, QrMatrix>();

function getQrMatrix(text: string): QrMatrix {
  const cached = qrCache.get(text);
  if (cached) return cached;
  const qr = QRCode.create(text, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const mat: QrMatrix = {
    size,
    get(row, col) {
      if (row < 0 || row >= size || col < 0 || col >= size) return false;
      return data[row * size + col] === 1;
    },
  };
  qrCache.set(text, mat);
  return mat;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapHeadline(s: string, maxPerLine = 28): [string, string | null] {
  const words = s.trim().split(/\s+/).filter(Boolean);
  if (words.join(" ").length <= maxPerLine) return [words.join(" "), null];
  let line1 = "";
  let i = 0;
  while (i < words.length && `${line1} ${words[i]}`.trim().length <= maxPerLine) {
    line1 = `${line1} ${words[i]}`.trim();
    i += 1;
  }
  if (i === 0) {
    line1 = words[0].slice(0, maxPerLine - 1);
    i = 0;
  }
  let line2 = words.slice(i).join(" ");
  if (line2.length > maxPerLine) line2 = `${line2.slice(0, Math.max(0, maxPerLine - 1))}...`;
  return [line1, line2 || null];
}

function renderQr(
  matrix: QrMatrix,
  xMm: number,
  yMm: number,
  boxMm: number,
  ink: string,
  patchFill: string | null,
  idPrefix: string,
): string {
  const quiet = PRINT_SPEC.quietZoneModules;
  const total = matrix.size + quiet * 2;
  const modW = boxMm / total;
  const parts: string[] = [];
  if (patchFill) {
    parts.push(
      `<rect x="${xMm.toFixed(3)}" y="${yMm.toFixed(3)}" width="${boxMm.toFixed(3)}" height="${boxMm.toFixed(3)}" rx="2" fill="${patchFill}"/>`,
    );
  }
  parts.push(`<g id="${idPrefix}" fill="${ink}">`);
  for (let r = 0; r < matrix.size; r += 1) {
    for (let c = 0; c < matrix.size; c += 1) {
      if (matrix.get(r, c)) {
        const x = xMm + (c + quiet) * modW;
        const y = yMm + (r + quiet) * modW;
        parts.push(
          `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${(modW + 0.04).toFixed(3)}" height="${(modW + 0.04).toFixed(3)}"/>`,
        );
      }
    }
  }
  parts.push("</g>");
  return parts.join("");
}

// ─── High-End Geometric Shapes & Medallions ──────────────────────────────────

function nfcContactlessPill(
  cx: number,
  cy: number,
  accentColor: string,
  textColor: string,
  bgColor: string,
  glowColor = accentColor,
): string {
  return (
    `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)})">` +
    // Outer subtle ambient glow
    `<rect x="-20" y="-4.6" width="40" height="9.2" rx="4.6" fill="${glowColor}" fill-opacity="0.14"/>` +
    // Outer bezel pill
    `<rect x="-19" y="-4.0" width="38" height="8.0" rx="4.0" fill="${bgColor}" stroke="${accentColor}" stroke-width="0.35"/>` +
    // Inner concentric highlight hairline
    `<rect x="-18.2" y="-3.2" width="36.4" height="6.4" rx="3.2" fill="none" stroke="${accentColor}" stroke-width="0.15" stroke-opacity="0.35"/>` +
    // NFC Arcs
    `<g transform="translate(-11.5 0) scale(0.65)" fill="none" stroke="${accentColor}" stroke-width="1.6" stroke-linecap="round">` +
    `<path d="M -3.5 -4.5 A 6 6 0 0 1 -3.5 4.5"/>` +
    `<path d="M 0 -7 A 9.5 9.5 0 0 1 0 7"/>` +
    `<path d="M 3.5 -9.5 A 13 13 0 0 1 3.5 9.5"/>` +
    `</g>` +
    // Label
    `<text x="2.0" y="1.1" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="2.1" font-weight="800" letter-spacing="0.9" fill="${textColor}">TAP CONTACTLESS</text>` +
    `</g>`
  );
}

function cornerRegistrationBrackets(x: number, y: number, w: number, h: number, stroke: string): string {
  const len = 3.2;
  return (
    `<g fill="none" stroke="${stroke}" stroke-width="0.35" opacity="0.75">` +
    // Top-Left
    `<path d="M ${x} ${y + len} L ${x} ${y} L ${x + len} ${y}"/>` +
    `<circle cx="${x + 0.9}" cy="${y + 0.9}" r="0.25" fill="${stroke}"/>` +
    // Top-Right
    `<path d="M ${x + w - len} ${y} L ${x + w} ${y} L ${x + w} ${y + len}"/>` +
    `<circle cx="${x + w - 0.9}" cy="${y + 0.9}" r="0.25" fill="${stroke}"/>` +
    // Bottom-Left
    `<path d="M ${x} ${y + h - len} L ${x} ${y + h} L ${x + len} ${y + h}"/>` +
    `<circle cx="${x + 0.9}" cy="${y + h - 0.9}" r="0.25" fill="${stroke}"/>` +
    // Bottom-Right
    `<path d="M ${x + w - len} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y + h - len}"/>` +
    `<circle cx="${x + w - 0.9}" cy="${y + h - 0.9}" r="0.25" fill="${stroke}"/>` +
    `</g>`
  );
}

function goldStars(cx: number, y: number, gap: number, r: number, fill: string): string {
  let out = "";
  for (let i = 0; i < 5; i += 1) {
    const x = cx + (i - 2) * gap;
    const pts: string[] = [];
    for (let k = 0; k < 10; k += 1) {
      const ang = (Math.PI / 5) * k - Math.PI / 2;
      const rad = k % 2 === 0 ? r : r * 0.45;
      pts.push(`${(x + rad * Math.cos(ang)).toFixed(2)},${(y + rad * Math.sin(ang)).toFixed(2)}`);
    }
    out += `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
  }
  return out;
}

function archedStars(): string {
  const starCoords = [
    { x: 15.0, y: 15.2, r: 2.2 },
    { x: 22.0, y: 12.2, r: 2.7 },
    { x: 30.0, y: 10.0, r: 3.5 },
    { x: 38.0, y: 12.2, r: 2.7 },
    { x: 45.0, y: 15.2, r: 2.2 },
  ];
  let out = "";
  for (const s of starCoords) {
    const pts: string[] = [];
    for (let k = 0; k < 10; k += 1) {
      const ang = (Math.PI / 5) * k - Math.PI / 2;
      const rad = k % 2 === 0 ? s.r : s.r * 0.45;
      pts.push(`${(s.x + rad * Math.cos(ang)).toFixed(2)},${(s.y + rad * Math.sin(ang)).toFixed(2)}`);
    }
    out += `<polygon points="${pts.join(" ")}" fill="#FBBC04"/>`;
  }
  return out;
}

// ─── Theme Icons (Master High-End Medallions) ────────────────────────────────

function googleOfficialMedallion(cx: number, cy: number): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    // Outer double-bezel concentric ring
    `<circle cx="0" cy="0" r="14.2" fill="#FFFFFF" stroke="url(#g4Grad)" stroke-width="0.8"/>` +
    `<circle cx="0" cy="0" r="12.6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="0.3"/>` +
    // Google G Mark
    `<g transform="scale(0.9) translate(-12 -12)">` +
    `<path d="M 22.56 12.25 C 22.56 11.47 22.49 10.72 22.36 10 L 12 10 L 12 14.26 L 17.92 14.26 C 17.67 15.63 16.89 16.79 15.73 17.57 L 15.73 20.34 L 19.28 20.34 C 21.36 18.42 22.56 15.6 22.56 12.25 Z" fill="#4285F4"/>` +
    `<path d="M 12 23 C 14.97 23 17.46 22.02 19.28 20.34 L 15.73 17.57 C 14.75 18.23 13.48 18.63 12 18.63 C 9.13 18.63 6.7 16.69 5.83 14.08 L 2.16 14.08 L 2.16 16.93 C 3.97 20.53 7.7 23 12 23 Z" fill="#34A853"/>` +
    `<path d="M 5.83 14.08 C 5.61 13.41 5.48 12.71 5.48 12 C 5.48 11.29 5.61 10.59 5.83 9.92 L 5.83 7.07 L 2.16 7.07 C 1.42 8.55 1 10.22 1 12 C 1 13.78 1.42 15.45 2.16 16.93 L 5.83 14.08 Z" fill="#FBBC05"/>` +
    `<path d="M 12 5.38 C 13.62 5.38 15.07 5.94 16.21 7.03 L 19.36 3.88 C 17.45 2.1 14.96 1 12 1 C 7.7 1 3.97 3.47 2.16 7.07 L 5.83 9.92 C 6.7 7.31 9.13 5.38 12 5.38 Z" fill="#EA4335"/>` +
    `</g>` +
    // Verified Partner Badge
    `<g transform="translate(9.5, -9.5) scale(0.65)">` +
    `<circle cx="0" cy="0" r="4.5" fill="#4285F4"/>` +
    `<path d="M -2.2 -0.2 L -0.6 1.4 L 2.4 -1.6" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</g>` +
    `</g>`
  );
}

function luxuryCrownMedallion(cx: number, cy: number, gold: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    // Outer concentric halo
    `<circle cx="0" cy="0" r="14.8" fill="none" stroke="${gold}" stroke-width="0.3" stroke-dasharray="1.2 0.8" opacity="0.6"/>` +
    `<circle cx="0" cy="0" r="13.2" fill="#250F44" stroke="${gold}" stroke-width="0.5"/>` +
    `<circle cx="0" cy="0" r="11.8" fill="none" stroke="${gold}" stroke-width="0.25" opacity="0.4"/>` +
    // 24k Gold Crown
    `<g transform="scale(0.9) translate(-12 -12)">` +
    `<path fill="url(#goldFoil)" d="M 3 18 L 3 10 L 7 14 L 12 6 L 17 14 L 21 10 L 21 18 Z"/>` +
    `<rect x="3" y="18" width="18" height="2.8" rx="0.8" fill="url(#goldFoil)"/>` +
    `<circle cx="7" cy="11.8" r="1.1" fill="#FFF9F0"/>` +
    `<circle cx="12" cy="8.5" r="1.3" fill="#FFF9F0"/>` +
    `<circle cx="17" cy="11.8" r="1.1" fill="#FFF9F0"/>` +
    `</g>` +
    `</g>`
  );
}

function modernRadarMedallion(cx: number, cy: number, color: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<rect x="-14" y="-14" width="28" height="28" rx="7" fill="#141619" stroke="${color}" stroke-width="0.4"/>` +
    `<circle cx="0" cy="0" r="10.5" fill="none" stroke="${color}" stroke-width="0.25" opacity="0.3"/>` +
    `<circle cx="0" cy="0" r="7.5" fill="none" stroke="${color}" stroke-width="0.4"/>` +
    `<circle cx="0" cy="0" r="3.2" fill="none" stroke="${color}" stroke-width="0.6"/>` +
    `<circle cx="0" cy="0" r="1.2" fill="${color}"/>` +
    `<line x1="-12" y1="0" x2="12" y2="0" stroke="${color}" stroke-width="0.35"/>` +
    `<line x1="0" y1="-12" x2="0" y2="12" stroke="${color}" stroke-width="0.35"/>` +
    `<text x="-11" y="-10" font-family="'JetBrains Mono', monospace" font-size="1.4" fill="${color}" opacity="0.7">360°</text>` +
    `<text x="6" y="12" font-family="'JetBrains Mono', monospace" font-size="1.4" fill="${color}" opacity="0.7">REC</text>` +
    `</g>`
  );
}

function instagramMedallion(cx: number, cy: number): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    // Outer ambient glow
    `<rect x="-15" y="-15" width="30" height="30" rx="8.5" fill="#E1306C" fill-opacity="0.15"/>` +
    // Instagram Rounded Bezel
    `<rect x="-13.5" y="-13.5" width="27" height="27" rx="7.5" fill="url(#igGrad)" stroke="#FFFFFF" stroke-width="0.45"/>` +
    // Inner Camera Glyph
    `<rect x="-8.5" y="-8.5" width="17" height="17" rx="4.5" fill="none" stroke="#FFFFFF" stroke-width="1.3"/>` +
    `<circle cx="0" cy="0" r="4.2" fill="none" stroke="#FFFFFF" stroke-width="1.3"/>` +
    `<circle cx="4.8" cy="-4.8" r="1.1" fill="#FFFFFF"/>` +
    `</g>`
  );
}

function wifiMedallion(cx: number, cy: number, cyan: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<circle cx="0" cy="0" r="14.8" fill="#041B33" stroke="${cyan}" stroke-width="0.45"/>` +
    `<circle cx="0" cy="0" r="12.8" fill="none" stroke="${cyan}" stroke-width="0.2" stroke-dasharray="1 0.7" opacity="0.7"/>` +
    `<g transform="translate(0 2.2) scale(0.92)" fill="none" stroke="${cyan}" stroke-width="1.9" stroke-linecap="round">` +
    `<path d="M -9.5 -7.5 A 13 13 0 0 1 9.5 -7.5"/>` +
    `<path d="M -6.5 -4.0 A 8.5 8.5 0 0 1 6.5 -4.0"/>` +
    `<path d="M -3.2 -0.5 A 4.5 4.5 0 0 1 3.2 -0.5"/>` +
    `<circle cx="0" cy="3.5" r="1.6" fill="${cyan}" stroke="none"/>` +
    `</g>` +
    `</g>`
  );
}

function bizchipMedallion(cx: number, cy: number, blue: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    // Outer Titanium Housing
    `<rect x="-14" y="-13" width="28" height="26" rx="6" fill="#181A20" stroke="${blue}" stroke-width="0.4"/>` +
    // Authentic Smart EMV Chip Module
    `<rect x="-9.5" y="-8" width="19" height="16" rx="2.5" fill="url(#silverFoil)" stroke="#475569" stroke-width="0.3"/>` +
    // Isolation tracks
    `<line x1="-9.5" y1="0" x2="9.5" y2="0" stroke="#334155" stroke-width="0.4"/>` +
    `<line x1="-3.2" y1="-8" x2="-3.2" y2="8" stroke="#334155" stroke-width="0.4"/>` +
    `<line x1="3.2" y1="-8" x2="3.2" y2="8" stroke="#334155" stroke-width="0.4"/>` +
    `<rect x="-2.2" y="-3.5" width="4.4" height="7" rx="1.2" fill="#F8FAFC" stroke="#334155" stroke-width="0.35"/>` +
    `</g>`
  );
}

function bistroMedallion(cx: number, cy: number, amber: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<circle cx="0" cy="0" r="14.8" fill="#2E1208" stroke="${amber}" stroke-width="0.45"/>` +
    `<circle cx="0" cy="0" r="12.8" fill="none" stroke="${amber}" stroke-width="0.2" stroke-dasharray="1 0.7" opacity="0.6"/>` +
    `<g transform="scale(0.92) translate(-12 -12)" fill="none" stroke="${amber}" stroke-width="1.4" stroke-linecap="round">` +
    `<path d="M 7 3 V 10 M 5 3 V 7 Q 5 9 7 9 Q 9 9 9 7 V 3"/>` +
    `<line x1="7" y1="10" x2="7" y2="21"/>` +
    `<path d="M 17 3 Q 19.5 3 19.5 7 V 10 Q 19.5 11 18 11 H 17 V 3 Z" fill="${amber}"/>` +
    `<line x1="17" y1="11" x2="17" y2="21"/>` +
    `</g>` +
    `</g>`
  );
}

function salonMedallion(cx: number, cy: number, emerald: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<circle cx="0" cy="0" r="14.8" fill="#04271F" stroke="${emerald}" stroke-width="0.45"/>` +
    `<circle cx="0" cy="0" r="12.8" fill="none" stroke="${emerald}" stroke-width="0.2" stroke-dasharray="1 0.7" opacity="0.6"/>` +
    `<g transform="scale(0.88) translate(-12 -12)">` +
    `<rect x="3" y="5" width="18" height="17" rx="3" fill="${emerald}"/>` +
    `<rect x="3" y="5" width="18" height="5" rx="3" fill="#021C16"/>` +
    `<circle cx="8" cy="14" r="1.2" fill="#FFFFFF"/>` +
    `<circle cx="12" cy="14" r="1.2" fill="#FFFFFF"/>` +
    `<circle cx="16" cy="14" r="1.2" fill="#FFFFFF"/>` +
    `<circle cx="8" cy="18" r="1.2" fill="#FFFFFF"/>` +
    `<circle cx="12" cy="18" r="1.2" fill="#FFFFFF"/>` +
    `<circle cx="16" cy="18" r="1.2" fill="#FFFFFF"/>` +
    `</g>` +
    `</g>`
  );
}

function upiMedallion(cx: number, cy: number, cyan: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<circle cx="0" cy="0" r="14.8" fill="#03263B" stroke="${cyan}" stroke-width="0.45"/>` +
    `<circle cx="0" cy="0" r="12.8" fill="none" stroke="${cyan}" stroke-width="0.2" stroke-dasharray="1 0.7" opacity="0.6"/>` +
    `<g transform="scale(0.88) translate(-12 -12)">` +
    `<circle cx="12" cy="12" r="10.5" fill="${cyan}"/>` +
    `<g fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">` +
    `<line x1="7.5" y1="7" x2="16.5" y2="7"/>` +
    `<line x1="7.5" y1="11" x2="16.5" y2="11"/>` +
    `<path d="M 9.5 7 Q 14.5 7 14.5 9 Q 14.5 11 9.5 11 Q 14.5 11 14.5 13 Q 14.5 15.5 9.5 15.5"/>` +
    `<line x1="9.5" y1="15.5" x2="16" y2="21"/>` +
    `</g>` +
    `</g>` +
    `</g>`
  );
}

function eventMedallion(cx: number, cy: number, indigo: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<rect x="-14" y="-14" width="28" height="28" rx="7" fill="#131538" stroke="${indigo}" stroke-width="0.45"/>` +
    `<g transform="scale(0.88) translate(-12 -12)">` +
    `<path d="M 3 6 H 21 V 10.5 A 2 2 0 0 0 21 14.5 V 19 H 3 V 14.5 A 2 2 0 0 0 3 10.5 Z" fill="${indigo}"/>` +
    `<line x1="14" y1="6" x2="14" y2="19" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="1.5 1"/>` +
    `<circle cx="8.5" cy="12.5" r="2.5" fill="#FFFFFF"/>` +
    `</g>` +
    `</g>`
  );
}

function feedbackMedallion(cx: number, cy: number, gold: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<circle cx="0" cy="0" r="14.8" fill="#1A1A40" stroke="${gold}" stroke-width="0.45"/>` +
    `<circle cx="0" cy="0" r="12.8" fill="none" stroke="${gold}" stroke-width="0.2" stroke-dasharray="1 0.7" opacity="0.6"/>` +
    `<g transform="scale(0.88) translate(-12 -12)">` +
    `<path d="M 4 3 H 20 Q 22 3 22 5 V 14 Q 22 16 20 16 H 10 L 6 20 V 16 H 4 Q 2 16 2 14 V 5 Q 2 3 4 3 Z" fill="${gold}"/>` +
    `${goldStars(12, 9.5, 3.2, 1.3, "#151532")}` +
    `</g>` +
    `</g>`
  );
}

function urlMedallion(cx: number, cy: number, purple: string): string {
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<circle cx="0" cy="0" r="14.8" fill="#1E1430" stroke="${purple}" stroke-width="0.45"/>` +
    `<circle cx="0" cy="0" r="12.8" fill="none" stroke="${purple}" stroke-width="0.2" stroke-dasharray="1 0.7" opacity="0.6"/>` +
    `<g transform="scale(0.92) translate(-12 -12)" fill="none" stroke="${purple}" stroke-width="1.6">` +
    `<circle cx="12" cy="12" r="10"/>` +
    `<ellipse cx="12" cy="12" rx="4.5" ry="10"/>` +
    `<line x1="2" y1="9" x2="22" y2="9"/>` +
    `<line x1="2" y1="15" x2="22" y2="15"/>` +
    `</g>` +
    `</g>`
  );
}

// ─── Theme Preset Visual Configurator ────────────────────────────────────────

const W = 60.0;
const H = 91.6;
const QR_BOX = 29.0;
const QR_X = (W - QR_BOX) / 2; // 15.5
const QR_Y = 35.5;

interface ThemeVisualConfig {
  defs: string;
  frontBgFill: string;
  frontInnerBezel: string;
  frontMedallion: string;
  frontEyebrow: string;
  frontDefaultHeadline: string;
  frontDecorations: string;
  nfcPill: string;
  backBgFill: string;
  backInnerBezel: string;
  backHeaderBadge: string;
  backDefaultSub: string;
  qrFrame: string;
  qrInk: string;
  fontFamily: string;
  accentColor: string;
  inkColor: string;
  mutedColor: string;
}

// Master Shared Gradients & Micro-Security Textures
const SHARED_DEFS =
  `<linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#FBF1C9"/>` +
  `<stop offset="35%" stop-color="#D4AF37"/>` +
  `<stop offset="70%" stop-color="#9E782F"/>` +
  `<stop offset="100%" stop-color="#F3E5AB"/>` +
  `</linearGradient>` +
  `<linearGradient id="silverFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#FFFFFF"/>` +
  `<stop offset="35%" stop-color="#CBD5E1"/>` +
  `<stop offset="70%" stop-color="#64748B"/>` +
  `<stop offset="100%" stop-color="#E2E8F0"/>` +
  `</linearGradient>` +
  `<linearGradient id="cyanFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#A5F3FC"/>` +
  `<stop offset="35%" stop-color="#06B6D4"/>` +
  `<stop offset="70%" stop-color="#0891B2"/>` +
  `<stop offset="100%" stop-color="#67E8F9"/>` +
  `</linearGradient>` +
  `<linearGradient id="emeraldFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#A7F3D0"/>` +
  `<stop offset="35%" stop-color="#10B981"/>` +
  `<stop offset="70%" stop-color="#047857"/>` +
  `<stop offset="100%" stop-color="#6EE7B7"/>` +
  `</linearGradient>` +
  `<linearGradient id="amberFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#FDE68A"/>` +
  `<stop offset="35%" stop-color="#F59E0B"/>` +
  `<stop offset="70%" stop-color="#B45309"/>` +
  `<stop offset="100%" stop-color="#FCD34D"/>` +
  `</linearGradient>` +
  `<linearGradient id="indigoFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#C7D2FE"/>` +
  `<stop offset="35%" stop-color="#6366F1"/>` +
  `<stop offset="70%" stop-color="#4338CA"/>` +
  `<stop offset="100%" stop-color="#818CF8"/>` +
  `</linearGradient>` +
  `<linearGradient id="purpleFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#E9D5FF"/>` +
  `<stop offset="35%" stop-color="#A855F7"/>` +
  `<stop offset="70%" stop-color="#7E22CE"/>` +
  `<stop offset="100%" stop-color="#C084FC"/>` +
  `</linearGradient>` +
  `<linearGradient id="blueFoil" x1="0%" y1="0%" x2="100%" y2="100%">` +
  `<stop offset="0%" stop-color="#BAE6FD"/>` +
  `<stop offset="35%" stop-color="#3B82F6"/>` +
  `<stop offset="70%" stop-color="#1D4ED8"/>` +
  `<stop offset="100%" stop-color="#60A5FA"/>` +
  `</linearGradient>` +
  `<linearGradient id="magStripe" x1="0%" y1="0%" x2="100%" y2="0%">` +
  `<stop offset="0%" stop-color="#0A0B0E"/>` +
  `<stop offset="50%" stop-color="#1E232A"/>` +
  `<stop offset="100%" stop-color="#0A0B0E"/>` +
  `</linearGradient>` +
  `<radialGradient id="specularGlow" cx="35%" cy="20%" r="65%">` +
  `<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.12"/>` +
  `<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0"/>` +
  `</radialGradient>` +
  `<pattern id="securityMesh" width="16" height="16" patternUnits="userSpaceOnUse">` +
  `<circle cx="8" cy="8" r="7.5" fill="none" stroke="currentColor" stroke-width="0.15" stroke-opacity="0.08"/>` +
  `<circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" stroke-width="0.15" stroke-opacity="0.05"/>` +
  `</pattern>`;

function getThemeVisualConfig(themeId: CardThemeId): ThemeVisualConfig {
  switch (themeId) {
    case "google-review":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<linearGradient id="g4Grad" x1="0%" y1="0%" x2="100%" y2="100%">` +
          `<stop offset="0%" stop-color="#4285F4"/>` +
          `<stop offset="33%" stop-color="#EA4335"/>` +
          `<stop offset="66%" stop-color="#FBBC05"/>` +
          `<stop offset="100%" stop-color="#34A853"/>` +
          `</linearGradient>` +
          `<radialGradient id="googleRadial" cx="50%" cy="25%" r="75%">` +
          `<stop offset="0%" stop-color="#FFFFFF"/>` +
          `<stop offset="100%" stop-color="#F1F5F9"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#googleRadial)",
        frontInnerBezel: "#CBD5E1",
        frontMedallion: googleOfficialMedallion(30, 27.5),
        frontEyebrow: "OFFICIAL GOOGLE REVIEW CARD",
        frontDefaultHeadline: "Tap your phone to review us on Google",
        frontDecorations: goldStars(30, 61.5, 4.4, 2.0, "#FBBC04"),
        nfcPill: nfcContactlessPill(30, 78.5, "#4285F4", "#1E293B", "#FFFFFF", "#4285F4"),
        backBgFill: "#FFFFFF",
        backInnerBezel: "#CBD5E1",
        backHeaderBadge: archedStars(),
        backDefaultSub: "Tap with smartphone or scan QR code",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#g4Grad)" stroke-width="1.2"/>`,
        qrInk: "#1E293B",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        accentColor: "#4285F4",
        inkColor: "#1E293B",
        mutedColor: "#64748B",
      };

    case "premium-plum":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="plumGlow" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#421A75"/>` +
          `<stop offset="65%" stop-color="#210D3B"/>` +
          `<stop offset="100%" stop-color="#140726"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#plumGlow)",
        frontInnerBezel: "url(#goldFoil)",
        frontMedallion: luxuryCrownMedallion(30, 27.5, "#D4AF37"),
        frontEyebrow: "VIP PRIVILEGES & CONCIERGE",
        frontDefaultHeadline: "Tap for an exclusive guest dining experience",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#goldFoil)" stroke-width="0.35"/>` +
          `<circle cx="30" cy="61.5" r="1.1" fill="#D4AF37"/>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#D4AF37", "#FFF9F0", "#261042", "#D4AF37"),
        backBgFill: "#140726",
        backInnerBezel: "url(#goldFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="3.2" font-style="italic" font-weight="bold" fill="url(#goldFoil)">Unlock Exclusive Access</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#goldFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Tap or scan to connect with concierge",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#goldFoil)" stroke-width="1.2"/>`,
        qrInk: "#1E0E38",
        fontFamily: "'Playfair Display', Georgia, serif",
        accentColor: "#D4AF37",
        inkColor: "#FFF9F0",
        mutedColor: "#D1C4E9",
      };

    case "minimal-mono":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="monoGlow" cx="50%" cy="30%" r="65%">` +
          `<stop offset="0%" stop-color="#1C1E24"/>` +
          `<stop offset="100%" stop-color="#0B0C0E"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#monoGlow)",
        frontInnerBezel: "#475569",
        frontMedallion: modernRadarMedallion(30, 27.5, "#E2E8F0"),
        frontEyebrow: "ARCHITECTURAL INTERFACE",
        frontDefaultHeadline: "Scan or tap to explore seasonal artisan menu",
        frontDecorations:
          `<line x1="15" y1="61.5" x2="45" y2="61.5" stroke="#334155" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="1.8" letter-spacing="1.2" fill="#94A3B8">SEC: NFC·213</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#94A3B8", "#F8FAFC", "#17191E", "#64748B"),
        backBgFill: "#0B0C0E",
        backInnerBezel: "#475569",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="3.0" font-weight="700" letter-spacing="1.5" fill="#F8FAFC">DATA ROUTER</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="#475569" stroke-width="0.4"/>`,
        backDefaultSub: "Point camera or tap to read",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="#64748B" stroke-width="1.2"/>`,
        qrInk: "#0F172A",
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        accentColor: "#E2E8F0",
        inkColor: "#F8FAFC",
        mutedColor: "#94A3B8",
      };

    case "instagram-follow":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="igRadial" cx="50%" cy="30%" r="70%">` +
          `<stop offset="0%" stop-color="#401438"/>` +
          `<stop offset="70%" stop-color="#1A0722"/>` +
          `<stop offset="100%" stop-color="#0E0314"/>` +
          `</radialGradient>` +
          `<linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">` +
          `<stop offset="0%" stop-color="#FED373"/>` +
          `<stop offset="25%" stop-color="#F15245"/>` +
          `<stop offset="60%" stop-color="#D92E7F"/>` +
          `<stop offset="90%" stop-color="#9B36B7"/>` +
          `<stop offset="100%" stop-color="#515BD4"/>` +
          `</linearGradient>` +
          `</defs>`,
        frontBgFill: "url(#igRadial)",
        frontInnerBezel: "url(#igGrad)",
        frontMedallion: instagramMedallion(30, 27.5),
        frontEyebrow: "INSTAGRAM CONNECT",
        frontDefaultHeadline: "Tap your phone to follow our story & drops",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#igGrad)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="1.8" font-weight="700" letter-spacing="1.2" fill="#E1306C">@FOLLOW</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#E1306C", "#FFFFFF", "#280A30", "#E1306C"),
        backBgFill: "#0E0314",
        backInnerBezel: "url(#igGrad)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#igGrad)">FOLLOW ON INSTAGRAM</text>` +
          `<line x1="16" y1="21.5" x2="44" y2="21.5" stroke="url(#igGrad)" stroke-width="0.35"/>`,
        backDefaultSub: "Tap or scan to open official profile",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#igGrad)" stroke-width="1.2"/>`,
        qrInk: "#14081E",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#E1306C",
        inkColor: "#FFFFFF",
        mutedColor: "#E9D5FF",
      };

    case "wifi-connect":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="wifiRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#0E2F56"/>` +
          `<stop offset="70%" stop-color="#06182B"/>` +
          `<stop offset="100%" stop-color="#020B14"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#wifiRadial)",
        frontInnerBezel: "url(#cyanFoil)",
        frontMedallion: wifiMedallion(30, 27.5, "#00D2FF"),
        frontEyebrow: "FREE HIGH-SPEED WI-FI",
        frontDefaultHeadline: "Tap phone to connect instantly with zero password",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#cyanFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="1.8" letter-spacing="1.2" fill="#00D2FF">WIFI-7 · WPA3 SECURE</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#00D2FF", "#F0F9FF", "#0A2542", "#00D2FF"),
        backBgFill: "#04101C",
        backInnerBezel: "url(#cyanFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#cyanFoil)">INSTANT WI-FI ACCESS</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#cyanFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Tap or scan for guest network credentials",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#cyanFoil)" stroke-width="1.2"/>`,
        qrInk: "#071A2E",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#00D2FF",
        inkColor: "#F0F9FF",
        mutedColor: "#7DD3FC",
      };

    case "digital-bizcard":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="bizRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#1E293B"/>` +
          `<stop offset="70%" stop-color="#111215"/>` +
          `<stop offset="100%" stop-color="#090A0C"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#bizRadial)",
        frontInnerBezel: "url(#silverFoil)",
        frontMedallion: bizchipMedallion(30, 27.5, "#38BDF8"),
        frontEyebrow: "EXECUTIVE DIGITAL VCARD",
        frontDefaultHeadline: "Tap to save contact details directly to phonebook",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#silverFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="1.8" letter-spacing="1.2" fill="#94A3B8">NFC SMART CHIP · VCARD 4.0</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#38BDF8", "#FFFFFF", "#1E222D", "#38BDF8"),
        backBgFill: "#0A0B0D",
        backInnerBezel: "url(#silverFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#silverFoil)">EXECUTIVE VCARD</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#silverFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Scan or tap to exchange credentials",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#silverFoil)" stroke-width="1.2"/>`,
        qrInk: "#121316",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#38BDF8",
        inkColor: "#FFFFFF",
        mutedColor: "#A1A1AA",
      };

    case "menu-order":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="menuRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#451A03"/>` +
          `<stop offset="70%" stop-color="#240D04"/>` +
          `<stop offset="100%" stop-color="#140602"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#menuRadial)",
        frontInnerBezel: "url(#amberFoil)",
        frontMedallion: bistroMedallion(30, 27.5, "#F59E0B"),
        frontEyebrow: "TABLESIDE DINE-IN MENU",
        frontDefaultHeadline: "Tap to explore live photos, allergens & place order",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#amberFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="1.8" font-weight="700" letter-spacing="1.2" fill="#F59E0B">ORDER & PAY AT TABLE</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#F59E0B", "#FFFBEB", "#3A190C", "#F59E0B"),
        backBgFill: "#180803",
        backInnerBezel: "url(#amberFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#amberFoil)">ORDER TABLE-SIDE</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#amberFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "View digital menu & chef specials",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#amberFoil)" stroke-width="1.2"/>`,
        qrInk: "#240E06",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#F59E0B",
        inkColor: "#FFFBEB",
        mutedColor: "#FDE68A",
      };

    case "appointment-book":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="appointRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#064E3B"/>` +
          `<stop offset="70%" stop-color="#032119"/>` +
          `<stop offset="100%" stop-color="#01130E"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#appointRadial)",
        frontInnerBezel: "url(#emeraldFoil)",
        frontMedallion: salonMedallion(30, 27.5, "#10B981"),
        frontEyebrow: "SALON & CLINIC BOOKINGS",
        frontDefaultHeadline: "Tap to schedule your next appointment in 10s",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#emeraldFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="1.8" font-weight="700" letter-spacing="1.2" fill="#10B981">INSTANT APPOINTMENTS</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#10B981", "#ECFDF5", "#08362B", "#10B981"),
        backBgFill: "#021711",
        backInnerBezel: "url(#emeraldFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#emeraldFoil)">INSTANT BOOKING</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#emeraldFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Choose stylist & reserve time slot",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#emeraldFoil)" stroke-width="1.2"/>`,
        qrInk: "#04241C",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#10B981",
        inkColor: "#ECFDF5",
        mutedColor: "#6EE7B7",
      };

    case "loyalty-rewards":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="loyaltyRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#0F382E"/>` +
          `<stop offset="70%" stop-color="#03241C"/>` +
          `<stop offset="100%" stop-color="#01120D"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#loyaltyRadial)",
        frontInnerBezel: "url(#goldFoil)",
        frontMedallion: luxuryCrownMedallion(30, 27.5, "#FBBF24"),
        frontEyebrow: "VIP REWARDS & STAMPS",
        frontDefaultHeadline: "Tap every visit to collect stamps and free drinks",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#goldFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="1.8" font-weight="700" letter-spacing="1.2" fill="#FBBF24">VIP EXCLUSIVE REWARDS</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#FBBF24", "#FFFBEB", "#063A30", "#FBBF24"),
        backBgFill: "#021712",
        backInnerBezel: "url(#goldFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#goldFoil)">VIP LOYALTY CARD</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#goldFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Collect stamps on every visit",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#goldFoil)" stroke-width="1.2"/>`,
        qrInk: "#02261E",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#FBBF24",
        inkColor: "#ECFDF5",
        mutedColor: "#A7F3D0",
      };

    case "upi-payment":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="upiRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#083D56"/>` +
          `<stop offset="70%" stop-color="#022334"/>` +
          `<stop offset="100%" stop-color="#01121C"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#upiRadial)",
        frontInnerBezel: "url(#cyanFoil)",
        frontMedallion: upiMedallion(30, 27.5, "#06B6D4"),
        frontEyebrow: "ZERO-FEE FAST SETTLEMENT",
        frontDefaultHeadline: "Scan with any UPI app to pay bill instantly",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#cyanFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="1.8" letter-spacing="1.2" fill="#06B6D4">BHIM · GPAY · PHONEPE</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#06B6D4", "#F0FDF4", "#063852", "#06B6D4"),
        backBgFill: "#011520",
        backInnerBezel: "url(#cyanFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#cyanFoil)">INSTANT UPI PAY</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#cyanFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "GPay, PhonePe, Paytm & BHIM",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#cyanFoil)" stroke-width="1.2"/>`,
        qrInk: "#03283B",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#06B6D4",
        inkColor: "#F0FDF4",
        mutedColor: "#BAE6FD",
      };

    case "event-badge":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="eventRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#1E1E54"/>` +
          `<stop offset="70%" stop-color="#0A0B22"/>` +
          `<stop offset="100%" stop-color="#040412"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#eventRadial)",
        frontInnerBezel: "url(#indigoFoil)",
        frontMedallion: eventMedallion(30, 27.5, "#818CF8"),
        frontEyebrow: "CONFERENCE ACCESS PASS",
        frontDefaultHeadline: "Official attendee pass · Tap for live summit agenda",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#indigoFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="1.8" letter-spacing="1.2" fill="#818CF8">ALL-ACCESS DELEGATE PASS</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#818CF8", "#EEF2FF", "#171A44", "#818CF8"),
        backBgFill: "#07071A",
        backInnerBezel: "url(#indigoFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#indigoFoil)">OFFICIAL BADGE</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#indigoFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Tap or scan to verify attendee credential",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#indigoFoil)" stroke-width="1.2"/>`,
        qrInk: "#0C0E28",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#818CF8",
        inkColor: "#EEF2FF",
        mutedColor: "#C7D2FE",
      };

    case "feedback-survey":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="feedbackRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#241B45"/>` +
          `<stop offset="70%" stop-color="#13132D"/>` +
          `<stop offset="100%" stop-color="#090918"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#feedbackRadial)",
        frontInnerBezel: "url(#goldFoil)",
        frontMedallion: feedbackMedallion(30, 27.5, "#FBBF24"),
        frontEyebrow: "PRIVATE GUEST FEEDBACK",
        frontDefaultHeadline: "Tell the GM directly how your visit went today",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#goldFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="1.8" font-weight="700" letter-spacing="1.2" fill="#FBBF24">DIRECT TO GENERAL MANAGER</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#FBBF24", "#EEF2FF", "#22224A", "#FBBF24"),
        backBgFill: "#0B0B1E",
        backInnerBezel: "url(#goldFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#goldFoil)">VOICE OF GUEST</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#goldFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Private rating sent directly to management",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#goldFoil)" stroke-width="1.2"/>`,
        qrInk: "#171736",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#FBBF24",
        inkColor: "#EEF2FF",
        mutedColor: "#C7D2FE",
      };

    case "custom-url":
      return {
        defs:
          `<defs>` +
          SHARED_DEFS +
          `<radialGradient id="urlRadial" cx="50%" cy="28%" r="65%">` +
          `<stop offset="0%" stop-color="#2E1045"/>` +
          `<stop offset="70%" stop-color="#0D0D12"/>` +
          `<stop offset="100%" stop-color="#060609"/>` +
          `</radialGradient>` +
          `</defs>`,
        frontBgFill: "url(#urlRadial)",
        frontInnerBezel: "url(#purpleFoil)",
        frontMedallion: urlMedallion(30, 27.5, "#A855F7"),
        frontEyebrow: "SMART DYNAMIC LINK",
        frontDefaultHeadline: "Tap with any smartphone or scan QR to visit",
        frontDecorations:
          `<line x1="18" y1="61.5" x2="42" y2="61.5" stroke="url(#purpleFoil)" stroke-width="0.4"/>` +
          `<text x="30" y="64.5" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="1.8" letter-spacing="1.2" fill="#A855F7">ANY PROTOCOL · AUTO-ROUTED</text>`,
        nfcPill: nfcContactlessPill(30, 78.5, "#A855F7", "#FAFAFA", "#1E182A", "#A855F7"),
        backBgFill: "#07070A",
        backInnerBezel: "url(#purpleFoil)",
        backHeaderBadge:
          `<text x="30" y="17.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="3.2" font-weight="800" fill="url(#purpleFoil)">SMART ROUTER</text>` +
          `<line x1="18" y1="21.5" x2="42" y2="21.5" stroke="url(#purpleFoil)" stroke-width="0.35"/>`,
        backDefaultSub: "Instant contactless redirect",
        qrFrame:
          `<rect x="${(QR_X - 2.5).toFixed(2)}" y="${(QR_Y - 2.5).toFixed(2)}" width="${(QR_BOX + 5.0).toFixed(2)}" height="${(QR_BOX + 5.0).toFixed(2)}" rx="3.5" fill="#FFFFFF" stroke="url(#purpleFoil)" stroke-width="1.2"/>`,
        qrInk: "#0F0F14",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        accentColor: "#A855F7",
        inkColor: "#FAFAFA",
        mutedColor: "#D8B4FE",
      };

    default:
      return getThemeVisualConfig("google-review");
  }
}

// ─── MASTER GENERATOR: Theme + Design + CardRef -> { front, back } ───────────

export async function generateCardSvg(
  themeId: CardThemeId,
  design: CardDesign,
  card: CardRef,
): Promise<{ front: string; back: string }> {
  const matrix = getQrMatrix(card.activation_url);
  const cardId = escapeXml(card.card_id);
  const cfg = getThemeVisualConfig(themeId);

  // Business Name: customer value or uppercase eyebrow fallback
  const rawBusiness = (design.businessName || "").trim();
  const displayBrand = escapeXml(rawBusiness || cfg.frontEyebrow);

  // Headline: customer customized headline or theme default
  const rawHeadline = (design.headline || "").trim() || cfg.frontDefaultHeadline;
  const [headline1, headline2] = wrapHeadline(rawHeadline, 26);

  // Back Subtitle
  const rawBackSub = (design.contactLine || design.backLine1 || "").trim() || cfg.backDefaultSub;

  // ─── FRONT FACE ─────────────────────────────────────────────────────────────
  const front =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" role="img" aria-label="QRslice ${themeId} card front ${cardId}">` +
    cfg.defs +
    // Outer Bleed & Card Canvas
    `<rect x="0" y="0" width="${W}" height="${H}" fill="${cfg.frontBgFill}"/>` +
    // Micro-Security Mesh Pattern Texture
    `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#securityMesh)" color="${cfg.accentColor}" opacity="0.4"/>` +
    // Ambient Specular Lighting Sheen
    `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#specularGlow)"/>` +
    // Doppelrand Concentric Outer Shell Bezel
    `<rect x="4.5" y="4.5" width="51.0" height="82.6" rx="3.0" fill="none" stroke="${cfg.frontInnerBezel}" stroke-width="0.35" opacity="0.85"/>` +
    // Doppelrand Concentric Inner Core Hairline
    `<rect x="5.8" y="5.8" width="48.4" height="80.0" rx="2.2" fill="none" stroke="${cfg.accentColor}" stroke-width="0.18" opacity="0.35"/>` +
    cornerRegistrationBrackets(4.5, 4.5, 51.0, 82.6, cfg.frontInnerBezel) +
    // Top Brand Title & Rule
    `<text x="30" y="11.2" text-anchor="middle" font-family="${cfg.fontFamily}" font-size="2.6" font-weight="800" letter-spacing="1.2" fill="${cfg.accentColor}">${displayBrand.toUpperCase()}</text>` +
    `<line x1="20" y1="13.2" x2="40" y2="13.2" stroke="${cfg.accentColor}" stroke-width="0.3" opacity="0.5"/>` +
    // Center Medallion
    cfg.frontMedallion +
    // Front Headline (Line 1 & optional Line 2)
    `<text x="30" y="48.5" text-anchor="middle" font-family="${cfg.fontFamily}" font-size="3.3" font-weight="700" fill="${cfg.inkColor}">${escapeXml(headline1)}</text>` +
    (headline2
      ? `<text x="30" y="53.2" text-anchor="middle" font-family="${cfg.fontFamily}" font-size="3.3" font-weight="700" fill="${cfg.inkColor}">${escapeXml(headline2)}</text>`
      : "") +
    // Additional theme decorations (e.g. gold stars for Google review)
    cfg.frontDecorations +
    // Haptic Contactless NFC Interaction Pill
    cfg.nfcPill +
    `</svg>`;

  // ─── BACK FACE ──────────────────────────────────────────────────────────────
  const back =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" role="img" aria-label="QRslice ${themeId} card back ${cardId}">` +
    cfg.defs +
    // Outer Bleed Canvas
    `<rect x="0" y="0" width="${W}" height="${H}" fill="${cfg.backBgFill}"/>` +
    // Magnetic / Security Foil Top Stripe
    `<rect x="4.5" y="6.8" width="51.0" height="7.8" rx="1.5" fill="url(#magStripe)"/>` +
    // Doppelrand Concentric Outer Shell Bezel
    `<rect x="4.5" y="4.5" width="51.0" height="82.6" rx="3.0" fill="none" stroke="${cfg.backInnerBezel}" stroke-width="0.35" opacity="0.85"/>` +
    // Doppelrand Concentric Inner Core Hairline
    `<rect x="5.8" y="5.8" width="48.4" height="80.0" rx="2.2" fill="none" stroke="${cfg.accentColor}" stroke-width="0.18" opacity="0.35"/>` +
    cornerRegistrationBrackets(4.5, 4.5, 51.0, 82.6, cfg.backInnerBezel) +
    // Top Header Badge
    cfg.backHeaderBadge +
    // Subtitle Prompt
    `<text x="30" y="27.0" text-anchor="middle" font-family="${cfg.fontFamily}" font-size="2.4" font-weight="600" fill="${cfg.mutedColor}">${escapeXml(rawBackSub)}</text>` +
    // QR Code Frame & High-Density Matrix
    cfg.qrFrame +
    renderQr(matrix, QR_X, QR_Y, QR_BOX, cfg.qrInk, "#FFFFFF", "qrback") +
    // Optical QR Pod Corner Reticle Ticks
    `<path d="M ${(QR_X - 1.2).toFixed(2)} ${(QR_Y + 3.0).toFixed(2)} v -4.2 h 4.2 M ${(QR_X + QR_BOX + 1.2).toFixed(2)} ${(QR_Y + 3.0).toFixed(2)} v -4.2 h -4.2 M ${(QR_X - 1.2).toFixed(2)} ${(QR_Y + QR_BOX - 3.0).toFixed(2)} v 4.2 h 4.2 M ${(QR_X + QR_BOX + 1.2).toFixed(2)} ${(QR_Y + QR_BOX - 3.0).toFixed(2)} v 4.2 h -4.2" fill="none" stroke="${cfg.accentColor}" stroke-width="0.35" opacity="0.85"/>` +
    // Micro-spec Technical Security Ribbon
    `<text x="30" y="70.8" text-anchor="middle" font-family="'JetBrains Mono', 'SF Mono', monospace" font-size="1.3" letter-spacing="0.9" fill="${cfg.mutedColor}" opacity="0.75">AUTHENTIC PHYSICAL KEY · TAMPER EVIDENT</text>` +
    `<text x="30" y="74.0" text-anchor="middle" font-family="'JetBrains Mono', 'SF Mono', monospace" font-size="1.6" letter-spacing="0.5" fill="${cfg.mutedColor}">NFC NTAG213 · ISO/IEC 14443-A</text>` +
    `<text x="30" y="78.2" text-anchor="middle" font-family="'JetBrains Mono', 'SF Mono', monospace" font-size="2.0" font-weight="700" letter-spacing="0.8" fill="${cfg.accentColor}">${cardId} · Powered by QRslice</text>` +
    `</svg>`;

  return { front, back };
}

/** Deterministic hash helper for the preview-vs-export byte-identical test. */
export function hashSvgPair(front: string, back: string): string {
  return crypto.createHash("sha256").update(`${front}\n${back}`, "utf8").digest("hex");
}
