# Tasks: 007-combat-screen

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group. Styling/layout only — no
game-mechanics, store, or domain change in any phase; existing tests must keep passing unchanged.
All color/spacing/type must come from `src/routes/layout.css` tokens (no hard-coded hex/oklch).
`src/routes/layout.css`, `messages/*.json`, and shared UI primitives under `src/lib/components/ui/**`
are out of scope for edits (token/spec/nav work belongs to units A–D).

## Phase 1 — Shared token/util primitives

**Owns:** `src/lib/components/app/NumberField.svelte`, `src/lib/components/app/labels.ts`
**Parallel-safe with:** none (foundation — every other phase consumes these; run first)

- [ ] Restyle `NumberField.svelte` (labeled numeric input + stepper affordances, clamp hint) to the
      approved template using tokens; keep min/max clamp + digit-cap behavior identical.
- [ ] Confirm/adjust the token-class tables in `labels.ts` (`typeColor`, `conditionColor`,
      `healthColor`, `healthTextColor`) resolve to existing `layout.css` tokens only — no new tokens,
      no hard-coded colors. Do not change any label/message wiring or map keys.
- [ ] Verify PLT-5 on `NumberField`: visible focus, ≥44px targets, no color-alone.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Combatant card leaves

**Owns:** `src/lib/components/app/HealthBar.svelte`, `src/lib/components/app/InitCell.svelte`,
`src/lib/components/app/ConditionIconList.svelte`, `src/lib/components/app/ConditionPicker.svelte`
**Parallel-safe with:** Phase 4, Phase 5, Phase 6 (must run after Phase 1; NOT parallel with Phase 3,
which composes these leaves)

- [ ] `HealthBar.svelte` — restyle the 4-band bar (full/wounded/bloodied/dead incl. reverse/alarm
      dead fill) + temp-HP buffer segment to the `card-prototype.html` recipe, tokens only; keep the
      role=img aria-label (no color-alone).
- [ ] `InitCell.svelte` — restyle to the `Init N` / `Init –` pill (Row 3), disabled-when-active
      styling; keep roll/long-press/manual-entry logic unchanged.
- [ ] `ConditionIconList.svelte` — restyle the filled, full-name, per-condition color chips + the
      removable `×` affordance (expanded only) to the template.
- [ ] `ConditionPicker.svelte` — restyle the 12 preset toggle pills (outline → filled-primary
      selected) in the modal to the template.
- [ ] Verify PLT-5 across all four: visible focus, ≥44px targets, icon/label pairing kept.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Combatant card shell

**Owns:** `src/lib/components/app/CombatantRow.svelte`
**Parallel-safe with:** Phase 4, Phase 5, Phase 6 (must run after Phase 2 — the card composes the
Phase 2 leaves and the Phase 1 `labels` type colors)

- [ ] Port the combatant-card shape from `specs/design/card-prototype.html` (carried in
      `prototype.html`, described in `component-inventory.md` "Combatant card"): TypeStripe · Row 1
      (name + chevron expand + `⋮` overflow) · Row 2 (`.hp-block` fixed-width big HP + temp-HP badge +
      HealthBar) · Row 3 (AC/PD/MD + Init pill) · Row 4 condition chips · Row 5 note line. Tokens only.
- [ ] Widen the note line to render read-only under the card in BOTH collapsed and expanded state
      whenever a note is set (closes the expanded-only gap at `component-inventory.md:111-115`); keep
      the expanded-only editor/`+ Note` trigger behavior for editing.
- [ ] Remove the health-band card-bg tint per the R4 target (fill-color change alone is the signal);
      keep the active-turn highlight, driven by tokens.
- [ ] Row 4 / Row 5 each render independently only when set; AC/PD/MD, Init pill, and full chip list
      stay visible collapsed + expanded (collapsing only hides per-chip `×` and the `+` triggers).
- [ ] No change to controller calls / emitted intent / expand-state logic; verify PLT-5.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — Combat header & screen chrome

**Owns:** `src/lib/components/app/CombatHeader.svelte`, `src/routes/combats/[id]/+page.svelte`,
`src/lib/components/app/JumpToTurnButton.svelte` (new)
**Parallel-safe with:** Phase 2, Phase 3, Phase 5, Phase 6 (must run after Phase 1)

- [ ] `CombatHeader.svelte` — restyle back · RoundCounter + EscalationDie (Active, RoundEscBar sub-bar
      per template) · undo/redo (UND) · overflow menu · Start control; tokens only, mechanics unchanged.
- [ ] `+page.svelte` — restyle the Setup vs Active screen states and their floating controls:
      Setup Add-Combatant + hold-to-Start controls (StartBar), Active Advance FAB (disabled at the
      r99→r100 wrap), empty-state, and the max-w / layout containers, per template + PLT-2/PLT-3
      responsive breakpoints.
- [ ] Add `JumpToTurnButton.svelte` (Active-only, scrolls the active row into view — the
      `component-inventory.md`-flagged not-yet-shipped target) and wire it into the Active screen in
      `+page.svelte`; reuse the existing `active.jumpToTurn` / `a11y.jumpToTurn` i18n keys (no message
      changes). Behavior is view navigation only — no turn/round/state mutation.
- [ ] Verify PLT-5: visible focus, ≥44px targets, no color-alone; game-mechanics (advance/undo/redo/
      start/round/escalation) verify identical to pre-change.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 5 — Numpad sheet & HP log

**Owns:** `src/lib/components/app/NumpadSheet.svelte`
**Parallel-safe with:** Phase 2, Phase 3, Phase 4, Phase 6 (must run after Phase 1)

- [ ] Restyle the numpad sheet to the template: HP summary header · entry display · digit pad · the
      three commit actions (Deal Damage / Restore HP / Set Temp HP) · read-only HP-log history section
      + entry rows (LOG), tokens only.
- [ ] Keep HP math, commit/clear/backspace, and log rendering logic identical; verify PLT-5.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 6 — Combatant form dialog

**Owns:** `src/lib/components/app/CombatantForm.svelte`
**Parallel-safe with:** Phase 2, Phase 3, Phase 4, Phase 5 (must run after Phase 1)

- [ ] Restyle the "+ Combatant" add/edit dialog (name, Type ToggleGroup, Max HP / Init Bonus /
      AC / PD / MD NumberFields, Note, edit-mode Initiative) to the template; tokens only.
- [ ] Keep name-required validation, numeric clamp, and submit shape identical; verify PLT-5.

**Gate:** `npm run gate` must pass before this phase is reported done.
