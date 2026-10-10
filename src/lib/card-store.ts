// Copyright (c) 2026 QRslice. All rights reserved.
import "server-only";
import crypto from "crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  buildActivationUrl,
  defaultCardDesign,
  generateCardId,
  generateCardSvg,
  generateClaimToken,
  isCardThemeId,
  type CardDesign,
  type CardThemeId,
} from "@/lib/card-artwork";

export type BatchStatus = "draft" | "exported" | "manufactured";
export type CardStatus =
  | "manufactured"
  | "in_stock"
  | "assigned"
  | "claimed"
  | "active"
  | "disabled";

export interface CardBatch {
  id: string;
  name: string;
  theme: CardThemeId;
  design_json: CardDesign;
  quantity: number;
  status: BatchStatus;
  created_at: string;
  created_by: string | null;
}

export interface ReviewCard {
  id: string;
  batch_id: string;
  card_id: string;
  claim_token_hash: string;
  activation_url: string;
  status: CardStatus;
  tenant_id: string | null;
  svg_front: string | null;
  svg_back: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedCardReveal {
  card_id: string;
  claim_token: string;
  activation_url: string;
  status: CardStatus;
}

type DbClient = ReturnType<typeof createSupabaseAdmin>;

function admin(): DbClient | null {
  try {
    return createSupabaseAdmin();
  } catch {
    return null;
  }
}

// In-memory fallback (dev + pre-migration): mirrors the two-table shape.
const memBatches = new Map<string, CardBatch>();
const memCards = new Map<string, ReviewCard>(); // keyed by card_id
const memCardsByBatch = new Map<string, string[]>(); // batch_id -> card_ids

function normalizeDesign(input: unknown, fallbackTheme: CardThemeId): CardDesign {
  const base = defaultCardDesign(fallbackTheme);
  if (!input || typeof input !== "object") return base;
  const d = input as Partial<CardDesign>;
  const theme: CardThemeId =
    typeof d.theme === "string" && isCardThemeId(d.theme) ? d.theme : fallbackTheme;
  return {
    businessName: typeof d.businessName === "string" ? d.businessName.slice(0, 80) : "",
    logoUrl:
      typeof d.logoUrl === "string" && d.logoUrl.length > 0
        ? d.logoUrl.slice(0, 2048)
        : null,
    theme,
    headline:
      typeof d.headline === "string" && d.headline.trim()
        ? d.headline.slice(0, 140)
        : base.headline,
    backTitle:
      typeof d.backTitle === "string" && d.backTitle.trim()
        ? d.backTitle.slice(0, 80)
        : base.backTitle,
    backLine1:
      typeof d.backLine1 === "string" && d.backLine1.trim()
        ? d.backLine1.slice(0, 120)
        : base.backLine1,
    backLine2:
      typeof d.backLine2 === "string" && d.backLine2.trim()
        ? d.backLine2.slice(0, 120)
        : base.backLine2,
    contactLine:
      typeof d.contactLine === "string" && d.contactLine.trim()
        ? d.contactLine.slice(0, 120)
        : base.contactLine,
  };
}

function toBatch(row: Record<string, unknown>): CardBatch {
  const themeRaw = String(row.theme ?? "premium-plum");
  const theme: CardThemeId = isCardThemeId(themeRaw) ? themeRaw : "premium-plum";
  return {
    id: String(row.id),
    name: String(row.name ?? "Untitled batch"),
    theme,
    design_json: normalizeDesign(row.design_json, theme),
    quantity: Number(row.quantity ?? 0),
    status: (row.status as BatchStatus) ?? "draft",
    created_at: String(row.created_at ?? new Date().toISOString()),
    created_by: (row.created_by as string | null) ?? null,
  };
}

function toCard(row: Record<string, unknown>): ReviewCard {
  return {
    id: String(row.id),
    batch_id: String(row.batch_id),
    card_id: String(row.card_id),
    claim_token_hash: String(row.claim_token_hash ?? ""),
    activation_url: String(row.activation_url ?? ""),
    status: (row.status as CardStatus) ?? "manufactured",
    tenant_id: (row.tenant_id as string | null) ?? null,
    svg_front: (row.svg_front as string | null) ?? null,
    svg_back: (row.svg_back as string | null) ?? null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function listBatches(search?: string): Promise<Array<CardBatch & { card_count: number }>> {
  const db = admin();
  if (db) {
    try {
      const { data, error } = await db
        .from("card_batches")
        .select("*, cards(count)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) {
        let rows = (data as Array<Record<string, unknown>>).map((r) => ({
          ...toBatch(r),
          card_count: Array.isArray(r.cards)
            ? Number((r.cards[0] as { count?: number } | undefined)?.count ?? 0)
            : 0,
        }));
        if (search?.trim()) {
          const q = search.trim().toLowerCase();
          rows = rows.filter((b) => b.name.toLowerCase().includes(q));
          // Also match batches that contain a matching card_id.
          const { data: cardHits } = await db
            .from("cards")
            .select("batch_id")
            .ilike("card_id", `%${search.trim()}%`)
            .limit(50);
          const hitIds = new Set((cardHits ?? []).map((c) => String((c as { batch_id: string }).batch_id)));
          if (hitIds.size > 0) {
            const { data: hitBatches } = await db
              .from("card_batches")
              .select("*")
              .in("id", [...hitIds]);
            for (const hb of (hitBatches ?? []) as Array<Record<string, unknown>>) {
              if (!rows.some((r) => r.id === String(hb.id))) {
                rows.push({ ...toBatch(hb), card_count: 0 });
              }
            }
          }
        }
        return rows;
      }
    } catch {
      // fall through to memory
    }
  }
  let rows = [...memBatches.values()].map((b) => ({
    ...b,
    card_count: memCardsByBatch.get(b.id)?.length ?? 0,
  }));
  rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    const hitBatchIds = new Set<string>();
    for (const c of memCards.values()) {
      if (c.card_id.toLowerCase().includes(q)) hitBatchIds.add(c.batch_id);
    }
    rows = rows.filter(
      (b) => b.name.toLowerCase().includes(q) || hitBatchIds.has(b.id),
    );
  }
  return rows;
}

export async function getBatch(batchId: string): Promise<(CardBatch & { cards: ReviewCard[] }) | null> {
  const db = admin();
  if (db) {
    try {
      const { data: batch, error } = await db
        .from("card_batches")
        .select("*")
        .eq("id", batchId)
        .maybeSingle();
      if (!error && batch) {
        const { data: cards } = await db
          .from("cards")
          .select("*")
          .eq("batch_id", batchId)
          .order("created_at", { ascending: true });
        return {
          ...toBatch(batch as Record<string, unknown>),
          cards: ((cards ?? []) as Array<Record<string, unknown>>).map(toCard),
        };
      }
    } catch {
      // fall through
    }
  }
  const batch = memBatches.get(batchId);
  if (!batch) return null;
  const ids = memCardsByBatch.get(batchId) ?? [];
  return {
    ...batch,
    cards: ids.map((cid) => memCards.get(cid)!).filter(Boolean),
  };
}

export async function createBatch(params: {
  name: string;
  theme?: CardThemeId;
  design?: Partial<CardDesign>;
  quantity?: number;
  createdBy?: string | null;
}): Promise<CardBatch> {
  const theme: CardThemeId =
    params.theme && isCardThemeId(params.theme) ? params.theme : "premium-plum";
  const design = normalizeDesign({ ...(params.design ?? {}), theme }, theme);
  const quantity = Math.min(500, Math.max(1, Math.floor(params.quantity ?? 25)));
  const row = {
    id: crypto.randomUUID(),
    name: params.name.trim().slice(0, 120) || "Untitled batch",
    theme,
    design_json: design,
    quantity,
    status: "draft" as BatchStatus,
    created_at: new Date().toISOString(),
    created_by: params.createdBy ?? null,
  };
  const db = admin();
  if (db) {
    try {
      const { data, error } = await db.from("card_batches").insert(row).select("*").single();
      if (!error && data) return toBatch(data as Record<string, unknown>);
    } catch {
      // fall through
    }
  }
  memBatches.set(row.id, row);
  memCardsByBatch.set(row.id, []);
  return row;
}

export async function updateBatch(
  batchId: string,
  patch: Partial<{ name: string; theme: CardThemeId; design: Partial<CardDesign>; quantity: number; status: BatchStatus }>,
): Promise<CardBatch | null> {
  const existing = await getBatch(batchId);
  if (!existing) return null;
  const nextTheme =
    patch.theme && isCardThemeId(patch.theme) ? patch.theme : existing.theme;
  const nextDesign = patch.design
    ? normalizeDesign({ ...existing.design_json, ...patch.design, theme: nextTheme }, nextTheme)
    : normalizeDesign({ ...existing.design_json, theme: nextTheme }, nextTheme);
  const next: CardBatch = {
    ...existing,
    name:
      typeof patch.name === "string" && patch.name.trim()
        ? patch.name.trim().slice(0, 120)
        : existing.name,
    theme: nextTheme,
    design_json: nextDesign,
    quantity:
      typeof patch.quantity === "number"
        ? Math.min(500, Math.max(1, Math.floor(patch.quantity)))
        : existing.quantity,
    status: patch.status ?? existing.status,
  };
  // Allowed batch transitions: draft→exported→manufactured (disable never deletes).
  const order: BatchStatus[] = ["draft", "exported", "manufactured"];
  if (patch.status && patch.status !== existing.status) {
    const from = order.indexOf(existing.status);
    const to = order.indexOf(patch.status);
    if (to !== from + 1) {
      throw new Error(`Invalid batch transition ${existing.status} → ${patch.status}`);
    }
  }
  const db = admin();
  if (db) {
    try {
      const { data, error } = await db
        .from("card_batches")
        .update({
          name: next.name,
          theme: next.theme,
          design_json: next.design_json,
          quantity: next.quantity,
          status: next.status,
        })
        .eq("id", batchId)
        .select("*")
        .single();
      if (!error && data) return toBatch(data as Record<string, unknown>);
    } catch {
      // fall through
    }
  }
  memBatches.set(batchId, next);
  return next;
}

/** Generate N unique card rows for a batch. Raw tokens returned ONCE — never stored. */
export async function generateBatchCards(
  batchId: string,
  count: number,
  baseUrl?: string,
): Promise<{ batch: CardBatch; reveals: GeneratedCardReveal[] }> {
  const existing = await getBatch(batchId);
  if (!existing) throw new Error("Batch not found");
  const n = Math.min(500, Math.max(1, Math.floor(count)));
  if (existing.cards.length + n > 500) {
    throw new Error("Batch cap is 500 cards");
  }
  const seen = new Set(existing.cards.map((c) => c.card_id));
  for (const c of memCards.values()) seen.add(c.card_id);

  const reveals: GeneratedCardReveal[] = [];
  const rows: ReviewCard[] = [];
  let guard = 0;
  while (rows.length < n && guard < n * 50) {
    guard += 1;
    const card_id = generateCardId();
    if (seen.has(card_id)) continue;
    seen.add(card_id);
    const { token, hash } = generateClaimToken();
    const activation_url = buildActivationUrl(card_id, baseUrl);
    const now = new Date().toISOString();
    rows.push({
      id: crypto.randomUUID(),
      batch_id: batchId,
      card_id,
      claim_token_hash: hash,
      activation_url,
      status: "manufactured",
      tenant_id: null,
      svg_front: null,
      svg_back: null,
      created_at: now,
      updated_at: now,
    });
    reveals.push({ card_id, claim_token: token, activation_url, status: "manufactured" });
  }
  if (rows.length !== n) throw new Error("Could not mint unique card IDs");

  const db = admin();
  if (db) {
    try {
      const { error } = await db.from("cards").insert(
        rows.map((r) => ({
          id: r.id,
          batch_id: r.batch_id,
          card_id: r.card_id,
          claim_token_hash: r.claim_token_hash,
          activation_url: r.activation_url,
          status: r.status,
        })),
      );
      if (error) throw error;
    } catch {
      // fall back to memory below
    }
  }
  for (const r of rows) {
    memCards.set(r.card_id, r);
    const list = memCardsByBatch.get(batchId) ?? [];
    list.push(r.card_id);
    memCardsByBatch.set(batchId, list);
  }
  const refreshed = (await getBatch(batchId))!;
  return { batch: refreshed, reveals };
}

/** Export: freeze SVG strings for every card, flip batch draft→exported. */
export async function exportBatch(batchId: string): Promise<{
  batch: CardBatch;
  files: Array<{ name: string; svg: string }>;
  manifestCsv: string;
}> {
  const existing = await getBatch(batchId);
  if (!existing) throw new Error("Batch not found");
  if (existing.cards.length === 0) throw new Error("Generate cards before export");

  const { buildBatchManifestCsv } = await import("@/lib/card-zip");
  const files: Array<{ name: string; svg: string }> = [];
  const design = existing.design_json;
  const theme = existing.theme;

  for (const card of existing.cards) {
    let front = card.svg_front;
    let back = card.svg_back;
    if (!front || !back) {
      const art = await generateCardSvg(theme, design, {
        card_id: card.card_id,
        activation_url: card.activation_url,
      });
      front = art.front;
      back = art.back;
    }
    files.push({ name: `${card.card_id}-front.svg`, svg: front! });
    files.push({ name: `${card.card_id}-back.svg`, svg: back! });
  }

  const manifestCsv = buildBatchManifestCsv(
    existing.cards.map((c) => ({
      card_id: c.card_id,
      activation_url: c.activation_url,
      status: c.status,
    })),
  );

  // Freeze SVG strings.
  const db = admin();
  if (db) {
    try {
      for (const card of existing.cards) {
        const pair = files.filter((f) => f.name.startsWith(card.card_id));
        const front = pair.find((f) => f.name.endsWith("-front.svg"))?.svg ?? null;
        const back = pair.find((f) => f.name.endsWith("-back.svg"))?.svg ?? null;
        await db.from("cards").update({ svg_front: front, svg_back: back }).eq("id", card.id);
      }
      if (existing.status === "draft") {
        await db.from("card_batches").update({ status: "exported" }).eq("id", batchId);
      }
    } catch {
      // memory fallback below
    }
  }
  for (const card of existing.cards) {
    const mem = memCards.get(card.card_id);
    if (mem) {
      const front = files.find((f) => f.name === `${card.card_id}-front.svg`)?.svg ?? mem.svg_front;
      const back = files.find((f) => f.name === `${card.card_id}-back.svg`)?.svg ?? mem.svg_back;
      memCards.set(card.card_id, { ...mem, svg_front: front, svg_back: back, updated_at: new Date().toISOString() });
    }
  }
  if (existing.status === "draft") {
    const memBatch = memBatches.get(batchId);
    if (memBatch) memBatches.set(batchId, { ...memBatch, status: "exported" });
  }
  const refreshed = (await getBatch(batchId))!;
  return { batch: refreshed, files, manifestCsv };
}

/** Mark manufactured: batch exported→manufactured, cards manufactured→in_stock. */
export async function markBatchManufactured(batchId: string): Promise<CardBatch> {
  const existing = await getBatch(batchId);
  if (!existing) throw new Error("Batch not found");
  const db = admin();
  if (db) {
    try {
      await db.from("cards").update({ status: "in_stock" }).eq("batch_id", batchId).eq("status", "manufactured");
      const { data } = await db
        .from("card_batches")
        .update({ status: "manufactured" })
        .eq("id", batchId)
        .select("*")
        .single();
      if (data) return toBatch(data as Record<string, unknown>);
    } catch {
      // fallback
    }
  }
  for (const card of existing.cards) {
    const mem = memCards.get(card.card_id);
    if (mem && mem.status === "manufactured") {
      memCards.set(card.card_id, { ...mem, status: "in_stock", updated_at: new Date().toISOString() });
    }
  }
  return (await updateBatch(batchId, { status: "manufactured" }))!;
}

/** Disable: all cards in batch → disabled. No deletes. */
export async function disableBatch(batchId: string): Promise<CardBatch & { cards: ReviewCard[] }> {
  const existing = await getBatch(batchId);
  if (!existing) throw new Error("Batch not found");
  const db = admin();
  if (db) {
    try {
      await db.from("cards").update({ status: "disabled" }).eq("batch_id", batchId).neq("status", "disabled");
    } catch {
      // fallback
    }
  }
  for (const card of existing.cards) {
    const mem = memCards.get(card.card_id);
    if (mem && mem.status !== "disabled") {
      memCards.set(card.card_id, { ...mem, status: "disabled", updated_at: new Date().toISOString() });
    }
  }
  return (await getBatch(batchId))!;
}

/** Pre-route and register an allocated card for an ecommerce order. */
export async function registerAllocatedCard(params: {
  cardId: string;
  claimTokenHash: string;
  preRoutedUrl: string;
  status: CardStatus;
  businessName: string;
  finish: string;
  orderNumber: string;
}): Promise<void> {
  const db = admin();
  const activationUrl = buildActivationUrl(params.cardId);

  if (db) {
    try {
      await db.from("cards").insert({
        card_id: params.cardId,
        claim_pin_hash: params.claimTokenHash,
        activation_url: activationUrl,
        status: params.status,
        destination_url: params.preRoutedUrl,
        purpose: "custom_url",
      });
    } catch {
      // Memory fallback below
    }
  }

  memCards.set(params.cardId, {
    id: `mem-${params.cardId}`,
    batch_id: "ecom-batch",
    card_id: params.cardId,
    claim_token_hash: params.claimTokenHash,
    activation_url: activationUrl,
    status: params.status,
    tenant_id: null,
    svg_front: null,
    svg_back: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

