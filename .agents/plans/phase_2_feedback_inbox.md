# Implementation Plan — Phase 2: Feedback Inbox & Review Routing (T3)

**Version 1.0 — 2026-10-09**
**Objective:** A guest tap lands on a feedback-first screen with stars and an optional comment feeding the owner's inbox, with the restaurant's Google review link visible to every guest regardless of rating, and instant low-rating alerts for ratings ≤ 3 stars.

---

## 1. Objective
Ship the guest feedback collection pipeline, Google review routing (policy-compliant, non-gated), owner feedback inbox with filtering, low-rating alert notifications (≤ 3 stars), and reputation settings for managing Google review URLs.

---

## 2. Context & Verification
- Branch: `pivot/qr-layer`
- Pre-requisites completed: Phase 1 Card Core (`cards`, `card_batches`, `resolveCard`, `/activate`).
- What exists:
  - Canonical tenant table `restaurants` (`id`, `name`, `slug`, `google_review_url`).
  - Rate limiting utility in `src/lib/rate-limit.ts`.
  - Resolution route `/a/[cardId]`.

---

## 3. Scope
**In:**
- `supabase/migrations/20261009000002_feedback.sql`:
  - `feedback` table (`id UUID PK`, `tenant_id UUID FK`, `card_id TEXT FK`, `rating INT CHECK (1..5)`, `comment TEXT`, `status TEXT CHECK ('new', 'reviewed', 'resolved')`, `created_at TIMESTAMPTZ`).
  - Index on `tenant_id`, `created_at DESC`, `rating`.
  - RLS policies: owners can SELECT and UPDATE feedback strictly for their `tenant_id`; public can INSERT (via server API) but cannot SELECT.
- `src/lib/feedback-service.ts`:
  - `submitFeedback(tenantId, cardId, rating, comment)`: Validates rating (1..5), sanitizes comment (max 500 chars), rate limits submissions.
  - `getTenantFeedback(tenantId, filter)`: Fetches feedback items with optional rating filter and pagination.
  - `updateFeedbackStatus(feedbackId, tenantId, status)`: Marks feedback reviewed or resolved.
  - `getFeedbackStats(tenantId)`: Computes average rating, total count, unread count, and low-rating (≤ 3 stars) count.
- `src/app/a/[cardId]/FeedbackClient.tsx`:
  - Feedback-first guest UI:
    - Interactive 1–5 star selector.
    - Optional feedback comment box.
    - **Google Review link clearly displayed to EVERY guest from the start** — never hidden or gated behind a rating.
    - Instant submission with smooth confirmation state.
- `src/app/api/feedback/submit/route.ts`:
  - Rate-limited submission endpoint (10 submits / 10 minutes / IP).
  - Validates payload and saves to `feedback`.
- `src/app/dashboard/inbox/page.tsx` + `FeedbackInboxClient.tsx`:
  - Owner dashboard inbox:
    - List of feedback cards with stars, timestamp, card source ID, comment.
    - Prominent **Low-Rating Alert banner** when feedback ≤ 3 stars is unhandled.
    - Filters: All, Needs Attention (≤ 3★), Positive (4–5★), Resolved.
    - Action to mark feedback as "Resolved".
- `src/app/dashboard/settings/reputation/page.tsx`:
  - Owner Google review link management.
  - URL format validation (`https://g.page/...`, `https://maps.app.goo.gl/...`, `https://search.google.com/local/writereview...`).
  - Honest empty state (never pre-filled with sample fake URLs).

**Out (explicitly):**
- Menu builder and public `/m/[slug]` (Phase 3).
- Razorpay billing (Phase 4).
- Superadmin card designer (Phase 5).

---

## 4. Security & Compliance
- **Google Policy Compliance**: The Google review button/link is displayed directly on the screen for **every single guest**, completely independent of the star rating chosen.
- **XSS Prevention**: Comment text is strictly sanitized and escaped before database insertion and rendering.
- **Anti-Spam & Rate Limiting**: Submission rate limit (10 submits / 10 min / IP) and fingerprint protection.
- **Cross-Tenant Isolation (RLS)**: Owners can only read and mutate feedback belonging to their `tenant_id`.

---

## 5. Task Breakdown

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 2.1 | Migration `20261009000002_feedback.sql` | `feedback` table created with check constraints and strict tenant-isolated RLS |
| 2.2 | `src/lib/feedback-service.ts` | Complete feedback operations: submit, fetch, filter, stats, and status update |
| 2.3 | Guest Feedback UI & API | Star rating + comment submission; Google review link visible to 100% of guests; burst rate limiting |
| 2.4 | Owner Feedback Inbox (`/dashboard/inbox`) | Lists guest ratings; surfaces ≤3 stars alert banner; resolution toggle |
| 2.5 | Reputation Settings (`/dashboard/settings/reputation`) | Google review URL validator rejecting non-Google URLs; updates `restaurants.google_review_url` |
| 2.6 | Vitest test suite | Tests for validation, rating bounds (1..5), comment sanitization, and compliance assertions |

---

## 6. Verification Plan
- [x] `tsc` typecheck green (ES2022/DOM, zero errors)
- [x] Vitest test suite green (9 tests in `feedback-service.test.ts`, 29 tests total across project)
- [x] Compliance verified: Google review link present unconditionally for 1★, 3★, and 5★ view states
- [x] Low-rating alert (≤ 3 stars) verified with pulsating in-dashboard banner and filter
- [x] Cross-tenant RLS isolation defined in migration `20261009000002_feedback.sql`
- [x] XSS protection & 500-char comment truncation verified in tests

---

## 7. STOP Gate Status
- **Status:** Phase 2 implementation complete.
- **STOP:** Awaiting Suraj's review of the Feedback Inbox & Review Routing before proceeding to Phase 3 (View-Only Menu — T4).
