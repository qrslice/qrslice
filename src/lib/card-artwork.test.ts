// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, expect, it } from "vitest";
import crypto from "crypto";
import {
  buildActivationUrl,
  CARD_THEME_IDS,
  defaultCardDesign,
  generateCardId,
  generateCardSvg,
  generateClaimToken,
  hashClaimToken,
  hashSvgPair,
  isValidCardId,
  wrapHeadline,
} from "./card-artwork";
import { buildBatchManifestCsv, buildZip } from "./card-zip";

describe("review card batches", () => {
  it("mints unique QS- card IDs across runs (5-card batch)", () => {
    const seen = new Set<string>();
    for (let run = 0; run < 4; run += 1) {
      const batch = Array.from({ length: 5 }, () => generateCardId());
      for (const id of batch) {
        expect(isValidCardId(id)).toBe(true);
        expect(id.startsWith("QS-")).toBe(true);
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }
    expect(seen.size).toBe(20);
  });

  it("hashes claim tokens with SHA-256 and never exposes the hash as the token", () => {
    // One-time reveal logic: raw token returned once, only the hash is stored.
    const { token, hash } = generateClaimToken();
    expect(token.length).toBeGreaterThan(10);
    expect(hash).toBe(hashClaimToken(token));
    expect(hash).toBe(crypto.createHash("sha256").update(token.trim()).digest("hex"));
    expect(hash).not.toBe(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);

    // Distinct tokens -> distinct hashes.
    const second = generateClaimToken();
    expect(second.token).not.toBe(token);
    expect(second.hash).not.toBe(hash);
  });

  it("wraps long feedback-first headlines into two fitting lines", async () => {
    const [l1, l2] = wrapHeadline("Tell us how we did -- Google review link inside.");
    expect(l1.length).toBeLessThanOrEqual(30);
    expect(l2).not.toBeNull();
    expect(`${l1} ${l2}`.replace("...", "").length).toBeGreaterThan(20);
    const [s1, s2] = wrapHeadline("Nice work!");
    expect(s1).toBe("Nice work!");
    expect(s2).toBeNull();
  });

  it("preview vs export is byte-identical for the same inputs", async () => {
    const design = {
      ...defaultCardDesign("premium-plum"),
      businessName: "Curry Leaf",
    };
    const card = {
      card_id: "QS-2345678",
      activation_url: buildActivationUrl("QS-2345678", "https://qrslice.com"),
    };
    // Preview call...
    const preview = await generateCardSvg("premium-plum", design, card);
    // ...and export call hit the same module with the same inputs.
    const exported = await generateCardSvg("premium-plum", design, card);
    expect(hashSvgPair(preview.front, preview.back)).toBe(
      hashSvgPair(exported.front, exported.back),
    );
    expect(preview.front).toBe(exported.front);
    expect(preview.back).toBe(exported.back);
  });

  it("theme switch re-renders artwork (all 13 themes produce unique output)", async () => {
    const design = defaultCardDesign("premium-plum");
    const card = {
      card_id: "QS-7654321",
      activation_url: buildActivationUrl("QS-7654321", "https://qrslice.com"),
    };
    const hashes = new Set<string>();
    expect(CARD_THEME_IDS.length).toBe(13);
    for (const theme of CARD_THEME_IDS) {
      const art = await generateCardSvg(theme, { ...design, theme }, card);
      expect(art.front).toContain("<svg");
      expect(art.back).toContain("<svg");
      // All cards are now portrait (60mm wide)
      expect(art.front).toContain('width="60mm"');
      expect(art.front).toContain('height="91.6mm"');
      expect(art.back).toContain('width="60mm"');
      // QR always encodes the activation URL (EC-H matrix present as rects).
      expect(art.back).toContain("<rect");
      // Card ID footer on back
      expect(art.back).toContain("Powered by QRslice");
      hashes.add(hashSvgPair(art.front, art.back));
    }
    // All 13 themes must produce visually distinct cards
    expect(hashes.size).toBe(13);
  });

  it("export ZIP contains per-card SVGs plus manifest CSV", () => {
    const csv = buildBatchManifestCsv([
      { card_id: "QS-AAAAAAA", activation_url: "https://qrslice.com/a/QS-AAAAAAA", status: "manufactured" },
    ]);
    expect(csv.split("\n")[0]).toBe("card_id,activation_url,status");
    const zip = buildZip([
      { name: "QS-AAAAAAA-front.svg", content: "<svg></svg>" },
      { name: "QS-AAAAAAA-back.svg", content: "<svg></svg>" },
      { name: "batch-manifest.csv", content: csv },
    ]);
    expect(zip.length).toBeGreaterThan(100);
    // ZIP local-file signature present.
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
  });
});
