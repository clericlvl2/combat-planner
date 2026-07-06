# Tasks: ui-design-prototype

Generated from `change.md`. Single self-contained artifact — every phase edits the **same** file,
so all phases are strictly sequential. **No phase is parallel-safe with any other.**

**Shared owned file (all phases):** `specs/design/prototype.html` (new)

## Phase 1 — Scaffold + token draft

**Owns:** `specs/design/prototype.html`
**Parallel-safe with:** none

- [ ] Create `specs/design/prototype.html` — single self-contained page, no external
      CSS/JS/font/image requests (inline `<style>`/`<svg>` only).
- [ ] Inline token vars for both themes (dark-primary + light) as CSS custom properties: neutral
      chrome surfaces/text, semantic color reserved for meaning (type, health bands, 8 color tags).
- [ ] Lay out the mobile-frame and desktop-frame shells (the reusable frame wrappers each screen
      renders into) × dark/light — empty screen slots for now.
- [ ] Add the contrast-note block skeleton (semantic fg/bg pair table, filled in Phase 4).
- [ ] Direction check: utility / calm neutral, dark-primary; color only for meaning.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Core screens

**Owns:** `specs/design/prototype.html`
**Parallel-safe with:** none

- [ ] Combats home — populated list (8 color-tag swatches on rows, each distinguishable without
      color alone) + empty state.
- [ ] Combat — Setup.
- [ ] Combat — Active: HealthBar across all four bands (full/wounded/bloodied/dead), active-turn
      highlight, RoundCounter + EscalationDie, condition icons + overflow, combatant-row TypeStripe
      for PC/enemy/ally each paired with text/icon label (no color-alone). (`PLT-5`)
- [ ] Numpad sheet.
- [ ] Settings.
- [ ] About.
- [ ] Every screen rendered in mobile frame **and** desktop frame × dark **and** light.
      (`PLT-2`, `PLT-3`)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Modals / dialogs

**Owns:** `specs/design/prototype.html`
**Parallel-safe with:** none

- [ ] CombatFormDialog — "+ Combat" create + edit, as overlay on Combats home.
- [ ] CombatantFormDialog — "+ Combatant" create + edit, as overlay on Combat — Setup/Active.
- [ ] ConfirmDialog — destructive confirm, as overlay.
- [ ] Import fail-safe dialog, as overlay.
- [ ] Each overlay shown mobile + desktop × dark + light, consistent with Phase 2 frames.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — Contrast pass + self-contained check

**Owns:** `specs/design/prototype.html`
**Parallel-safe with:** none

- [ ] Fill the contrast-note block: every semantic foreground/background pair used, with measured
      ratio, meeting WCAG-AA in both themes. (`PLT-5`)
- [ ] Verify no color-alone signifiers remain (type/health/tags all paired with label or icon).
- [ ] Self-contained check: confirm zero external requests (no CDN/font/image/script src).
- [ ] Final `npm run gate` — artifact introduces no source that breaks lint/check/test/build.

**Gate:** `npm run gate` must pass before this phase is reported done.
