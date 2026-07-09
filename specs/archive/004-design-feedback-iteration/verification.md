# Verification: 004-design-feedback-iteration

| AC | Verdict | Evidence |
|----|---------|----------|
| Prototype approved by user — look locked, no open feedback items | PASS | `specs/changes/004-design-feedback-iteration/feedback-log.md` Round index (R1–R6, all Gate ✓), R4 record: "card **locked** 2026-07-08 — approved to port into `prototype.html`"; R5/R6 are explicitly post-lock fidelity fixes; no item left ✗ except the two deliberately rejected/skipped R3 items 14–15, which are closed decisions, not open items |
| `specs/design/prototype.html` reflects every accepted feedback item from the review rounds | PASS | Spot-checked against ledger: `search-bar`/`nav-desktop` (R1) at `prototype.html:1377,1382`; `header-add`/`header-start` two-FAB Setup chrome (R3/R4) at `prototype.html:1555`; `.round-esc-bar` (R3) at `prototype.html:862`; card restyle (`--card-pad:14px`, `.cond-chip.cond--*` oklab recipe, `.chevron-btn`) ported from `card-prototype.html` into `prototype.html:632-731`; numpad `.digit--ghost`/`.hp-log-chip` (R6) at `prototype.html:982,1023`; `grep -niE 'http\|https\|import\|export'` over the file returns nothing (R2 descope confirmed) |
| `specs/reference/component-inventory.md` matches the final prototype — no preview↔spec drift | PASS | Diff (`git diff HEAD -- specs/reference/component-inventory.md`) rewrites Hierarchy, "Combatant card", FAB table, Numpad sheet, Header, Global chrome placement, Combats list row, reverse-index and glyph-gaps sections to the R1–R6 converged shape; every claim spot-checked against `card-prototype.html` (e.g. `.hp-block`/`.hp-big`/`.chip` markup at `card-prototype.html:406-415,498` matches the doc's "Combatant card" Row 2/chip description) and `prototype.html` |
| `component-inventory.md` reconciled against shipped M2 code (closes first-touch doc-sync miss) | PASS | Phase 1 verdicts (`tasks.md` Step 2) independently corroborated against real shipped files: `src/lib/components/app/CombatHeader.svelte` (Undo/Redo are `DropdownMenuItem`s inside the `⋮` `DropdownMenu`, not header icons — matches doc's "Undo/Redo are not separate header icons"), `src/routes/combats/[id]/+page.svelte` (Setup renders a persistent bottom `Add Combatant` bar, no FAB — matches doc's pre-R3 FAB-table row, now explicitly superseded by the target two-FAB redesign per Phase 2), `src/lib/components/app/CombatantRow.svelte` (row order TypeStripe→HP button→name/health/defs/conditions→InitCell→⋮ menu, matches doc) |
| Each contested element (FAB, "+ Combatant", undo/redo, combatant card) has a bug-vs-redesign decision | PASS | `tasks.md` Phase 1 Step 2, all four classified `(a) STALE-DOC BUG` with cited code evidence; N/A note explains no `(b)` this round |
| Doc reconciliation passes an independent doc-pass verify (fresh read-only agent) | PASS | `tasks.md` Phase 1 Step 4 ("independent Explore agent, code-first... PASS") and Phase 2 Step 3 (dispatched against converged prototype + ledger); this verification pass independently re-confirmed several of the same claims against live `src/` files above, corroborating rather than merely trusting the self-report |
| `PLT-2/3/5` wording updated where the prototype pinned things down; untouched requirements left as-is | PASS | `git diff HEAD -- specs/capabilities/platform.md`: PLT-2 gains desktop-single-column-Combat-screen AC; PLT-3 gains icon-button nav + create-FAB/header-"+" split + Setup/Active chrome AC; PLT-5 gains the `ColorTagDot` color-alone exception. PLT-1/PLT-4/PLT-6 untouched |
| `npm run gate` stays green | PASS | `npm run gate` run in this pass completed: lint/check/unit/build all green, PWA precache generated, `build` directory written |

## Scope check

Partially out-of-scope. Within the change unit's own file ownership (`component-inventory.md`,
`prototype.html`, `card-prototype.html`, `platform.md` PLT-2/3/5, `change.md`, `tasks.md`,
`feedback-log.md`), everything is in scope and matches the declared phases.

However, the working tree diff also contains edits with no traceability to this change unit at
all:

- `.claude/agents/doc-syncer.md`, `.claude/agents/implementer.md`, `.claude/agents/spec-verifier.md`,
  `.claude/agents/worker-bee.md` (new file) — agent tooling/config changes (mcpServers, skills,
  model pins), not mentioned anywhere in `change.md`/`tasks.md`/`feedback-log.md`. Not a
  capability/reference/design file at all; outside every phase's declared ownership.
- `specs/backlog.md` — the M5 row edit and `B-019` addition trace cleanly to the ledger's `bl`
  row (R2, import/export descope) and are legitimate. But `B-018` ("Disable combatant toggle —
  disabled combatant skipped by turn advance, card renders pale") has no reference anywhere in
  this change unit's `change.md`, `tasks.md`, or `feedback-log.md` — unexplained, unrelated
  addition bundled into the same working-tree diff.

These look like leftovers from a different, unrelated task bleeding into the same working tree
rather than work this change unit's phases produced — they should be split out/reverted before
this diff is treated as "unit 004's diff" for close-out.

## Other findings

- `specs/capabilities/platform.md` PLT-4 (untouched by this change, correctly out of its
  Step-2 scope) still reads "Neither ever overlaps the FAB or the Setup start bar" (line 70) and
  the matching AC bullet "...or the Setup start bar" (line 79). Phase 2 replaced the Setup
  "persistent bottom bar" target with a two-FAB layout everywhere else it touched (including
  `component-inventory.md`'s own "Global chrome placement" section, which was explicitly
  reworded away from "Setup's persistent 'Add Combatant' bar" to "Setup now floats two (Add +
  Start) instead of the earlier bottom bar"). PLT-4's "Setup start bar" phrase is now stale
  against the same reconciled target and contradicts the sibling doc it cross-references
  (`[[../reference/component-inventory]]`). This wasn't in Phase 2's explicit scope (PLT-2/3/5
  only) so it isn't a checklist-item FAIL, but it is a leftover contradiction the "Global chrome
  placement... re-read" task step should have caught project-wide, not just in the file it owns.
- `specs/capabilities/settings.md` (owned by a different unit, correctly untouched here) still
  describes "Export all and Import all in Settings → Data" (line 47), which now contradicts
  `component-inventory.md`'s "DataActions (Reset-all only — export/import rows dropped...)".
  This is expected and tracked (`feedback-log.md` ledger row `SET` = "pending"), not a defect of
  this unit — noting it only so it isn't lost before close-out.
