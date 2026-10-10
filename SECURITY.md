# QRslice — Security Guardrails

**Version 1.1 — 2026-10-10**
Applies to every agent, every prompt, every change. When in doubt, STOP and ask.

---

## 1. Secrets and environment variable hygiene

- **Never write live secret values into code or config.** Reference environment variable NAMES only:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `CLERK_SECRET_KEY`
- **Fail closed in production:** Missing configuration must throw a loud, clear 503 error (`"Payment gateway is not configured"`), never silently mock orders or fall back to test stubs.
- **Supabase Admin Client:** `createSupabaseAdmin()` strictly requires `SUPABASE_SERVICE_ROLE_KEY` and throws immediately if absent. Silent fallback to the anonymous key is strictly prohibited.
- **Claim tokens are secrets:** Generate with `crypto.randomUUID()`, hash before storage. The raw token is shown ONCE at batch creation, then never again — not in UI, logs, exports, or API responses.
- **Card IDs are identifiers, not secrets:** `QS-XXXXXXX` may appear in URLs, QR codes, and print. It identifies; the claim token/PIN authorizes.

## 2. Anti-enumeration & Route Protection

- `/a/{card_id}` is rate-limited (30 req / 60 s / IP). It returns only non-secret public metadata.
- Failed-claim attempts are counted; repeated failures lock the card for support review.
- Uniform 404 responses for nonexistent or invalid cards to prevent timing/enumeration oracles.
- `public/robots.txt` explicitly disallows search indexing on `/super/`, `/dashboard/`, and `/api/`.
- Public assets `/robots.txt` and `/sitemap.xml` are allowlisted in `src/proxy.ts` to prevent redirect loops.

## 3. Data access & Persistence

- **RLS on every table:** Owners read/write only their own `tenant_id`. Super-admin access is explicit and audited.
- **Authoritative Database Storage:** Orders (`shop_orders`, `shop_order_items`) must be persisted directly to Supabase as the single source of truth. Ephemeral in-memory order storage is banned on serverless/Workers.
- Public reads go through rate-limited server endpoints, never direct public table access from the client.
- Feedback content is private to the tenant.

## 4. Input handling & Static Prerendering

- `/activate` is a fully static route (`○ /activate`). Query parameters must be parsed client-side inside `useEffect` (`window.location.search`) to avoid dynamic server execution or worker CPU crashes under traffic spikes.
- Logo uploads: Validate MIME type and size (≤ 2 MB), store in Supabase Storage with signed URLs.
- Card IDs: Strict format validation (`QS-` + Crockford base32) on every input path.
- Google review links: Strict URL format validation; reject non-Google domains silently.

## 5. Payments & Checkout Integrity

- **Single Checkout Route:** Exactly one checkout flow exists (`/checkout`). Any duplicate checkout route bypassing payment authorization must be deleted immediately.
- **Real Razorpay Checkout:** Storefront checkout must load and trigger the real Razorpay modal. Mock order generators are banned in production.
- **Server-Side HMAC-SHA256 Verification:** `/api/shop/checkout/verify` strictly verifies payment signatures using `crypto.createHmac('sha256', secret)`.
- **Zero Bypass Paths:** Test signature bypass flags (`test_sig_`) are strictly banned and deleted from code.
- **Restaurant Guest Payments:** Guests dining in restaurants pay nothing through QRslice, ever.

## 6. Administrative Access Control

- All `/super/*` routes and API endpoints enforce server-side authentication using Clerk `auth()` and verify superadmin authorization.
- Public sign-in pages (`/sign-in`) must NEVER render 1-click administrative login or bypass cards.
- Dev superadmin mock bypass flags (`ENABLE_DEV_SUPERADMIN_MOCK`) are banned from production configs.

## 7. Platform compliance

- **Google review policy:** Feedback-first always; the Google review link is visible to every guest regardless of their rating. No gating, no selective solicitation.
- **Google brand assets:** G logo / wordmark are mockup-only until Suraj holds written permission. Ship production art with QRslice's own identity.

## 8. Operational & Release Hygiene

- Additive migrations only (no DROP/DELETE/TRUNCATE in a feature migration).
- Every new table ships with its RLS policies in the same migration.
- `console.log` of PII, secrets, or payment signatures is prohibited.
- Dependency additions need human approval (supply-chain discipline). Unused dependencies (`tesseract.js`, `jimp`) must be pruned.
- Incident rule: A suspected secret leak requires immediate key revocation in the provider dashboard, notification, and documentation.

