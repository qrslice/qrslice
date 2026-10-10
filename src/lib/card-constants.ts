// Copyright (c) 2026 QRslice. All rights reserved.

export const CARD_THEME_IDS = [
  "google-review",
  "premium-plum",
  "minimal-mono",
  "instagram-follow",
  "wifi-connect",
  "digital-bizcard",
  "menu-order",
  "appointment-book",
  "loyalty-rewards",
  "upi-payment",
  "event-badge",
  "feedback-survey",
  "custom-url",
] as const;

export type CardThemeId = (typeof CARD_THEME_IDS)[number];

export const PRINT_SPEC_TEXT = `CR80 (53.98 × 85.60 mm Portrait) with 3.18 mm corner radius.
Artwork canvas 60.00 × 91.60 mm (includes 3.00 mm bleed on all 4 edges).
NXP NTAG213 embedded NFC inlay with ISO/IEC 14443 Type A contactless interface.
Back QR: 30 mm EC-H on high-contrast white patch with 4-module quiet zone.`;
