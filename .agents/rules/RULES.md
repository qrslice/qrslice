# Team Rules — QRslice

> Canonical rules live in `AGENTS.md` at the project root. This file is the
> short version for humans and agents working in `.agents/`. If the two ever
> disagree, `AGENTS.md` wins.

## The product
QRslice is the restaurant's QR layer: tap cards, feedback, reviews, digital
menus. NOT a POS. No money moves inside restaurants through QRslice.

## Non-negotiables
1. Verify before building — read `ARCHITECTURE.md` + `TASK.md`, check the
   canonical tree first.
2. One task = one shippable outcome. STOP at gates; never sail past one.
3. No commit / push / deploy / migration apply / dependency install without
   explicit human approval.
4. WhatsApp stays removed. Guests never pay through QRslice.
5. Never invent data, prices, metrics, testimonials, or promises.
6. Feedback-first copy always. No review-gating wording, ever.
7. Secrets (claim tokens, webhook keys) are hashed/env-only, never in URLs,
   QRs, logs, or responses.
8. RLS on every table; rate-limit every public resolve path.
9. `tsc` + ESLint + Vitest + `next build` green before any gate.
10. Screenshots (desktop + 390 px) for every user-facing change.

## Working agreements
- Phases gate on each other (`TASK.md`). P2 doesn't start before 50 paying outlets.
- Reversible or it doesn't ship: additive migrations, expand-before-contract.
- Preview SVG and export SVG are byte-identical — one generator, no exceptions.
- When stuck between two designs, pick the simpler one and note the tradeoff.
