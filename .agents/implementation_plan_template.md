# Implementation Plan Template

> Copy this file for each new unit of work. One plan = one shippable outcome.
> Fill every section; delete nothing.

## 1. Objective
_One sentence: what ships when this is done._

## 2. Context & verification
- Branch: _
- `git status` totals: _
- What already exists in the canonical tree: _
- What I checked before writing this plan: _

## 3. Scope
**In:**
-
**Out (explicitly):**
-

## 4. Design
_Routes, components, data model changes. Reference `ARCHITECTURE.md` sections._

## 5. Security considerations
_Tokens, RLS, rate limits, validation. Reference `SECURITY.md` items._

## 6. Task breakdown
| # | Task | Acceptance |
|---|------|------------|
| 1 | | |
| 2 | | |

## 7. Verification plan
- [ ] `tsc` green
- [ ] ESLint green
- [ ] Vitest green
- [ ] `next build` green
- [ ] RLS tests (if tables touched)
- [ ] Rate-limit tests (if public routes touched)
- [ ] Screenshots: desktop + 390 px
- [ ] Physical check (if hardware/print involved): _

## 8. Gates
- Gate 1 (after verification, before code): _
- Gate 2 (after build, before human review): _
- Final: STOP — no commit/push/deploy/migrate without explicit approval.

## 9. Rollback
_How this is undone if it goes wrong. Additive migrations are not reversed by
default; code reverts to the previous release commit._

## 10. Open questions
_Anything needing Suraj's decision before or during the work._
