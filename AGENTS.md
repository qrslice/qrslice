# AGENTS.md — QRslice (QR layer)

> *"The restaurant's QR layer."* — tap cards, feedback, reviews, digital menus.
> Hardware-led, software-retained. This file is the law for any agent working
> this repo. Where it conflicts with older docs, this file wins.

## What this is
QRslice is NOT a POS. No billing counters, no KDS, no inventory, no settlements.
If a feature moves money inside a restaurant, it does not belong here. The old
POS/KDS code is parked on a branch — do not resurrect it without Suraj's
explicit decision.

## Stack — do not deviate without discussion
Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Clerk (Auth) · Supabase
(Postgres/Storage/RLS) · Razorpay (storefront orders & owner subscriptions) ·
Cloudflare Workers (via @opennextjs/cloudflare) · server-side QR library.

## How to work
1. **Verify first.** Read `ARCHITECTURE.md` and `TASK.md` before touching code.
   Check the canonical tree: branch, `git status`, and whether the thing you're
   about to build already exists.
2. **One prompt = one shippable outcome.** Finish it, prove it, STOP at the gate.
3. **STOP gates are real.** Never sail past a gate because "it's almost done."
4. **No commit, push, deploy, migration apply, or dependency install** without
   explicit human approval. Ever.
5. **Reversible or it doesn't ship.** Prefer additive migrations
   (expand-before-contract). Never drop/rename in the same step that needs it.

## Product rules (standing, from Suraj)
- WhatsApp is removed. Permanently. Do not reintroduce it in any form.
- Guests dining in restaurants NEVER pay through QRslice. Razorpay = hardware storefront checkout and owner subscriptions only.
- Trial is 7 days for software flows; the card-attached Pro trial is 3 months.
  Do not invent other durations.
- Never invent functionality, pricing, statuses, metrics, ratings, testimonials,
  customer counts, or operational promises. Every number on a page must be real
  or absent.
- Single GST truth: business is UNREGISTERED (0% GST, no input tax credit).
  Hardware products carry one-time pricing with zero recurring fees.
- Copy is feedback-first. Never write "give us 5 stars" or any review-gating
  wording. Google review link is always visible to every guest.
- No sample/placeholder data persisted as real. No fake defaults (the old sample
  GSTIN incident must never repeat in any form).
- Google brand assets (G logo, wordmark) are mockup-only until Suraj secures
  permission. Production designs use QRslice's own identity.

## Quality bar
- `tsc`, ESLint, Vitest, `next build`, and `build:worker` green before any gate.
- Public pages: < 500 KB transfer, LCP < 2 s on 4G.
- Preview SVG and export SVG are byte-identical (one generator:
  `src/lib/card-artwork.ts`).
- Tap works on Android-locked and iPhone-awake, first try. QR scans on a budget
  Android in restaurant light. Prove it, don't assert it.
- Screenshots for every user-facing change (desktop + 390 px).

## Conventions
- Card IDs: `QS-` + 7 chars Crockford base32 (no 0/O, 1/I/L). Unique index.
- Claim tokens: `crypto.randomUUID()`, **hashed before storage**, shown once.
- Statuses: `manufactured → in_stock → assigned → claimed → active` (+ `disabled`).
- Money in paise (integers). Display formatting at the edge only.
- RLS on every table. Owners see only their tenant. Public reads only through
  rate-limited resolve paths.

## Reference
Full system: `ARCHITECTURE.md` · Build order: `TASK.md` ·
Guardrails: `SECURITY.md` · Changelog: `FIXES.md` · Business: `QRslice-Business-Plan.md` (in your_files).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
