# Implementation Plan — Phase 1: Card Core (Resolve + Claim)

**Version 1.0 — 2026-10-09**
**Objective:** A physical card tap/scan/type resolves to the right page, and an owner can claim an unclaimed card exactly once using the sealed one-time claim PIN.

---

## 1. Objective
Ship the foundational Card Core: database schema (`card_batches`, `cards`), Card ID generation (`QS-` + 7 Crockford base32), claim PIN generation/hashing, public rate-limited resolver (`GET /a/[cardId]`), and the owner claim flow (`/activate`).

---

## 2. Context & Verification
- Branch: `pivot/qr-layer` (cut from clean base commit `c9bcaf4`).
- `git status` canonical tree: `release/production-hardening` parked safely.
- What already exists:
  - Public resolve pattern in `src/app/api/public/resolve-table/route.ts`.
  - Rate limiting helper `src/lib/rate-limit.ts`.
  - Hashing / crypto utilities in `src/lib/crypto.ts` & `src/lib/auth.ts`.
  - Tenant resolution pattern in `src/lib/tenant.ts` (references `restaurants` table).
- What was checked before writing this plan:
  - Verified `restaurants` table is canonical tenant table (PK: `id UUID`).
  - Verified `card_batches` and `cards` schema with RLS and unique indexes.
  - Sourcing quote benchmarks confirmed ₹35/card economics.

---

## 3. Scope
**In:**
- `supabase/migrations/20261009000001_card_core.sql`:
  - `card_batches` table with status (`draft`, `exported`, `manufactured`).
  - `cards` table with status (`manufactured`, `in_stock`, `assigned`, `claimed`, `active`, `disabled`), `card_id`, `claim_pin_hash`, `activation_url`, `tenant_id`, `purpose`.
  - RLS policies on both tables (superadmin full access; owner reads own tenant; no direct public access).
- `src/lib/card-ids.ts`:
  - Crockford base32 generator (characters: `0123456789ABCDEFGHJKMNPQRSTVWXYZ`, excluding `I`, `L`, `O`, `U`).
  - Generates `QS-` + 7 characters.
  - Validation regex and helper `isValidCardId(id: string)`.
- `src/lib/claim-tokens.ts`:
  - Generation of random 6-character alphanumeric claim PIN.
  - SHA-256 / HMAC hashing functions for PIN verification.
  - Verification helper `verifyClaimPin(rawPin: string, storedHash: string): boolean`.
- `src/app/a/[cardId]/page.tsx` + `src/app/api/a/[cardId]/route.ts`:
  - Rate-limited server resolve: 30 requests / 60 seconds / IP.
  - Returns only public, non-secret metadata (never `claim_pin_hash`).
  - If card is unknown or invalid: returns friendly uniform "Card Not Found" page (no enumeration oracle).
  - If card is unclaimed (`manufactured`, `in_stock`, `assigned`): renders friendly "Card not activated yet" with link to `/activate`.
  - If card is active: redirects/renders configured destination (menu `/m/[slug]`, reputation, or profile).
- `src/app/activate/page.tsx` + `src/app/api/activate/route.ts`:
  - Accepts typed `cardId` and scratch-off `claimPin`.
  - Owner authentication required (redirects to login with return URL if unauthenticated).
  - Single-use verification of claim PIN against `claim_pin_hash`.
  - Binds card to owner's `restaurant_id` (`tenant_id`).
  - Transition status: `assigned` / `claimed` → `active`.
  - Sets destination purpose (`menu`, `reputation`, `profile`).

**Out (explicitly):**
- Guest feedback submission and inbox (Phase 2).
- View-only menu viewer `/m/[slug]` and menu builder (Phase 3).
- Razorpay billing & subscription trial engine (Phase 4).
- Superadmin card designer UI (Phase 5).

---

## 4. Design
### 4.1 Schema
```sql
CREATE TABLE IF NOT EXISTS public.card_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'premium-plum'
    CHECK (theme IN ('premium-plum', 'google-review', 'minimal-mono')),
  design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0 AND quantity <= 500),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'exported', 'manufactured')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.card_batches(id) ON DELETE RESTRICT,
  card_id TEXT NOT NULL,
  claim_pin_hash TEXT NOT NULL,
  activation_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'manufactured'
    CHECK (status IN ('manufactured', 'in_stock', 'assigned', 'claimed', 'active', 'disabled')),
  tenant_id UUID REFERENCES public.restaurants(id),
  purpose TEXT DEFAULT 'reputation' CHECK (purpose IN ('menu', 'reputation', 'profile')),
  svg_front TEXT,
  svg_back TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cards_card_id ON public.cards(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_tenant_id ON public.cards(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
```

### 4.2 Security & Anti-Enumeration
- Public API `/api/a/[cardId]` strictly throttled via `rateLimit(ip, 30, 60)`.
- Constant-time comparison for PIN hash verification.
- Uniform timing and HTTP 404 response payload for both non-existent card IDs and malformed IDs to prevent enumeration.

---

## 5. Task Breakdown

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 1.1 | Create migration `supabase/migrations/20261009000001_card_core.sql` | Migration SQL is additive, idempotent (`IF NOT EXISTS`), includes complete RLS policies for superadmin and tenant owners |
| 1.2 | Implement `src/lib/card-ids.ts` | 7-char Crockford base32 generator; regex validator; test asserting 10,000 unique IDs without collision or illegal characters (`0`, `O`, `1`, `I`, `L`) |
| 1.3 | Implement `src/lib/claim-tokens.ts` | PIN generation + SHA-256 hashing; constant-time verification; unit tests verifying raw PINs never match corrupted inputs |
| 1.4 | Implement Card Resolver `GET /a/[cardId]` & API | Server-side resolve with 30 req/60s rate limit; returns non-secret metadata; unclaimed card renders friendly "not set up yet" page; active card routes to destination |
| 1.5 | Implement Claim Flow `/activate` | Page accepts `cardId` + `claimPin`; validates owner session; single-use PIN verification; updates card to `active` with selected destination; double-claim rejected |
| 1.6 | Unit & Integration Tests | Vitest suite for `card-ids.test.ts`, `claim-tokens.test.ts`, and resolve/claim route logic |

---

## 6. Verification Plan
- [x] `tsc` typecheck green (ES2022/DOM, zero errors)
- [x] Vitest test suite green:
  - `card-ids.test.ts`: 6 tests passing (10k generation, zero collisions, character exclusions)
  - `claim-tokens.test.ts`: 6 tests passing (6-digit PIN, SHA-256 hash, timing-safe equality)
  - `card-service.test.ts`: 8 tests passing (resolve states, uniform 404, valid claim, invalid PIN, double claim prevention)
- [x] RLS policies defined in `20261009000001_card_core.sql` for superadmin, tenant owner, and public isolation
- [x] Anti-enumeration verified (uniform 404 response payload)
- [x] Claim flow atomic update with concurrency protection

---

## 7. STOP Gate Status
- **Status:** Phase 1 implementation complete.
- **STOP:** Awaiting Suraj's review of the resolve and claim flow before proceeding to Phase 2 (Feedback Inbox + Review Routing).
