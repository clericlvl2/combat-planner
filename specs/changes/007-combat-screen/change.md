---
status: draft
backlog: —
---

# Change: combat-screen

## Why

Final implementation unit: restyle the Combat screen — the app's heartbeat (~95% of play) — to
the approved design template and unit-005 tokens. Split from the combats-list surface (unit D)
so the densest, most stateful screen is reviewed on its own.

Unit **E** of the 5-unit design chain: A prototype → B feedback iterate → C design tokens →
D combats-list screen → **E combat screen**. Depends on unit 005 (`design-tokens`), unit 006
(shared AppShell/nav/tokens in place), and the approved prototype. Styling/layout only —
**no behavior/mechanics change** to any capability.

## What changes

Restyle existing Combat-screen components/routes to the approved template using unit-005 tokens.

| ID | Change |
|----|--------|
| `LIF-*` | restyle: Setup vs Active screen states, StartBar |
| `CBT-*` | restyle: CombatantRow compact + expanded (TypeStripe, row menu, name, DefenseStats, TempHpField, NoteField) |
| `INI-*` | restyle: InitCell display / init entry |
| `TRE-*` | restyle: CombatHeader RoundCounter + EscalationDie, FAB(advance), JumpToTurnButton, active-turn highlight |
| `HP-*` | restyle: HpCell, HealthBar (all four bands), NumpadSheet (digit pad, entry, commit) |
| `LOG-*` | restyle: HpLogSection / HpLogEntryRow in the numpad sheet |
| `CND-*` | restyle: ConditionIconList + overflow, ConditionPicker chips (removable ×) |
| `UND-*` | restyle: undo / redo header buttons |
| `PLT-2`,`PLT-3` | apply: responsive mobile + desktop layout, per-breakpoint nav |
| `PLT-5` | apply: WCAG-AA contrast, visible focus, ≥44px targets, no color-alone (from tokens) |

## Acceptance criteria

- [ ] Combat — Setup and Combat — Active render styled to the approved
      `specs/design/prototype.html`, in both mobile and desktop layouts and both dark and light
      themes.
- [ ] CombatantRow (compact + expanded), CombatHeader (RoundCounter + EscalationDie + undo/redo),
      StartBar, FAB, JumpToTurnButton, NumpadSheet (+ HP log), CombatantFormDialog ("+ Combatant")
      all match the template.
- [ ] HealthBar shows all four bands (full/wounded/bloodied/dead) and the active-turn highlight,
      driven by tokens.
- [ ] All color/spacing/type come from `src/routes/layout.css` tokens — no hard-coded colors or
      ad-hoc hex/oklch in these components.
- [ ] PLT-5 holds: visible focus, ≥44px targets, no color-alone (TypeStripe keeps its
      aria-label; conditions keep icon/label pairing).
- [ ] No behavior/mechanics change — LIF/INI/TRE/HP/LOG/CND/CBT/UND behavior verifies identical
      to pre-change (existing tests still pass unchanged).
- [ ] `npm run gate` stays green.

## Out of scope

- Combats home, AppShell/nav, Settings, About — unit D.
- Prototype / token / spec changes — units A / B / C.
- Any behavior/mechanics or data change; new dependencies; backend.
- New capabilities, screens, or states beyond those already specced for the Combat screen.
