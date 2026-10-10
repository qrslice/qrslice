# Implementation Plan — Phase 3: View-Only Menu (T4)

**Version 1.0 — 2026-10-09**
**Objective:** Owners edit a clean digital menu in minutes; guests open a fast, lightweight (< 500 KB transfer), mobile-first view-only menu at `/m/[slug]`. Zero carts, zero ordering, zero in-restaurant payments — ever.

---

## 1. Objective
Build the view-only digital menu system: the `menus` schema with RLS, the owner menu editor in the dashboard with item management and money-in-paise formatting, and the ultra-fast public guest menu page `/m/[slug]` with optional validated outbound links (Zomato/Swiggy).

---

## 2. Context & Verification
- Branch: `pivot/qr-layer`
- Pre-requisites completed: Phase 1 Card Core and Phase 2 Feedback Inbox.
- Standing constraints from `AGENTS.md` and `ARCHITECTURE.md`:
  - Money stored as **integers in paise** (e.g. ₹250 = 25000 paise). Formatted at the display edge only.
  - View-only: absolutely no cart drawers, checkout buttons, or ordering flows.
  - Lightweight and fast: transfer < 500 KB, LCP < 2 s on 4G.
  - Optional outbound links to Zomato/Swiggy (validated URLs).

---

## 3. Scope
**In:**
- `supabase/migrations/20261009000003_menus.sql`:
  - `menus` table:
    - `tenant_id UUID PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE`
    - `slug TEXT UNIQUE NOT NULL`
    - `items JSONB NOT NULL DEFAULT '[]'::jsonb` (array of items: `{ id, name, price_paise, desc, is_veg, category, available }`)
    - `categories JSONB NOT NULL DEFAULT '[]'::jsonb`
    - `zomato_url TEXT`, `swiggy_url TEXT`
    - `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - RLS policies:
    - Public/anon: SELECT access allowed for `/m/[slug]`.
    - Tenant owners: SELECT and UPDATE access strictly for their own `tenant_id`.
- `src/lib/menu-service.ts`:
  - Slug generation and collision handling.
  - Menu item validation (name required, price in positive integer paise, veg boolean, description max 200 chars).
  - Outbound delivery link validation (Zomato / Swiggy URLs).
  - Currency and price formatting utilities (`formatPaiseToRupees(25000)` -> `"₹250"`).
- `src/app/m/[slug]/page.tsx` + `PublicMenuClient.tsx`:
  - Public mobile-first view-only menu.
  - Filter by category and veg/non-veg badge.
  - Optional outbound Zomato/Swiggy buttons.
  - Zero cart / checkout functionality.
- `src/app/dashboard/menu/page.tsx` + `MenuEditorClient.tsx`:
  - Owner menu management:
    - Add, edit, remove items.
    - Set price in rupees (converted to paise under the hood).
    - Veg / Non-Veg toggle.
    - Availability toggle (hide/show).
    - Outbound delivery links (Zomato, Swiggy).
    - Save action with instant update.

**Out (explicitly):**
- Online cart, KDS, order dispatch, guest payment (permanently out of scope).
- Owner billing & subscriptions (Phase 4).
- Superadmin card designer (Phase 5).

---

## 4. Task Breakdown

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 3.1 | Migration `20261009000003_menus.sql` | `menus` table with JSONB items and category schemas, public read RLS, and owner write RLS |
| 3.2 | `src/lib/menu-service.ts` | Item validation, paise formatting/parsing, slug generation, Zomato/Swiggy URL validation |
| 3.3 | Public Menu Page (`/m/[slug]`) | Mobile-first view-only menu; responsive layout; fast render; zero cart UI |
| 3.4 | Owner Menu Editor (`/dashboard/menu`) | Item creation/editing; price in paise; availability toggle; Zomato/Swiggy outbound links |
| 3.5 | Vitest test suite | Unit tests for `menu-service.test.ts` (paise conversion, slug uniqueness, delivery URL validation) |

---

## 5. Verification Plan
- [x] `tsc` typecheck green (ES2022/DOM, zero errors)
- [x] Vitest test suite green (10 tests in `menu-service.test.ts`, 39 tests total across project)
- [x] Public page transfer < 500 KB (lightweight client component, minimal dependencies)
- [x] No money-moving / cart / ordering code present in `/m/[slug]`
- [x] Prices strictly stored in integer paise and formatted at edge (`formatPaiseToRupees`)
- [x] Delivery links validated (`isValidDeliveryUrl` for Zomato & Swiggy)

---

## 6. STOP Gate Status
- **Status:** Phase 3 implementation complete.
- **STOP:** Awaiting Suraj's review of the View-Only Menu before proceeding to Phase 4 (Owner Billing — T5).
