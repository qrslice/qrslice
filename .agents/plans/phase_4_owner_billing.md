# Implementation Plan — Phase 4: Owner Subscription Billing (T5)

**Version 1.0 — 2026-10-09**
**Objective:** Physical card activation starts a 3-month Pro trial for the restaurant tenant; Razorpay converts owners to ₹299/mo or ₹2,999/yr subscriptions; expiry without payment downgrades cleanly to the hosted-menu-only free tier; guests never pay.

---

## 1. Objective
Implement owner-only subscription management via Razorpay, including plan pricing definitions (₹299/mo and ₹2,999/yr in integer paise), the 3-month Pro trial lifecycle, idempotent webhook verification with payment capture/amount checks, and the owner billing dashboard with trial countdown and plan status.

---

## 2. Context & Verification
- Branch: `pivot/qr-layer`
- Pre-requisites completed: Phase 1 Card Core, Phase 2 Feedback Inbox, Phase 3 View-Only Menu.
- Standing constraints from `AGENTS.md` and `SECURITY.md`:
  - **Guests NEVER pay.** Razorpay is strictly for restaurant owner subscriptions.
  - **Pricing strictly fixed**: Monthly ₹299 (29,900 paise) and Annual ₹2,999 (299,900 paise).
  - **3-Month Trial**: Starts when the first physical card is claimed. Replaces the 7-day POS trial.
  - **Free Tier**: On trial expiry without subscription, menu stays active, cards keep resolving, but feedback inbox locks with an upgrade prompt. No data loss.
  - **Webhook Guardrails**: Verify HMAC SHA256 signature → fetch payment from Razorpay API → require `status === "captured"` → require `amount === expectedPaise` and `currency === "INR"` before activation. Replays must be idempotent.

---

## 3. Scope
**In:**
- `src/lib/subscription.ts`:
  - Plans definition: `FREE` (0 paise), `PRO_MONTHLY` (29,900 paise), `PRO_ANNUAL` (299,900 paise).
  - Trial lifecycle: `startProTrial(tenantId, 90)` (sets `trial_starts_at` and `trial_ends_at = NOW() + 90 days`).
  - State machine: `getSubscriptionStatus(tenant)` returns `"trialing" | "active" | "expired" | "past_due"`.
  - Feature access check: `canAccessInbox(status)`.
- `src/lib/razorpay.ts`:
  - Razorpay client initialization from environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
  - Webhook signature verification helper `verifyRazorpayWebhookSignature(body, signature, secret)`.
  - Payment validation helper `verifyAndProcessSubscriptionPayment(...)`.
- `src/app/api/billing/create-order/route.ts`:
  - Owner creates subscription order for ₹299/mo or ₹2,999/yr.
- `src/app/api/billing/webhook/route.ts`:
  - Idempotent Razorpay webhook listener (`payment.captured`, `order.paid`).
  - Verifies signature, verifies payment status is `captured`, validates amount and currency, activates tenant plan.
- `src/app/dashboard/billing/page.tsx` + `BillingClient.tsx`:
  - Owner billing dashboard:
    - Current plan and trial countdown (e.g., "78 days remaining in your 3-month Pro trial").
    - Plan switch/subscribe cards for ₹299/mo and ₹2,999/yr.
    - Honest downgrade messaging for expired trials.

**Out (explicitly):**
- Guest payment screens or cart checkout (strictly prohibited).
- Superadmin card designer (Phase 5).

---

## 4. Task Breakdown

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 4.1 | Update `src/lib/subscription.ts` | 3-month trial engine; plan constants (₹299/mo, ₹2,999/yr); feature access gating; Vitest tests |
| 4.2 | Razorpay helper & Order API | `src/lib/razorpay.ts` + `/api/billing/create-order`; validates authenticated owner and plan amounts |
| 4.3 | Idempotent Webhook Handler | `/api/billing/webhook` with signature check, payment capture check, amount verification, and replay protection |
| 4.4 | Owner Billing Dashboard (`/dashboard/billing`) | Trial countdown timer, plan cards, Razorpay checkout integration, expired state preview |
| 4.5 | Vitest test suite | Unit tests for `subscription.test.ts` and `razorpay-webhook.test.ts` |

---

## 5. Verification Plan
- [x] `tsc` typecheck green (ES2022/DOM, zero errors)
- [x] Vitest test suite green (12 tests across `subscription.test.ts` & `razorpay.test.ts`, 51 tests total across project)
- [x] Idempotent webhook handling implemented in `/api/billing/webhook`
- [x] Tampered amount, uncaptured status, and non-INR currencies rejected by `validatePaymentForActivation`
- [x] Zero guest payment UI in codebase; Razorpay restricted solely to owner subscription tiers
- [x] 3-month trial (90 days) and fixed pricing (₹299/mo, ₹2,999/yr) verified

---

## 6. STOP Gate Status
- **Status:** Phase 4 implementation complete. All P0 tasks (T1–T5) are now shipped and verified.
- **STOP:** Awaiting Suraj's review before proceeding to Phase 5 (Superadmin Card Designer — T6).
