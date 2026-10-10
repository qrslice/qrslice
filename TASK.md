# QRslice — Task Breakdown

**Version 1.2 — 2026-10-10**
Build order for QRslice (hardware layer & hardware e-commerce storefront).

---

## P0 — Must work flawlessly before launch (COMPLETED)

### T1. Card resolve endpoint (COMPLETED)
- `GET /a/{card_id}` — server-side resolve, rate-limited (30 req / 60 s / IP).
- Returns only non-secret metadata. Never the claim token. Never another tenant's data.
- Unclaimed card → friendly "not set up yet" page. No stack traces, no error dumps.

### T2. Activation / claim flow (COMPLETED)
- `/activate` — made fully static (`○ /activate`), client-side query string extraction in `useEffect`.
- Owner signs in via Clerk (`/sign-in`). Dead `/login` redirects fixed.
- First claim binds card → tenant **once**; sealed PIN verified only here.

### T3. Feedback inbox (owner dashboard) (COMPLETED)
- Guest flow: stars (1–5) + comment → saved to `feedback`, tenant-scoped.
- Google review link visible to **every** guest regardless of rating.
- Owner inbox: list, filter by rating, mark resolved. Low-rating alert (≤3 stars).

### T4. Menu builder + public menu (COMPLETED)
- Owner editor: items with name, price, description, veg flag. Reorder, hide.
- Public `/m/{slug}`: fast, mobile-first, view-only. No cart, no ordering.

### T5. Owner subscription billing (COMPLETED)
- Razorpay: ₹299/mo and ₹2,999/yr plans, 3-month trial started by card purchase.
- Webhook signature verification; confirm `captured` + amount match before activating.

### T-SF1. Real Razorpay Storefront Checkout (COMPLETED)
- Enforce real `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from environment.
- Fails closed with 503 error when missing — zero mock orders in production.
- Client opens real Razorpay modal; server verifies HMAC-SHA256 signature in `/api/shop/checkout/verify`.
- Banned and deleted all test signature bypasses (`test_sig_`).

### T-SF2. Authoritative Supabase Order Persistence (COMPLETED)
- Migrated order creation, lookup, and mark-paid from in-memory arrays to Supabase tables (`shop_orders`, `shop_order_items`).
- Supabase admin client strictly requires `SUPABASE_SERVICE_ROLE_KEY` and throws immediately if absent (no fallback to anon key).

### T-SF3. Free-Order Leak Deletion (COMPLETED)
- Completely deleted duplicate unauthenticated checkout route (`src/app/shop/checkout/`).
- Single authoritative checkout at `/checkout` requiring Razorpay authorization.

---

## P1 — Operational scale & Honesty (COMPLETED)

### T6. Superadmin card designer & orders (COMPLETED)
- `/super/cards`: three themes, live SVG preview, batch generation, export ZIP + manifest CSV.
- `/super/orders`: manage physical hardware orders, generate packing slips and invoices.

### T7. Review stats & Honesty Guarantee (COMPLETED)
- Set product ratings to `0`, review counts to `0`, and reviews to `[]` until real reviews exist.
- Product cards and detail pages render zero stars until real customer reviews exist.
- Deleted invented claims: "50,000+ smart units shipped", "4.9 average rating", "0.2s tap trigger", "99% of smartphones", "100,000 taps", "3-day pan-India dispatch".
- Unregistered business status: 0% GST, no ITC on invoices, FAQs, and bulk orders. Zero recurring fees on hardware purchases.
- Replaced demo order person and company name with fictional demo data.

### T8. Owner card management (COMPLETED)
- Rename card, change destination (no reprint), disable lost card, order replacement.

---

## P2 — Robustness & Visual Progressive Enhancement (COMPLETED)

### T9. Middleware & Static Asset Allowlisting (COMPLETED)
- Allowlisted `/robots.txt` and `/sitemap.xml` as public in `src/proxy.ts`.
- Created `public/robots.txt` and `public/sitemap.xml`.
- Pruned unused dependencies `tesseract.js` and `jimp`.

### T10. Animation Safety Net & Accessibility (COMPLETED)
- Markup rendered visible (`opacity: 1`) by default.
- Bypassed GSAP entrance animations under `prefers-reduced-motion`.
- Added ~1.5s safety timeouts force-revealing elements if animations stall.
- Added CSS rules in `src/app/globals.css` ensuring full visibility under reduced motion.

---

## Quality & Exit Gate Verification

- `npx tsc --noEmit` **0 errors** (PASSED)
- `npx vitest run` **100/100 tests passed across 16 test files** (PASSED)
- `npm run build:worker` (`opennextjs-cloudflare build`) **70/70 pages generated, bundled to .open-next/worker.js** (PASSED)
- Pre-launch fixes log documented in `FIXES.md`
- Standalone deploy zip generated: `qrslice-codebase-FIXED-2026-10-10.zip`

