# Tasks: 024-compact-card-dims

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

V1 "tuned dims" — dims-only compaction of the shipped combatant card. No layout restructure, no
spec-behavior change. Desktop-only shrink for interactive rows; mobile keeps 44px visible touch
targets (PLT-2 floor). Target values are fixed by the change.md table — every phase uses those
exact numbers, do not re-derive.

## Phase 1 — Card design tokens

**Owns:** `specs/design/tokens.css`
**Parallel-safe with:** none (these two token values co-drive the app card render in Phase 2 and
the prototype card render in Phase 3; land them first so both surfaces tune against the final
tokens)

- [ ] `--card-pad`: `12px` → `10px`.
- [ ] `--hp-size`: `18px` → `16px`.
- [ ] No other token value changes in the diff.
- [ ] Both "synced to shipped … not prototype's prior" exception comments still describe the file
      accurately after the change (app and prototype re-converge on these values — leave the
      surrounding prose consistent; do not delete the comments as a side effect).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — App combatant card compaction

**Owns:** `src/lib/components/app/CombatantRow.svelte`,
`src/lib/components/app/InitCell.svelte`, `src/lib/components/app/ConditionIconList.svelte`
**Parallel-safe with:** Phase 3

These three files are the one app combatant-card visual surface — kept in a single phase so chip
height stays consistent across the init pill, condition chips, and the `+ Condition`/`+ Note`
triggers. Do not split across parallel implementers.

- [ ] `CombatantRow.svelte`: chevron and `⋮` buttons keep `size-11` (44px) on mobile and shrink to
      28px at `lg` (`lg:size-8` → `lg:size-7`, both on the CollapsibleTrigger and the
      DropdownMenuTrigger buttons — the two stay the same size as each other, CBT-2 AC intact).
- [ ] `CombatantRow.svelte`: the unified HP tap `<button>` keeps `min-h-11` (44px) below `lg` and
      renders ≤32px tall at `lg` (add an `lg:` min-height override, e.g. `lg:min-h-8`); it stays a
      single unified numpad target ([[hp]] HP-4 ACs intact).
- [ ] `CombatantRow.svelte`: the `tagTriggerClass` chip (`+ Condition` / `+ Note`) renders 22px
      tall (`h-6` → `h-[22px]`).
- [ ] `InitCell.svelte`: the init-pill chip renders 22px tall (`h-6` → `h-[22px]`); keep fixed
      width, pointer cursor, and no `min-height` (INI-2 ACs intact).
- [ ] `ConditionIconList.svelte`: the condition Badge renders 22px tall (`h-6` → `h-[22px]`).
- [ ] Row structure and field set unchanged: same 4 rows, same order, no field moves.
- [ ] Every interactive card target still measures ≥44px on the touch axis below `lg` (chevron,
      `⋮`, HP row, init-pill wrapper) — PLT-2 AC intact.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Prototype card literals

**CANCELLED before dispatch (user decision, 2026-07-17).** Prototype literal dims stay as-is —
prototypes deliberately remain shifted from code on `.chip` height (24px) and `.icon-btn` size
(32px). Only the token-driven `--card-pad`/`--hp-size` deltas reach the prototypes, via the
shared `tokens.css` import from Phase 1. See change.md "What changes" / "Out of scope". No
files owned; nothing to implement or verify beyond a no-diff check on both prototype files.

## Phase 4 — Mobile 40px touch rows (second scope change, 2026-07-17)

**Owns:** `src/lib/components/app/CombatantRow.svelte`
**Parallel-safe with:** none (added after Phases 1–2 landed and were code-verified; runs alone)

User decision after inspecting shipped result: card mobile touch rows shrink 44px → 40px
(amended PLT-2 card exception — see change.md "What changes"). Three class edits, nothing else:

- [ ] Chevron button: `size-11 lg:size-7` → `size-10 lg:size-7`.
- [ ] `⋮` DropdownMenuTrigger button: `size-11 lg:size-7` → `size-10 lg:size-7`.
- [ ] Unified HP tap `<button>`: `min-h-11` → `min-h-10` (keep `lg:min-h-8` and all other
      classes untouched).
- [ ] No other changes in the file; both icon buttons stay the same size as each other.

**Gate:** `npm run gate` must pass before this phase is reported done.
