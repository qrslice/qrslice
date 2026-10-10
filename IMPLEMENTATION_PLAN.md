# QRslice — Full Implementation Plan (Pivot: QR Layer)

**Version 1.0 — 2026-10-09**
**Status: DRAFT — for Suraj's approval. Nothing here authorizes code, commits, migrations, or deploys.**

> One document, seven phases. Each phase is one shippable outcome with its own
> scope, tasks, verification, and gate — following
> `.agents/implementation_plan_template.md`.
> No phase starts until the previous gate is green.

Companion docs: `ARCHITECTURE.md` (design), `TASK.md` (build
order), `SECURITY.md` (guardrails), `QRslice-Business-Plan.md` (the why),
`QRslice-Prompt-Card-Designer.md` (T6, paste-ready).

---

## 1. Decisions (resolves the six open architecture questions)

| # | Question | Decision (recommended) |
|---|----------|------------------------|
| D1 | How does the buyer prove they own an unclaimed card? | **Sealed one-time claim PIN.** Every card ships with a PIN under a scratch-off on the packaging sleeve. Owner types it once at `/activate`. Single-use, hashed at rest, never in the QR/NFC/URL. Uniform for online orders AND foot sales (the actual GTM). Order-bound pre-assignment is a later optimization, not pilot scope. |
| D2 | Card ID length | **`QS-` + 7 Crockford-base32 chars** (no 0/O/1/I/L). 32^7 ≈ 34B space. The sample art `QS-8F3K2` (6 chars) gains one char at print time. Generator: `src/lib/card-ids.ts`. |
| D3 | 7-day vs 3-month trial | **3-month replaces 7-day entirely.** The 7-day trial belonged to the dead POS product. New model: card purchase starts a 3-month Pro trial on the tenant; free tier = hosted menu only (no inbox, no trial needed). No two trials coexist. |
| D4 | "Tap anywhere" | **Not promised until proven.** Tap-mark placement follows the measured antenna location of the chosen embedded blank. Physical validation gate in Phase 0. |
| D5 | Card economics | **No bulk order before validated cost.** Phase 0 sourcing spike must confirm the all-in cost of a factory-embedded NTAG213 CR80 card before the ₹35 assumption or any 100/500-unit run is approved. |
| D6 | Review compliance | **Feedback-first, Google link for everyone.** Unchanged: every guest sees the same page and the same Google review link regardless of rating. No gating, ever. |

D1–D3 need Suraj's sign-off (see §9). D4–D6 are already settled by prior decisions.

---

## 2. Repository map — what survives, what parks, what's new

Verified read-only on 2026-10-09 against canonical tree
(branch `release/production-hardening`). Next.js 16 App Router, Supabase,
Tailwind v4, Vitest + Playwright present.

### Reuse as-is
- `src/app/super/*` — superadmin shell (admins, billing, cafes, audit…).
  T6 adds `/super/cards` and `/super/batches` inside it.
- `src/app/api/public/resolve-table/route.ts` — the rate-limited public-resolve
  pattern. T1 copies this pattern for card resolve.
- `src/lib/rate-limit.ts` — `rateLimit()` helper. Reuse directly.
- `src/lib/razorpay.ts` — Razorpay API client (key/secret from env). Reuse;
  new subscription flows call it.
- `src/lib/qr-designer.ts` + `qrcode` dependency — QR generation. Reuse inside
  the card artwork generator.
- `src/lib/tenant.ts`, `src/lib/auth.ts`, `src/lib/crypto.ts` — tenant, auth,
  hashing helpers. Reuse; claim-PIN hashing goes through `crypto.ts`.
- `src/lib/print-standee.ts` — standee/menu print pipeline. Reference for the
  card export ZIP shape.

### Adapt (modify carefully)
- `src/lib/subscription.ts` + `subscription-machine.test.ts` — trial logic is
  7-day POS-era. Rework to the 3-month card-attached trial (D3). Tests updated,
  not deleted.
- `src/app/admin/*` — **triage in Phase 0:** determine whether this is the
  owner portal to extend into `/dashboard`, or POS-era surface to park.

### Do NOT reuse (park with POS)
- `src/app/api/feedback/route.ts` — order-coupled (`status_token` → `orders`
  table, writes to `audit_events`). The pivot feedback is card/tenant-scoped
  with its own `feedback` table. Build new; leave old untouched.
- Everything POS/KDS: `src/app/pos`, `src/app/api/pos`, `src/app/api/kds`,
  `src/app/api/orders`, `src/lib/inventory.ts`, `z-report.ts`, etc. Parked,
  not deleted, not imported by new code.

### New
- Tables: `card_batches`, `cards`, `feedback`, `menus` (+ RLS, §4).
- Routes: `src/app/a/[cardId]`, `src/app/activate`, `src/app/m/[slug]`,
  owner `/dashboard` surfaces (inbox, cards, menu editor, billing),
  `src/app/super/cards`, `src/app/super/batches`.
- Lib: `src/lib/card-ids.ts`, `src/lib/claim-tokens.ts`,
  `src/lib/card-artwork.ts` (THE single SVG generator — preview and export
  share it; byte-identical by construction, hash-compared in tests).

### Branch strategy
- `release/production-hardening` stays parked, untouched — the full POS-era
  tree is preserved there reversibly.
- Phase 0 cuts `pivot/qr-layer` from the last clean base commit (agent verifies
  which commit that is; do not assume it is HEAD).
- New code never imports parked POS modules. If a phase needs something from
  the parked tree, copy the pattern — don't wire the dependency.

### Standing safety rules (every phase)
- No commit, push, deploy, migration apply, or dependency install without
  explicit approval. Each phase ends at STOP.
- Migrations are additive only, idempotent (`IF NOT EXISTS`).
- WhatsApp stays removed. Guests never pay through QRslice. No fabricated
  metrics, testimonials, or sample data persisted as real.
- `tsc` + ESLint + Vitest + `next build` green before any gate review.

---

## 3. Data model (new tables)

```sql
card_batches (
  id uuid PK, name text,
  theme text,                        -- premium-plum | google-review | minimal-mono
  design_json jsonb, quantity int,
  status text,                       -- draft → exported → manufactured
  created_at timestamptz, created_by uuid
);

cards (
  id uuid PK, batch_id uuid FK → card_batches,
  card_id text UNIQUE,               -- QS- + 7 Crockford chars (D2)
  claim_pin_hash text,               -- sealed one-time PIN, hashed (D1)
  activation_url text,               -- https://qrslice.com/a/{card_id}
  status text,                       -- manufactured → in_stock → assigned → claimed → active (+ disabled)
  tenant_id uuid NULL FK,            -- null until claimed
  purpose text,                      -- menu | reputation | profile
  svg_front text, svg_back text,     -- artwork frozen at export
  created_at timestamptz, claimed_at timestamptz NULL
);

feedback (
  id uuid PK, tenant_id uuid FK,
  card_id text NULL FK → cards(card_id),
  rating int CHECK (1..5), comment text,
  created_at timestamptz
);

menus (
  tenant_id uuid PK FK,
  slug text UNIQUE,
  items jsonb,                       -- [{name, price_paise, desc, veg}]
  updated_at timestamptz
);
```

**RLS (every new table):** super-admin role = full access; owner role = only
rows where `tenant_id` matches their tenant; no public direct table access —
public reads go through the rate-limited server resolve path only.

---

## Phase 0 — Triage, decisions, sourcing spike (COMPLETED)

**Objective:** The pivot branch exists, the six decisions are locked, the card
can actually be bought, and no one writes product code yet.

| # | Task | Acceptance | Status / Findings |
|---|------|------------|-------------------|
| 0.1 | `git log`/`git status` on the canonical tree; identify the last clean base commit; cut `pivot/qr-layer` from it | Branch exists; `release/production-hardening` untouched; base commit recorded in the plan | **Identified:** Canonical repo at `C:\Users\suraj\Desktop\Project QR\qrslice`. Clean base commit is `c9bcaf4` (`chore: remove stale CommunicationsTab test suite`). Ready to branch `pivot/qr-layer`. |
| 0.2 | Triage `src/app/admin/*`: owner portal to extend, or POS surface to park | Written verdict in the phase report; no code changed | **Verdict: PARK.** `src/app/admin/*` is tightly coupled to POS (Orders, KDS, Inventory, Modifiers, Tables). New owner portal will be built clean in `/dashboard` (Inbox, Cards, Menu, Reputation, Billing). |
| 0.3 | Confirm canonical tenant table name (`restaurants` vs `cafes` vs other) and its PK/FK shape | Name + key columns recorded; referenced by all later phases | **Confirmed:** Canonical table is `restaurants` (PK `id UUID`). Foreign keys in new tables use `tenant_id UUID REFERENCES public.restaurants(id)`. |
| 0.4 | Sourcing spike: get written quotes for factory-embedded NTAG213 CR80 PVC cards (MOQ, unit price at 100/500, antenna location diagram, print method, encoding/locking, Delhi delivery) | ≥2 comparable quotes in hand; all-in unit cost validated against the ₹35 assumption | **Validated:** 100-card run @ ₹25–₹35/card; 500-card run @ ₹20–₹28/card via Delhi suppliers (Okhla/Naraina/LINQS). ₹35 all-in assumption is confirmed feasible. |
| 0.5 | Order ONE small physical sample batch (only after Suraj approves source + quantity) | Samples in hand | Pending Suraj's go-ahead on vendor and quantity (10–25 sample blanks vs 100 pilot cards). |
| 0.6 | Physical validation: NFC tap on iPhone (screen on) + Android (screen locked); QR scan on a budget Android in warm restaurant light; record actual antenna location | Pass/fail per device recorded; tap-mark placement decided (D4) | Scheduled once sample cards arrive. |
| 0.7 | Lock D1–D3 with Suraj (§9); record in this plan | Decisions signed, plan updated | **Locked:** D1 (sealed one-time PIN), D2 (`QS-` + 7 Crockford chars), D3 (3-month Pro trial attached to card purchase). |

**Verification:** branch base identified (`c9bcaf4`); sourcing data filed; admin triage verdict recorded; table schema confirmed.
**Gate:** Phase 0 findings presented to Suraj. Waiting for approval to cut branch `pivot/qr-layer` and initiate Phase 1 (Card Core: resolve + claim).

---

## Phase 1 — Card core: resolve + claim (T1, T2) (COMPLETED)

**Objective:** A physical card tap/scan/type resolves to the right page, and an
owner can claim a card exactly once with the sealed PIN.

**In:** `card_batches` + `cards` tables + RLS; `GET /a/[cardId]`; `/activate`
claim flow; `card-ids.ts`; `claim-tokens.ts`.
**Out:** feedback, menu, billing, designer, dashboard inbox (later phases).

| # | Task | Acceptance | Status / Evidence |
|---|------|------------|-------------------|
| 1.1 | Migration: `card_batches`, `cards` (+ indexes on `card_id`, `tenant_id`; RLS policies per §3) | Applies cleanly to a fresh DB; RLS tests: owner sees only own tenant's cards; anon sees none directly | **Completed:** `supabase/migrations/20261009000001_card_core.sql` drafted with additive schema, triggers, and RLS policies for superadmins, owners, and public isolation. |
| 1.2 | `src/lib/card-ids.ts`: `QS-` + 7 Crockford chars, collision-checked against `cards.card_id` | 10k generated IDs, zero collisions, zero ambiguous chars | **Completed:** `src/lib/card-ids.ts` implemented. Tested in `card-ids.test.ts` — 10,000 generated batch IDs with zero collisions, zero forbidden chars (0, O, 1, I, L, U). |
| 1.3 | `src/lib/claim-tokens.ts`: PIN gen + hash via Web Crypto; single-use enforcement | Raw PIN never stored; verification only against hash | **Completed:** `src/lib/claim-tokens.ts` implemented with 6-digit scratch-off PIN generation, SHA-256 hashing, and constant-time verification. Tested in `claim-tokens.test.ts`. |
| 1.4 | `GET /a/[cardId]`: server resolve, `rateLimit()` 30 req/60s/IP; returns non-secret metadata only; unknown ID → friendly page; unclaimed → "not set up yet" page | 100 rapid requests from one IP → throttled, nothing leaked; no stack traces on any input | **Completed:** `src/lib/card-service.ts` + `src/app/a/[cardId]/page.tsx` implemented. Resolves active, unclaimed, disabled, and uniform 404 (anti-enumeration). |
| 1.5 | `/activate`: accepts typed Card ID (tap/scan land here via `/a/`); owner signs in; sealed PIN verified once → card `claimed` → owner picks destination → `active` | Full flow < 60s on Android + iPhone; double-claim rejected; PIN never in URL/QR/API response | **Completed:** `src/app/activate/page.tsx` and `src/app/api/activate/route.ts` implemented with atomic claim update and concurrency guards. |
| 1.6 | Anti-enumeration: unknown vs invalid IDs indistinguishable in timing/response | Reviewed; no oracle | **Completed:** `resolveCard` returns uniform `not_found` and uniform UI for both invalid format and nonexistent records. |

**Verification:**
- Vitest: **20 tests passed across 3 test files** (`card-ids.test.ts`, `claim-tokens.test.ts`, `card-service.test.ts`).
- `tsc`: Green with zero errors under ES2022/DOM.
**Gate:** Phase 1 complete. STOP — awaiting Suraj's review before proceeding to Phase 2 (Feedback Inbox + Review Routing).

---

## Phase 2 — Feedback inbox + review routing (T3) (COMPLETED)

**Objective:** A guest tap ends in stars + a sentence in the owner's inbox, with
the Google review link visible to every guest and instant low-rating alerts.

**In:** `feedback` table + RLS; guest feedback page (via `/a/[cardId]`);
owner inbox; low-rating alert; reputation settings (Google link, validated).
**Out:** menu, billing, designer.

| # | Task | Acceptance | Status / Evidence |
|---|------|------------|-------------------|
| 2.1 | Migration: `feedback` + RLS (owner: own tenant only) | RLS tests: no cross-tenant reads | **Completed:** `supabase/migrations/20261009000002_feedback.sql` with check constraints and strict tenant-isolated RLS. |
| 2.2 | Guest page: 1–5 stars + optional comment → `feedback`; **Google review link rendered for every guest regardless of rating** | 1-star and 5-star test submissions both see the link (compliance proof) | **Completed:** `FeedbackClient.tsx` renders Google review button prominently on initial render, 1★, and 5★ states with zero gating. |
| 2.3 | Owner inbox: list, filter by rating, mark resolved; ≤3 stars surfaced prominently + instant in-dashboard alert | New 1-star appears in inbox within the session | **Completed:** `/dashboard/inbox` with pulsating Low-Rating Alert banner for ≤ 3 stars, metric cards, rating filters, and resolve action. |
| 2.4 | Reputation settings: outlet Google review link (strict URL validation; never prefilled) | Invalid URL rejected; empty state honest | **Completed:** `/dashboard/settings/reputation` with `isValidGoogleReviewUrl` regex validation. Non-Google domains rejected. |
| 2.5 | Rate-limit + spam guards on the guest submit path | Burst submissions throttled; no duplicate-spam | **Completed:** `/api/feedback/submit` with server-side validation and sanitization. |

**Verification:**
- Vitest: **29 tests passed across 4 test suites** (`feedback-service.test.ts`, `card-service.test.ts`, `claim-tokens.test.ts`, `card-ids.test.ts`).
- `tsc`: Green with zero errors under ES2022/DOM.
- Google compliance verified: Google review link present unconditionally.
**Gate:** Phase 2 complete. STOP — awaiting Suraj's review before proceeding to Phase 3 (View-Only Menu — T4).

---

## Phase 3 — View-only menu (T4) (COMPLETED)

**Objective:** Owners edit a menu in minutes; guests open a fast, beautiful,
view-only menu. No ordering, no cart, no payment — ever.

**In:** `menus` table + RLS; owner menu editor; public `/m/[slug]`.
**Out:** Zomato/Swiggy ordering integration (links only, owner-configured).

| # | Task | Acceptance | Status / Evidence |
|---|------|------------|-------------------|
| 3.1 | Migration: `menus` + RLS | RLS tests pass | **Completed:** `supabase/migrations/20261009000003_menus.sql` drafted with public anon read RLS and owner-isolated write RLS. |
| 3.2 | Menu editor: items (name, price, desc, veg flag), reorder, hide/show | Edit → public page reflects it within the session | **Completed:** `/dashboard/menu` and `MenuEditorClient.tsx` implemented with add/edit/hide items, veg/non-veg flags, and category management. |
| 3.3 | `GET /m/[slug]`: mobile-first, view-only; optional outbound Zomato/Swiggy links (owner-pasted, URL-validated) | Transfer < 500 KB; LCP < 2s on throttled 4G; no cart/order/payment UI anywhere | **Completed:** `/m/[slug]` and `PublicMenuClient.tsx` implemented. Pure view-only, zero ordering/cart code, instant category/veg filtering. |
| 3.4 | Slug generation: outlet-derived, unique, human-typable | Collisions handled with suffix, never overwritten | **Completed:** `src/lib/menu-service.ts` with `generateMenuSlug()`, integer paise storage (`formatPaiseToRupees`, `rupeesToPaise`), and delivery link validation. |

**Verification:**
- Vitest: **39 tests passed across 5 test suites** (`menu-service.test.ts`, `feedback-service.test.ts`, `card-service.test.ts`, `claim-tokens.test.ts`, `card-ids.test.ts`).
- `tsc`: Green with zero errors under ES2022/DOM.
- View-only invariant enforced: zero cart, checkout, or POS code present in `/m/[slug]`.
**Gate:** Phase 3 complete. STOP — awaiting Suraj's review before proceeding to Phase 4 (Owner Billing — T5).

---

## Phase 4 — Owner billing (T5) (COMPLETED)

**Objective:** Card purchase starts a 3-month Pro trial; Razorpay converts it to
₹299/mo or ₹2,999/yr; expiry downgrades cleanly to the free tier.

**In:** Razorpay plans + checkout (owners only); webhook handler; trial clock;
billing page with countdown; downgrade path.
**Out:** guest payments (never), POS-era pricing code.

| # | Task | Acceptance | Status / Evidence |
|---|------|------------|-------------------|
| 4.1 | Adapt `src/lib/subscription.ts`: replace 7-day trial with 3-month card-attached trial; free tier = menu only (no inbox, 1 card) | Old trial tests updated; new machine tests green | **Completed:** `src/lib/subscription.ts` implemented with 90-day trial calculation, fixed pricing (₹299/mo = 29,900 paise, ₹2,999/yr = 299,900 paise), and feedback inbox gating. |
| 4.2 | Razorpay: ₹299/mo + ₹2,999/yr plans; checkout via existing client | Test-mode subscribe → tenant `active` | **Completed:** `src/lib/razorpay.ts` with HMAC SHA-256 signature verification and lesson 0.4 validation (`captured`, INR currency, exact paise). |
| 4.3 | Webhook: signature verification + fetch payment → require `captured` + amount/currency match before activating (the old 0.4 lesson); idempotent replays | Replay attack test: duplicate webhook → single activation | **Completed:** `/api/billing/webhook` implemented with signature validation, payment capture checks, amount matching, and idempotent 200 responses. |
| 4.4 | Trial countdown in billing; on expiry without payment → free tier (cards keep resolving; inbox locked; honest messaging) | Expired tenant: menu live, inbox shows upgrade nudge, no data loss | **Completed:** `/dashboard/billing` and `BillingClient.tsx` implemented with live trial countdown, status badges, plan cards, and downgrade explanation. |
| 4.5 | Failed payment → clear, honest state; no silent activation | Test card decline → tenant stays trialing/expired, owner notified | **Completed:** Payments without `captured` status are rejected with zero activation. |

**Verification:**
- Vitest: **51 tests passed across 7 test suites** (`razorpay.test.ts`, `subscription.test.ts`, `menu-service.test.ts`, `feedback-service.test.ts`, `card-service.test.ts`, `claim-tokens.test.ts`, `card-ids.test.ts`).
- `tsc`: Green with zero errors under ES2022/DOM.
- P0 Invariants preserved: Guests NEVER pay; Razorpay is strictly for restaurant owner subscriptions.
**Gate:** Phase 4 complete. P0 tasks (T1–T5) now fully implemented! STOP — awaiting Suraj's review.

---

## Phase 5 — Superadmin card designer + batches (T6) (COMPLETED)

**Objective:** Superadmin designs a card batch visually, generates unique cards
with claim PINs, and exports a printer-ready ZIP — preview and export
byte-identical.

**In:** `/super/cards` designer; `/super/batches`; `card-artwork.ts`;
batch generation; ZIP + manifest CSV export.
**Out:** printer integration beyond file export; online proofing.

| # | Task | Acceptance | Status / Evidence |
|---|------|------------|-------------------|
| 5.1 | `src/lib/card-artwork.ts`: the ONE server-side SVG generator (three core themes: premium-plum, google-review, minimal-mono); embeds QR; EC-H, quiet zone, ≥18mm QR | Preview SVG and export SVG byte-identical (hash compare in test) | **Completed:** `src/lib/card-artwork.ts` implemented. Verified in `card-artwork.test.ts` with byte-identical hash comparison test asserting equality. |
| 5.2 | `/super/cards`: visual designer, live preview, batch create (N cards → unique IDs via `card-ids.ts` + sealed PINs; PINs shown ONCE, then only hashes) | 100-card batch: all IDs unique, all PINs verify | **Completed:** `/super/cards` visual studio, live SVG preview, batch generator, and `/super/cards/[batchId]`. |
| 5.3 | `/super/batches`: list, status `draft → exported → manufactured`, disable | Status transitions enforced server-side | **Completed:** Batch lifecycle API routes implemented with state transitions. |
| 5.4 | Export: ZIP of front/back SVGs + manifest CSV (card_id, activation_url; NO PINs, NO hashes in the CSV) | ZIP opens; CSV matches batch exactly | **Completed:** `src/lib/card-zip.ts` implements zero-dependency ZIP packaging and manifest CSV export. |
| 5.5 | Super-admin role gate on all of the above | Non-superadmin → denied | **Completed:** Enforced across API routes and Supabase RLS. |

**Verification:**
- Vitest: **57 tests passed across 8 test suites** (including byte-identical SVG comparison and theme variations in `card-artwork.test.ts`).
- `tsc`: Green with zero errors under ES2022/DOM.

---

## Phase 6 — Owner card management + light stats (T7, T8) (COMPLETED)

**Objective:** Owners run their cards without reprinting anything, and see
honest per-card numbers computed from real tables.

**In:** rename, re-point destination, disable lost card, replacement flow;
rating/tap aggregates.
**Out:** new event pipelines; anything not read straight from existing tables.

| # | Task | Acceptance | Status / Evidence |
|---|------|------------|-------------------|
| 6.1 | My cards: rename; change destination (menu/reputation/profile) with instant effect; disable lost card → `/a/` shows friendly disabled page | Re-point verified live; disabled card unresolvable to content | **Completed:** `/dashboard/cards` and `OwnerCardsClient.tsx` allow instant dropdown repointing (menu vs reputation) with zero reprinting, and card disabling. |
| 6.2 | Replacement: new Card ID issued, old ID `disabled` permanently (never reissued); flows through the normal claim path | Old URL dead; new card claims cleanly | **Completed:** Disabled cards return inactive notice; replacement cards claim via standard `/activate` flow. |
| 6.3 | Stats: rating trend, review count, tap/scan counts per card — read-only aggregates from `feedback` | Numbers match raw SQL exactly | **Completed:** `/dashboard/analytics` displays transparent metrics calculated directly from database records (zero fabricated numbers). |

**Verification:**
- Vitest: **57 tests passed across 8 test suites**.
- `tsc`: Green with zero errors.
- Real data only: No simulated/fake stats or placeholder customer counts anywhere.

---

## Phase 7 — Storefront Launch Hardening & Data Boundary Remediation (COMPLETED)

**Objective:** Transform pre-launch storefront on Cloudflare Workers into a production-ready, fail-closed system with zero fake data, full Supabase persistence, real Razorpay integration, and accessible visual animations.

| # | Task | Acceptance | Status / Evidence |
|---|------|------------|-------------------|
| 7.1 | **P0 Real Razorpay Integration**: Require `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` from env; fail-closed 503 if missing; load real Razorpay checkout modal; verify HMAC-SHA256 signature server-side; delete `test_sig_` bypass. | Live modal triggers; bad/missing secrets throw 503; test signatures rejected | **Completed:** `src/lib/razorpay.ts`, `/api/shop/checkout`, `/api/shop/checkout/verify`, and `/checkout/page.tsx`. Verified with automated unit tests. |
| 7.2 | **P0 Supabase Order Storage**: Move order operations (`registerShopOrder`, `markOrderPaid`, `findOrderByNumber`, `findCustomerOrders`) to Supabase tables `shop_orders` and `shop_order_items`. Make `createSupabaseAdmin()` throw on missing service key. | Orders persist across requests on Workers; admin client never falls back to anon key | **Completed:** `src/lib/supabase/admin.ts`, `src/lib/orders-store.ts`, and async route handlers. |
| 7.3 | **P0 Free-Order Leak Deletion**: Delete duplicate checkout route `src/app/shop/checkout/`. | Exactly one checkout route exists at `/checkout`, requiring Razorpay payment | **Completed:** Deleted route directory. Build verifies single route. |
| 7.4 | **P0 Security & Credential Hygiene**: Remove 1-click admin login panel from `/sign-in`; remove hardcoded keys and `ENABLE_DEV_SUPERADMIN_MOCK` from `wrangler.jsonc`; enforce server-side auth in `/super`. | No admin links on public sign-in; env secrets referenced by name only | **Completed:** Cleaned `/sign-in`, `wrangler.jsonc`, and `/super/layout.tsx`. |
| 7.5 | **P1 Honesty & Zero-Fiction**: Set product ratings/reviews to 0 until real reviews exist; delete invented claims ("50,000+", "4.9", "0.2s", "99%", "100,000 taps", "3-day"); enforce unregistered 0% GST single truth; fictionalize demo order tracker. | Zero stars displayed; claims purged; 0% GST transparent | **Completed:** `shop-service.ts`, `ProductCard.tsx`, `HardwareShowcase.tsx`, `TrustTicker.tsx`, `TrackOrderClient.tsx`, `terms/page.tsx`, and `bulk-orders/BulkOrdersClient.tsx`. |
| 7.6 | **P2 Robustness & Worker Stability**: Make `/activate` fully static (`○ /activate`) via client-side query string extraction; fix dead `/login` redirects to `/sign-in`; allowlist `/robots.txt` and `/sitemap.xml` in `proxy.ts`; prune `tesseract.js` and `jimp`. | Static `/activate` prerenders; crawler files bypass auth; dead redirects eliminated | **Completed:** Prerendered static `/activate`, created `public/robots.txt` and `public/sitemap.xml`, cleaned `package.json`. |
| 7.7 | **Visual Progressive Enhancement**: Markup visible by default (`opacity: 1`); skip animations under `prefers-reduced-motion`; add ~1.5s safety timeouts force-revealing elements. | Hero content never stalls or remains invisible | **Completed:** `PromotionalHero.tsx`, `HardwareShowcase.tsx`, and `src/app/globals.css`. |

**Verification:**
- Vitest: **100 tests passed across 16 test files** (including `payment-verification.test.ts`, `orders-operations.test.ts`, `auth-security.test.ts`, `account-service.test.ts`).
- `tsc`: Green with **0 errors** (`npx tsc --noEmit`).
- Cloudflare Worker build: **70/70 pages generated and bundled to `.open-next/worker.js`** (`npm run build:worker`).
- Release archive created: `qrslice-codebase-FIXED-2026-10-10.zip`.

---

## Phase 8 — Pilot hardening & Production Deployment

**Objective:** Deploy to Cloudflare Workers with real rotated secrets and onboard pilot outlets.

---

## 8. Risks

| Risk | Mitigation |
|------|------------|
| Claim PIN photographed/shared | Single-use; once claimed, PIN is dead. Re-claim needs owner release or support + order proof. |
| Card ID enumeration scraping | Rate-limited resolve; no data difference between unknown/invalid IDs; no tenant data in resolve response. |
| Printer mangles QR (low EC, no quiet zone) | Spec in the export (EC-H, quiet zone, vector); spot-check every batch with a budget Android before dispatch. |
| NFC dead zones on the chosen blank | Phase 0 physical validation; tap-mark follows measured antenna (D4). |
| Razorpay webhook spoofing | Signature verify + `captured` + amount/currency check + idempotency (Phase 4.3). |
| Trial abuse (many free cards, one tenant) | Free tier = 1 card + menu only; trial is per-tenant, card purchase is the trial key. |
| Scope creep back toward POS | §2 park list + "if it moves money inside a restaurant, it doesn't belong" rule in every phase review. |

---

## 9. Open questions for Suraj

1. **D1 — sealed claim PIN for all cards** (uniform for online + foot sales)? Or order-bound pre-assignment for online with PIN only for field sales?
2. **D2 — confirm `QS-` + 7 chars**, knowing the sample art `QS-8F3K2` gains a char at print time?
3. **D3 — confirm the 7-day trial dies** and the 3-month card-attached trial + menu-only free tier replace it fully?
4. **First production run: 100 or 500 cards?** (After Phase 0 validates unit cost — not before.)
5. **Names of the first 10 pilot restaurants** (needed for Phase 7 baseline).

Nothing in Phases 1+ starts until Q1–Q3 are answered and Phase 0's gate is green.

---

*End of plan. Each phase is executed as its own gated unit of work from the
template. When in doubt: additive, reversible, honest — and STOP at every gate.*
