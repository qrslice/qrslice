# QrSlice — Pre-Launch Changelog (2026-10-10)

This document details all security, data integrity, honesty, robustness, and visual fixes implemented for the production launch of QRslice on Cloudflare Workers (`@opennextjs/cloudflare`).

---

## 1. P0 — PAYMENTS (Razorpay Integrity & Fail-Closed Boundaries)
- **Environment Enforced**: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are strictly required from environment variables.
- **Fail-Closed Gate**: If keys are missing, the server throws a clear 503 error (`"Payment gateway is not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET."`). Mock order IDs (`order_mock_...`) have been completely deleted.
- **Real Checkout Modal**: Replaced client-side stubbing with the official Razorpay JavaScript modal checkout flow.
- **Server HMAC Verification**: `/api/shop/checkout/verify` verifies HMAC-SHA256 signatures server-side against `RAZORPAY_KEY_SECRET`.
- **Bypass Removal**: Deleted all test signature bypass logic (`test_sig_...`).

---

## 2. P0 — ORDER STORAGE (Supabase Authoritative Persistence)
- **Persistent Tables**: Migrated order creation, status lookups, and customer order history from an ephemeral in-memory array to Supabase tables (`shop_orders` and `shop_order_items`).
- **Fail-Closed Admin Client**: `src/lib/supabase/admin.ts` strictly requires `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` and throws immediately if absent. No silent fallback to the anonymous key.
- **Async Operations**: Refactored `registerShopOrder`, `markOrderPaid`, `findOrderByNumber`, and `findCustomerOrders` across all routes and background handlers to await database persistence.

---

## 3. P0 — FREE-ORDER LEAK (Eliminated Unpaid Checkout)
- **Route Deleted**: Completely deleted `src/app/shop/checkout/`, which allowed submitting orders without going through Razorpay.
- **Single Source**: Exactly one checkout route exists (`src/app/checkout/`), which requires full Razorpay order authorization and HMAC signature verification.

---

## 4. P0 — SECURITY & CREDENTIAL HYGIENE
- **Public Sign-in Sanitized**: Deleted the "Admin & demo 1-click access" card from `/sign-in` that previously exposed links to `/super`.
- **Wrangler Configuration Cleaned**: Removed hardcoded `CLERK_SECRET_KEY` and deleted the `ENABLE_DEV_SUPERADMIN_MOCK` flag from `wrangler.jsonc`. Secrets are referenced by environment variable name only.
- **Server-Side Superadmin Verification**: Confirmed that `/super` pages enforce Clerk server-side authentication (`auth()`) and admin role verification in `src/app/super/layout.tsx`.
- **Dead Route Redirects**: Replaced all remaining `/login` redirects with `/sign-in` across dashboard and superadmin pages.

---

## 5. P1 — HONESTY (Owner's Zero-Fiction Guarantee)
- **Ratings & Reviews Cleared**: Set initial product ratings to `0`, review counts to `0`, and reviews to `[]`. Product cards and product detail pages display no star ratings until real customer reviews are submitted.
- **Invented Claims Removed**: Deleted all occurrences of:
  - `"50,000+ smart units shipped"`
  - `"4.9 average rating"`
  - `"0.2s tap trigger"`
  - `"99% of smartphones"`
  - `"100,000 taps"` / `"100,000+ tap durability"`
  - `"3-day pan-India dispatch"`
- **Unregistered Business Status (0% GST)**: Removed promises of "18% GST invoice with input tax credit". Invoices, FAQs, and bulk order summaries clearly state unregistered small business entity status with 0% GST and no ITC.
- **Zero Recurring Fees**: Removed mentions of "software subscriptions" from Terms of Service. QRslice sells one-time physical hardware products with zero recurring fees.
- **Demo Order Sanitization**: Replaced real-looking individual and company names in the order tracker with explicitly fictional demo data (`Demo Merchant (Sample Order)` / `Acme Cafe Demo Pvt Ltd`).

---

## 6. P2 — ROBUSTNESS & VISUAL ENHANCEMENTS
- **Static `/activate` Route**: Removed `useSearchParams` and `<Suspense>` from `/activate`, reading query parameters client-side in `useEffect`. The route is now fully static (`○ /activate`), eliminating worker CPU spikes under load.
- **Robots & Sitemap**:
  - Allowlisted `/robots.txt` and `/sitemap.xml` as public routes in `src/proxy.ts`.
  - Excluded `.txt` and `.xml` files from Clerk auth middleware matching.
  - Created `public/robots.txt` and `public/sitemap.xml`.
- **Navigation & Catalog Heading**:
  - Fixed "Explore all SKUs" button to land on `/products`.
  - Fixed `/products` to display "All Products" when no category is selected, syncing with URL category parameters.
- **Dependency Pruning**: Removed unused dependencies `tesseract.js` and `jimp` from `package.json`.
- **Email Promise Removal**: Removed user-facing copy in shipping policy promising automated dispatch emails until an email API key is configured.
- **Visual Animation Safety**:
  - All hero content, buttons, images, and product cards are rendered visible (`opacity: 1`) by default in markup.
  - Added `window.matchMedia('(prefers-reduced-motion: reduce)')` checks to bypass entrance animations.
  - Added ~1.5s safety timeouts in `PromotionalHero` and `HardwareShowcase` that force-reveal elements if animations ever stall.
  - Added CSS overrides in `src/app/globals.css` ensuring full visibility under reduced motion.
