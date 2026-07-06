---
status: archived
backlog: B-008, B-009
---

# Change: ui-design-prototype

## Why

Before the M-phase UI build, the app has shadcn-svelte primitives + Tailwind v4 wired but no
locked visual language — the `src/routes/layout.css` token layer is an explicit STUB ("tuned
during UI build M-phase"). We need one approvable visual source of truth for the app's look,
covering mobile **and** desktop, before any screen is built for real. Promotes backlog B-008
(visual design: screen pass — prototype screens/states) and B-009 (desktop layout). The token
half was split out to B-017 (design-chain unit C).

This is unit **A** of a 5-unit design chain: **A prototype → B feedback iterate → C design
tokens → D combats-list screen → E combat screen**. This unit delivers the prototype only;
spec reconciliation is unit B, token bake is unit C, real app implementation is D/E.

## What changes

No capability requirement wording changes here — this unit adds a **design-template artifact**
that must demonstrate the referenced requirements. Spec text reconciliation is deferred to
unit B.

| ID | Change |
|----|--------|
| `PLT-2` | demonstrate: responsive, one-handed mobile layout for every core screen in the prototype |
| `PLT-3` | demonstrate: per-breakpoint navigation (mobile NavSidebar / desktop AppHeader) shown in mobile + desktop frames |
| `PLT-5` | demonstrate: WCAG-AA contrast in both themes and no color-alone signifiers (type/health/tags paired with label or icon) |
| (ref) `specs/reference/component-inventory.md` | realize the specced screen hierarchy/states visually; no edit this unit (edits are unit B) |

## Acceptance criteria

- [ ] A single self-contained HTML design template exists at `specs/design/prototype.html`
      (no external CSS/JS/font/image requests — inline only).
- [ ] It renders all core screens: Combats home (populated list + empty state), Combat — Setup,
      Combat — Active, Numpad sheet, Settings, About. (`component-inventory.md` hierarchy)
- [ ] It renders all modal/dialog screens: CombatFormDialog ("+ Combat", create + edit),
      CombatantFormDialog ("+ Combatant", create + edit), ConfirmDialog (destructive confirm),
      and the import fail-safe dialog — each shown as an overlay on its parent screen.
      (`component-inventory.md` hierarchy)
- [ ] Each screen is shown in **both** a mobile frame and a desktop frame. (`PLT-2`, `PLT-3`)
- [ ] Each screen is shown in **both** dark and light themes.
- [ ] Combat — Active shows the HealthBar across all four health bands
      (full / wounded / bloodied / dead) and the active-turn highlight, RoundCounter +
      EscalationDie, condition icons + overflow.
- [ ] Combatant rows show TypeStripe for PC / enemy / ally, each paired with a text/icon label
      (no color-alone). (`PLT-5`)
- [ ] The 8 color-tag swatches (ADR-012) appear on Combats-home rows, each distinguishable
      without relying on color alone.
- [ ] Every semantic foreground/background pair used meets WCAG-AA contrast in both themes,
      recorded in a short contrast note block inside the artifact. (`PLT-5`)
- [ ] Direction is utility / calm neutral, dark-primary: neutral chrome, color reserved for
      meaning only.
- [ ] `npm run gate` stays green (the added artifact introduces no source that breaks
      lint/check/test/build).

## Out of scope

- Baking tokens into `src/routes/layout.css` — unit C.
- Editing any `specs/` capability or reference file (incl. `component-inventory.md`) — unit B.
- Wiring/restyling real Svelte app components or routes — units D (combats list) and E (combat).
- New dependencies; backend; any data or behavior/mechanics change.
- Figma or external design tooling.
- Single-theme or single-breakpoint output.
