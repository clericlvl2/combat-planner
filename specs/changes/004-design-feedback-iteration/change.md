---
status: approved
backlog: —
---

# Change: design-feedback-iteration

## Why

Unit 003 delivers a v1 design-template prototype. It needs review rounds before the look can be
locked — adjust screens/states/layout and the proposed token values on feedback, then reconcile
the specs with what the converged design actually shows (the prototype will surface gaps the
written spec never pinned down: exact breakpoints, focus treatment, per-state layout). Expected
to be **iterative** — multiple rounds until the user approves the look.

Unit **B** of the 5-unit design chain: A prototype → **B feedback iterate** → C design tokens →
D combats-list screen → E combat screen. Depends on unit 003 (`ui-design-prototype`) and
redeploys the **same** `specs/design/prototype.html`.

## What changes

Unlike unit 003 (artifact only), this unit **does** edit specs — reconciling them to the
converged prototype.

| ID | Change |
|----|--------|
| (artifact) `specs/design/prototype.html` | iterate to the approved converged version (v-final) across review rounds |
| `specs/reference/component-inventory.md` | amend: reconcile hierarchy / states / control placement with what the final prototype shows |
| `PLT-2` | amend if the design pins specifics (one-handed reach zones, ≥44px targets as realized) |
| `PLT-3` | amend if the design pins specifics (exact breakpoints, nav placement per breakpoint) |
| `PLT-5` | amend if the design pins specifics (focus treatment, contrast pairs, color-not-alone patterns) |
| any `PREFIX-n` | amend (presentation/layout only): a capability's visibility / control-placement / per-state wording where the converged prototype revises it — **no mechanics change** |

(Amendments are made **only** where the prototype pins down something the current wording
leaves open or contradicts; if a requirement needs no change, leave it untouched. Any part of
the app may shift a little or not at all.)

## Acceptance criteria

- [ ] The prototype is approved by the user — look locked, no open feedback items.
- [ ] `specs/design/prototype.html` reflects every accepted feedback item from the review rounds.
- [ ] `specs/reference/component-inventory.md` matches the final prototype — no preview↔spec
      drift in hierarchy, states, or control placement.
- [ ] Any `PLT-2/3/5` wording that the prototype pinned down is updated to match; requirements
      the prototype did not change are left as-is.
- [ ] `npm run gate` stays green.

## Out of scope

- Baking tokens into `src/routes/layout.css` — unit C (B-017).
- Wiring/restyling real Svelte app components or routes — units D (combats list) and E (combat).
- Adding new screens/states beyond those already in the unit-003 prototype scope.
- New dependencies; backend; any data or behavior/mechanics change (presentation-only wording
  amendments to capability files are in scope).
- Editing reference files other than `component-inventory.md`.
