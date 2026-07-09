---
status: archived
backlog: —
---

# Change: combats-list-screen

## Why

With tokens locked (unit 005) and the look approved (units 003/004), the real Combats-home
surface must be restyled to match the design — the app's entry screen and the chrome around it.
This is the first of two implementation units so the styling work stays reviewable per-screen.

Unit **D** of the 5-unit design chain: A prototype → B feedback iterate → C design tokens →
**D combats-list screen** → E combat screen. Depends on unit 005 (`design-tokens`) and the
approved prototype. Styling/layout only — **no behavior/mechanics change** to any capability.

## What changes

Restyle existing components/routes to the approved template using the unit-005 tokens. Surfaces:
AppShell + per-breakpoint nav, Combats home, its modals, and the Settings/About routes (the
non-combat app surfaces).

| ID | Change |
|----|--------|
| `CLS-1` | restyle: CombatList / CombatRow / ColorTagDot / CombatRowMenu / EmptyState to template |
| `CLS-2`,`CLS-3` | restyle: CombatFormDialog ("+ Combat", create + edit) overlay to template |
| `CLS-4` | restyle: ConfirmDialog (delete) to template |
| `CLS-6` | restyle: drag-reorder affordance/handle to template (no mechanics change) |
| `PLT-2`,`PLT-3` | apply: responsive mobile + desktop layout and per-breakpoint nav (NavSidebar / AppHeader) |
| `PLT-5` | apply: WCAG-AA contrast, visible focus, ≥44px targets, no color-alone — from tokens |
| `SET-*` | restyle: Settings + About routes to template (no settings behavior change) |

## Acceptance criteria

- [ ] Combats home (populated + empty), CombatFormDialog, ConfirmDialog, the AppShell/nav, and
      the Settings + About routes render styled to the approved `specs/design/prototype.html`,
      in both mobile and desktop layouts and both dark and light themes.
- [ ] All color/spacing/type come from `src/routes/layout.css` tokens — no hard-coded colors or
      ad-hoc hex/oklch in these components.
- [ ] PLT-5 holds on these surfaces: visible focus, ≥44px touch targets, no color-alone
      (type/tag signifiers keep their label/icon pairing).
- [ ] No behavior/mechanics change — CLS-1..7 and SET behavior verify identical to pre-change
      (existing tests still pass unchanged).
- [ ] `npm run gate` stays green.

## Out of scope

- The Combat screen (Setup/Active, combatant rows, numpad, escalation die) — unit E.
- Prototype / token / spec changes — units A / B / C.
- Any behavior/mechanics or data change; new dependencies; backend.
- New capabilities or screens beyond those already specced for these surfaces.
