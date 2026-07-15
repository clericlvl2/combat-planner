# Tasks: 017-repoint-dead-doc-citations

Generated from `change.md`. Comment-only doc-hygiene sweep: repoint dead pre-migration `§`
citations to live owners per the **old-namespace → live-owner** remap table in `change.md`
("What changes"). Each phase lists its owned files (no other phase may touch them) and whether
it can run in parallel with sibling phases.

Every edit touches **only** comments, JSDoc, and test `describe(...)`/`it(...)` label strings —
no executable code, no assertions, no imports, no runtime behavior. Live `ADR-0xx` citations are
left untouched. Per-`§` target resolution follows the `change.md` remap table (undo→`UND`,
hpLog→`LOG`, roster/lifecycle→`CBT`/`LIF`, derived→`INI`/`HP`/`TRE`, settings→`SET`, numeric
fields/ranges→`specs/reference/limits.md`, conditions→`specs/reference/glossary-conditions.md`,
Test Plan→`specs/reference/acceptance-matrix.md`, UX/Component Inventory→
`specs/reference/component-inventory.md` or owning capability ID).

Phases 1–6 own disjoint file sets and are mutually parallel-safe. Phase 7 is a sequential
verification gate that runs only after Phases 1–6 are all reported done.

## Phase 1 — Domain store layer (`src/lib/stores/domain/**`)

**Owns:** `src/lib/stores/domain/clamp.ts`, `src/lib/stores/domain/clamp.spec.ts`, `src/lib/stores/domain/hp.ts`, `src/lib/stores/domain/derive.ts`, `src/lib/stores/domain/derive.spec.ts`, `src/lib/stores/domain/transitions.ts`, `src/lib/stores/domain/transitions.spec.ts`, `src/lib/stores/domain/undo.ts`, `src/lib/stores/domain/undo.spec.ts`, `src/lib/stores/domain/app.ts`, `src/lib/stores/domain/app.spec.ts`, `src/lib/stores/domain/factories.ts`, `src/lib/stores/domain/constants.ts`, `src/lib/stores/domain/id.ts`, `src/lib/stores/domain/index.ts`
**Parallel-safe with:** Phases 2, 3, 4, 5, 6

- [ ] Repoint every dead `§` citation in the owned files to its live owner per the `change.md` remap table; drop the `§` where no clean 1:1 target exists, leaving grammatical prose.
- [ ] Edit only comments / JSDoc / test `describe(...)`/`it(...)` labels — no assertions, imports, or logic. Leave `ADR-0xx` citations untouched.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Top-level store layer (`src/lib/stores/*`)

**Owns:** `src/lib/stores/combat-store.svelte.ts`, `src/lib/stores/combat-store.svelte.spec.ts`, `src/lib/stores/index.ts`
**Parallel-safe with:** Phases 1, 3, 4, 5, 6

- [ ] Repoint every dead `§` citation in the owned files to its live owner per the `change.md` remap table; drop the `§` where no clean 1:1 target exists, leaving grammatical prose.
- [ ] Edit only comments / JSDoc / test `describe(...)`/`it(...)` labels — no assertions, imports, or logic. Leave `ADR-0xx` citations untouched.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Persistence layer (`src/lib/db/**`)

**Owns:** `src/lib/db/migrations.ts`, `src/lib/db/migrations.spec.ts`, `src/lib/db/persistence.ts`, `src/lib/db/persistence.spec.ts`, `src/lib/db/types.ts`, `src/lib/db/types.spec.ts`
**Parallel-safe with:** Phases 1, 2, 4, 5, 6

- [ ] Repoint every dead `§` citation in the owned files to its live owner per the `change.md` remap table; drop the `§` where no clean 1:1 target exists, leaving grammatical prose.
- [ ] Edit only comments / JSDoc / test `describe(...)`/`it(...)` labels — no assertions, imports, or logic. Leave `ADR-0xx` citations untouched.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — App components (`src/lib/components/app/**`)

**Owns:** `src/lib/components/app/AppShell.svelte`, `src/lib/components/app/AppHeader.svelte`, `src/lib/components/app/NavSidebar.svelte`, `src/lib/components/app/FAB.svelte`, `src/lib/components/app/FAB.svelte.spec.ts`, `src/lib/components/app/EmptyState.svelte`, `src/lib/components/app/EmptyState.svelte.spec.ts`, `src/lib/components/app/CombatList.svelte`, `src/lib/components/app/CombatRow.svelte`, `src/lib/components/app/CombatRowMenu.svelte`, `src/lib/components/app/CombatFormDialog.svelte`, `src/lib/components/app/ColorSwatchPicker.svelte`, `src/lib/components/app/ColorTagDot.svelte`, `src/lib/components/app/ConfirmDialog.svelte`, `src/lib/components/app/CombatantRow.svelte`, `src/lib/components/app/CombatantForm.svelte`, `src/lib/components/app/InitCell.svelte`, `src/lib/components/app/HealthBar.svelte`, `src/lib/components/app/NumberField.svelte`, `src/lib/components/app/NumpadSheet.svelte`, `src/lib/components/app/ConditionPicker.svelte`, `src/lib/components/app/ConditionIconList.svelte`, `src/lib/components/app/controller.ts`, `src/lib/components/app/labels.ts`, `src/lib/components/app/README.md`
**Parallel-safe with:** Phases 1, 2, 3, 5, 6

- [ ] Repoint every dead `§` citation in the owned files to its live owner per the `change.md` remap table; drop the `§` where no clean 1:1 target exists, leaving grammatical prose.
- [ ] Edit only comments / JSDoc / test `describe(...)`/`it(...)` labels and doc prose in `README.md` — no assertions, imports, markup, or logic. Leave `ADR-0xx` citations untouched.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 5 — Lib leaf files (`icons`, `pwa`, `ui/.gitkeep`)

**Owns:** `src/lib/icons.ts`, `src/lib/pwa/register.ts`, `src/lib/components/ui/.gitkeep`
**Parallel-safe with:** Phases 1, 2, 3, 4, 6

- [ ] Repoint every dead `§` citation in the owned files to its live owner per the `change.md` remap table; drop the `§` where no clean 1:1 target exists, leaving grammatical prose.
- [ ] Edit only comments / doc text — no logic. Leave live `ADR-0xx` citations untouched (e.g. `icons.ts` ADR-011 references stay).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 6 — Routes (`src/routes/**`)

**Owns:** `src/routes/+error.svelte`, `src/routes/about/+page.svelte`, `src/routes/settings/+page.svelte`, `src/routes/combats/+page.svelte`, `src/routes/combats/[id]/+page.svelte`
**Parallel-safe with:** Phases 1, 2, 3, 4, 5

- [ ] Repoint every dead `§` citation in the owned files to its live owner per the `change.md` remap table; drop the `§` where no clean 1:1 target exists, leaving grammatical prose.
- [ ] Edit only comments — no markup, script logic, or imports. Leave `ADR-0xx` citations untouched.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 8 — Residual dead-§ sweep + README reconcile

**Owns:** `src/lib/components/app/NumpadSheet.svelte`, `src/lib/components/app/README.md`
**Parallel-safe with:** none — runs after Phase 4 (which already touched both files) and before
Phase 7's final verification sweep

- [ ] `NumpadSheet.svelte`: repoint the remaining `§7 HP ranges` comment to
  `specs/reference/limits.md`. Comment text only — no logic change.
- [ ] `README.md`: full reconcile against the real flat component set under
  `src/lib/components/app/` (run `ls` to confirm). Drop every phantom/never-built row (planned
  nested-tree components that never shipped), rewrite the map to list only files that exist, and
  replace every bare `(§N)` / `UX & IA §` pointer with a live pointer — a
  `specs/reference/component-inventory.md` section or a capability ID by topic. Keep the file's
  purpose (a component orientation map); this is a doc reconcile, not a deletion.
- [ ] `grep -rnE '§' src/lib/components/app/NumpadSheet.svelte src/lib/components/app/README.md` returns zero matches.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 7 — Verification sweep

**Owns:** no source files (read-only verification only)
**Parallel-safe with:** none — runs only after Phases 1–6 are all reported done

- [ ] Run the AC-1 acceptance grep and confirm **zero** matches: `grep -rE '(UX|Component Inventory|Data Model|Data|Rules( & Glossary)?|Test Plan|Glossary) ?§' src/`
- [ ] Confirm every edited comment/label either cites a live capability ID (`/[A-Z]{2,4}-\d+/`), or an existing `specs/reference/*.md` filename (`limits.md`, `acceptance-matrix.md`, `component-inventory.md`, `glossary-conditions.md`), or had the dead `§` cleanly dropped — no nonexistent ID or reference file introduced.
- [ ] Confirm the diff touched only comments/JSDoc/test label strings — no executable code, assertions, imports, or `ADR-0xx` citations changed.

**Gate:** `npm run gate` must pass before this phase is reported done.
