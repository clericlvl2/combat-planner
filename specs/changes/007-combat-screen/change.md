---
status: approved
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
**no game-mechanics change** to any capability (turn order, damage/HP math, escalation-die
progression, etc. stay untouched). Purely visual/DOM-visibility gaps between shipped code and
the locked prototype target — per `component-inventory.md`'s "Target vs. shipped" framing — are
in scope to close as part of the restyle; see the note-line item below.

## What changes

Restyle existing Combat-screen components/routes to the approved template using unit-005 tokens.
The combatant card ports from `specs/design/card-prototype.html` (the living sandbox spec for the
card's exact CSS recipe), whose locked shape is already carried into `prototype.html` and
described in `specs/reference/component-inventory.md`.

| ID | Change |
|----|--------|
| (ref) `specs/design/card-prototype.html` | source for the exact combatant-card CSS recipe (chip `color-mix()` recipe, `--card-pad`, `--hp-size`, `.hp-block`/`.hp-big`/badge); `prototype.html` carries the ported copy, both agree |
| `LIF-*` | restyle: Setup vs Active screen states, StartBar |
| `CBT-*` | restyle: CombatantCard — TypeStripe · Row1 (name + chevron expand + `⋮` overflow) · Row2 (hp-block: big HP + temp-HP badge + 4-band healthbar) · Row3 (AC/PD/MD + Init pill) · optional Row4 (condition chips, full-name filled) · optional Row5 (note line) — Row4/Row5 each render only when set, independently; note line widens to render in **both** collapsed and expanded state (closes the shipped-code gap flagged in `component-inventory.md:111-115` — currently expanded-only) |
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
- [ ] No game-mechanics change — LIF/INI/TRE/HP/LOG/CND/CBT/UND rules/state logic verify
      identical to pre-change (existing tests still pass unchanged).
- [ ] Note line renders read-only under the card whenever a note is set, in both collapsed and
      expanded state (widens `CombatantRow.svelte`'s current expanded-only behavior to match the
      locked prototype target).
- [ ] `npm run gate` stays green.

## Out of scope

- Combats home, AppShell/nav, Settings, About — unit D.
- Prototype / token / spec changes — units A / B / C.
- Any game-mechanics or data change; new dependencies; backend.
- New capabilities, screens, or states beyond those already specced for the Combat screen.
