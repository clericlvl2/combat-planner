# Tasks: 019-ui-fidelity-grand-revision

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases. This is a deliberately large mega-unit sliced
into many small phases so each implementer dispatch stays well under ~120k tokens.

**Ordering / grouping**
- **Group F (foundation):** Phase 1 + Phase 2 — parallel-safe with each other; BOTH must land
  before any Group C phase runs its gate (consumers reference the new tokens/icons and i18n keys).
- **Group C (consumers):** Phases 3–9 — mutually parallel-safe (disjoint file sets, disjoint
  visual surfaces); each depends on Group F.
- **Phase 10 (design-source sweep):** parallel-safe with everything (touches only design-doc
  files, disjoint from all code); sequence after Phase 1 so it can cite the canonical token names.

**Shared-file ownership decisions (each shared file has exactly ONE owner):**
- `messages/*.json` (all 6 locales) + paraglide regen → **Phase 2 only.** Every new/changed source
  string in the whole unit (modal "New combat"/"Create", form "Add", empty-state keys, SET-3
  `dialogs.resetAll.body` copy fix) is made here. No other phase edits `messages/*` or
  `src/lib/paraglide/*`.
- `ui/dialog/*`, `ui/input/*`, `ui/button/*` (vendored shadcn primitives) → **Phase 4 only.** All
  other phases realize button/input/dialog treatment via call-site classes/variants on the app
  component they own — they never edit these base files.
- `specs/design/prototype.html`, `specs/design/card-prototype.html`,
  `specs/reference/component-inventory.md` → **Phase 10 only.** All design-doc reconciliation
  (chrome controls, card temp-HP segment, HP-summary color, 44px targets, pc=2→1, PLT-2 nav) is
  made here. Code phases read these as binding design truth but never edit them.
- `specs/design/tokens.css`, `src/routes/layout.css` → **Phase 1 only.**

Every UI phase MUST load `specs/design/*.html` + `specs/reference/component-inventory.md` as
binding design truth before writing code (project design-truth rule). Never hand-edit
`src/lib/paraglide/*` — edit `messages/*.json` then regenerate (`npm run prepare` / build).

---

## Phase 1 — Design tokens & icons foundation

**Owns:** `specs/design/tokens.css`, `src/routes/layout.css`, `src/lib/icons.ts`
**Parallel-safe with:** Phase 2
**Depends on:** nothing (pure additive foundation; no consumers touched here)

- [ ] Add a 12px card radius token (`--radius-card: 12px`) to `specs/design/tokens.css`.
- [ ] Add a `--tracking-*` letter-spacing scale to `tokens.css` covering at least the values in
      use (`0.04em`, `0.06em`).
- [ ] Wire both new token families through `src/routes/layout.css` `@theme` so they are available as
      Tailwind utilities.
- [ ] Add a play/start glyph to `src/lib/icons.ts` (lucide `Play` / `PlayCircle`) for LIF-2
      consumption. Export it in the existing icon-registry shape.
- [ ] Do NOT replace any `rounded-[12px]` / `tracking-[0.04em]` literals here — those live in
      `CombatantRow.svelte` (Phase 3) and `CombatHeader.svelte` (Phase 8) and are swapped by their
      owning phases.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — i18n source strings & paraglide regen

**Owns:** `messages/de.json`, `messages/en.json`, `messages/es.json`, `messages/fr.json`,
`messages/ja.json`, `messages/ru.json` (and the regenerated `src/lib/paraglide/*`)
**Parallel-safe with:** Phase 1
**Depends on:** nothing

- [ ] Add create-mode dialog title key resolving (en) to "New combat" and a create-mode primary
      key resolving (en) to "Create" (edit-mode keeps existing "Save"). (CLS-2)
- [ ] Add combatant add-mode submit key resolving (en) to "Add" (edit-mode keeps "Save"). (CBT-3)
- [ ] Add combats-list empty-state keys: description text + CTA copy matching the prototype
      ("+ New combat"). (CLS-1)
- [ ] Correct `dialogs.resetAll.body` copy to state combats are deleted and language/theme are
      KEPT (matches SET-3); add any Settings row-label / "keeps language & theme" caveat keys the
      Settings screen (Phase 9) needs. (SET-3)
- [ ] Keep all 6 locales at key-parity (add the new keys to every locale; non-en values follow the
      project localization flow — en source copy is what this unit guarantees).
- [ ] Regenerate paraglide via `npm run prepare` / build — never hand-edit `src/lib/paraglide/*`.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Combatant card

**Owns:** `src/lib/components/app/CombatantRow.svelte`,
`src/lib/components/app/InitCell.svelte`, `src/lib/components/app/HealthBar.svelte`,
`src/lib/components/app/labels.ts`
**Parallel-safe with:** Phases 4, 5, 6, 7, 8, 9, 10
**Depends on:** Phase 1 (card radius token)

- [ ] `labels.ts` `typeStripeCount` = `{ pc: 1, enemy: 1, ally: 1 }`; remove the stale comment
      claiming pc=2. (CBT-1) — the `component-inventory.md` "pc=2" line is corrected in Phase 10.
- [ ] Combatant name: `--font-md` (15px), weight 600, line-height 1.2 as explicit classes on
      `CombatantRow.svelte`. (CBT-2)
- [ ] Def-stats (AC/PD/MD) label row at `--font-sm` (13px); stat values use the prototype normal
      (`<b>`-default) weight, not `font-semibold`. (CBT-2)
- [ ] Temp-HP badge text at 10px / weight 600. (CBT-2)
- [ ] `+Condition` / `+Note` triggers at prototype normal weight (not `font-medium`) with a
      `--border`-token border color; condition-list gap = 6px; chip gaps a single consistent value
      matching the prototype `.chip` recipe. (CBT-2 / CND-3)
- [ ] Replace the `rounded-[12px]` literal on the card with the Phase 1 card-radius token. (design-tokens)
- [ ] `InitCell.svelte`: light-theme white-background override
      (`[data-theme="light"] .chip.init-pill{background:#fff}`); init value weight/size to
      prototype. (INI-2 / INI-3 / CBT-2)
- [ ] `HealthBar.svelte`: verify shipped temp-HP track behavior stays intact (its prototype
      illustration is added in Phase 10; do not regress the code).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — Create/edit combat modal + shared UI primitives

**Owns:** `src/lib/components/app/CombatFormDialog.svelte`,
`src/lib/components/app/ColorSwatchPicker.svelte`,
`src/lib/components/ui/dialog/*`, `src/lib/components/ui/input/*`,
`src/lib/components/ui/button/*`
**Parallel-safe with:** Phases 3, 5, 6, 7, 8, 9, 10
**Depends on:** Phase 1 (radii), Phase 2 ("New combat" / "Create" keys)

- [ ] Create-mode dialog title resolves to the Phase 2 "New combat" key; create-mode primary
      button resolves to "Create"; edit-mode still resolves to "Save". (CLS-2 / CLS-3)
- [ ] Title input placeholder "e.g. Goblin Ambush"; description textarea placeholder
      "Optional notes". (CLS-2)
- [ ] Cap-error banner clears on ANY field edit, not only the title field. (CLS-2)
- [ ] Modal styling to prototype: backdrop 50% opacity, dialog width 400px, radius `--radius-lg`
      (14px), solid `--border-strong` border, field-label 11px with prototype tracking + no extra
      weight, field gap 5px, input radius `--radius-sm` (6px), input font 15px, cancel button uses
      the prototype outline recipe (not flat secondary), button radius 6px, primary weight 600.
      **Input/button HEIGHT stays 44px** (a11y — proto updated in Phase 10, per PLT-5). (CLS-2)
- [ ] Color-swatch picker: prototype 30px square color tiles with letter + neutral-outline
      selected state (not pill + small dot with primary-tinted ring). (CLS-2)
- [ ] Any minimal `ui/dialog|input|button` base overrides needed for the above are made here and
      nowhere else; prefer call-site classes on `CombatFormDialog` where possible to avoid
      cross-surface regressions.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 5 — Combatant add/edit form + NumberField

**Owns:** `src/lib/components/app/CombatantForm.svelte`,
`src/lib/components/app/NumberField.svelte`
**Parallel-safe with:** Phases 3, 4, 6, 7, 8, 9, 10
**Depends on:** Phase 2 (add-mode "Add" key)

- [ ] Add-mode submit button resolves to the Phase 2 "Add" key; edit-mode resolves to "Save". (CBT-3)
- [ ] `NumberField.svelte` value cell renders at `--font-sm` (13px) and reads as one seamless
      surface — no dark `bg-input/30` tint leaking under the value cell. Realize the tint
      suppression inside `NumberField.svelte` (do NOT edit `ui/input` — that is Phase 4). (CBT-3 / CBT-5)
- [ ] NumberField stepper / footer layout to prototype (presentation only; numeric ranges + caps
      untouched — out of scope). (CBT-5)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 6 — Combats-list home

**Owns:** `src/routes/combats/+page.svelte`, `src/lib/components/app/CombatRow.svelte`,
`src/lib/components/app/EmptyState.svelte`, `src/lib/components/app/SearchField.svelte`,
`src/lib/components/app/ColorTagDot.svelte`
**Parallel-safe with:** Phases 3, 4, 5, 7, 8, 9, 10
**Depends on:** Phase 1 (tokens), Phase 2 (empty-state keys)

- [ ] Empty-state call site (`routes/combats/+page.svelte`) passes an `icon` and `description`, and
      CTA copy matches the prototype ("+ New combat") via the Phase 2 keys. (CLS-1)
- [ ] Row title (`CombatRow.svelte`) renders `--font-md` (15px) / weight 600; row border uses the
      `--border` token (not `ring-foreground/10`). (CLS-1)
- [ ] Search↔list gap = 8px; `SearchField` icon 16px; `ColorTagDot` radius 7px. (CLS-1)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 7 — Numpad + HP summary

**Owns:** `src/lib/components/app/NumpadSheet.svelte`
**Parallel-safe with:** Phases 3, 4, 5, 6, 8, 9, 10
**Depends on:** Phase 1 (tokens)

- [ ] Numpad CommitActions buttons are ≥44px tall (fixes the genuine 32px sub-min bug) and carry
      the prototype bold/xs treatment — via call-site classes on `NumpadSheet` (do NOT edit
      `ui/button` — that is Phase 4). (HP-4 / PLT-5)
- [ ] HP-summary current-HP retains its size + health-band color hierarchy (do not regress it). Its
      prototype illustration is added in Phase 10. (HP-4)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 8 — Active-combat chrome

**Owns:** `src/lib/components/app/CombatHeader.svelte`, `src/routes/combats/[id]/+page.svelte`
**Parallel-safe with:** Phases 3, 4, 5, 6, 7, 9, 10
**Depends on:** Phase 1 (Play glyph in `icons.ts`, `--tracking-*` token)

- [ ] Round/escalation sub-bar uses `--radius` (10px) and the corrected spacing rhythm
      (prototype `--space-2` to the first card, not the stacked 12px). (TRE-3)
- [ ] Replace the two `tracking-[0.04em]` literals in `CombatHeader.svelte` with the Phase 1
      `--tracking-*` token. (design-tokens / TRE-3)
- [ ] Desktop header "Start" control renders as an icon-roundel using the Phase 1 play glyph (in
      the header-add/advance family), not a text pill; mobile Start-FAB uses the play glyph. (LIF-2)
- [ ] On the desktop breakpoint, Settings/About/combats-list are reachable from an open combat
      screen — `CombatHeader` renders the desktop icon-nav row. (PLT-2) — the
      `component-inventory.md` self-contradiction is reconciled in Phase 10.
- [ ] Prototype edits for these chrome controls (start roundel, round/escalation bar) are made in
      Phase 10, not here.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 9 — Settings / About

**Owns:** `src/routes/settings/+page.svelte`, `src/routes/about/+page.svelte`
**Parallel-safe with:** Phases 3, 4, 5, 6, 7, 8, 10
**Depends on:** Phase 1 (`--radius`, `--tracking-*` tokens), Phase 2 (reset copy + row-label keys)

- [ ] Settings data row surfaces the "keeps language & theme" caveat; language + reset rows have
      visible labels (using Phase 2 keys). The `dialogs.resetAll.body` copy itself is fixed in
      Phase 2. (SET-3)
- [ ] Settings screen gap 8px; group radius `--radius` (10px); group heading tracking 0.06em (via
      Phase 1 `--tracking-*` token). (SET-3)
- [ ] About container padding 24px, privacy border 3px, desktop max-width 640px. (SET-3)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 10 — Design-source reconciliation sweep

**Owns:** `specs/design/prototype.html`, `specs/design/card-prototype.html`,
`specs/reference/component-inventory.md`
**Parallel-safe with:** Phases 3, 4, 5, 6, 7, 8, 9 (touches only design-doc files, disjoint from
all code). Sequence after Phase 1 so token names it cites are canonical.
**Depends on:** Phase 1 (canonical token names for citations)

Reconcile design source to match shipped a11y-correct code per the governing rule — never regress
a11y/WCAG-AA or the 44px touch-min to chase mock pixels.

- [ ] `component-inventory.md` "Combatant card" section no longer states "pc=2" (matches
      `labels.ts` pc=1). (CBT-1)
- [ ] Touch targets the code enforces at 44px read 44px in `prototype.html` /
      `card-prototype.html` / `component-inventory.md` (icon-btns, digit pad, num-step, dialog
      inputs/buttons) — NOT 32/38/40 — EXCEPT the numpad CommitActions, which the code raises to
      match (Phase 7). (PLT-5)
- [ ] HP-summary current-HP color hierarchy is drawn in `prototype.html` (design-source no longer
      shows the flat neutral line as the only variant). (HP-4)
- [ ] HealthBar temp-HP track segment is illustrated in the prototype sample states. (HP-4)
- [ ] Def-stats `·` separators, WCAG border-tint recipes (numpad/badges) shown as the canonical
      drawn variant (no AA-failing filled tint remains). (design-source)
- [ ] Stale `header-jump` markup removed from `prototype.html` (feature removed in archived unit 011). (design-source)
- [ ] `component-inventory.md` desktop-nav globality self-contradiction reconciled (matches PLT-2
      CombatHeader desktop nav row). (PLT-2)
- [ ] Prototype chrome-control edits (Setup Start play-roundel, round/escalation bar radius +
      spacing) reflected to match Phase 8. (LIF-2 / TRE-3)

**Gate:** `npm run gate` must pass before this phase is reported done.
