# Change: m2-component-tests-and-dogfood

## Why

M2 (`dfc8582`) landed the whole Setup/Active combat screen — CombatantRow, CombatantForm,
HealthBar, NumpadSheet, ConditionPicker, InitCell, CombatHeader — with zero component-layer
tests and no live-browser dogfood. `specs/reference/acceptance-matrix.md`'s coverage target
("component: every enumerated state ... has at least one render/interaction assertion") is
currently unmet for all of M2, and nobody has played a real fight through the built UI yet.
Promotes `B-001` (M2 component tests) and `B-002` (live-browser dogfood, ★ gate) from
`specs/backlog.md` before more surface gets built on top of an unverified M2.

## What changes

By capability-spec ID (add rows as needed):

| ID | Change |
|----|--------|
| `CBT-2` | new: component test — CombatantRow compact↔expanded toggle |
| `CBT-3` | new: component test — CombatantForm addCombatant defaults/30-cap/clamp/name-required |
| `HP-1`, `HP-4` | new: component test — HealthBar clamp at −maxHp + healthStatus banding/reverse-alarm bar |
| `HP-3` | new: component test — NumpadSheet dealDamage/restoreHp/setTempHp/empty-entry no-op |
| `CND-2` | new: component test — ConditionPicker addCondition/removeCondition toggle |
| `INI-2` | new: component test — InitCell rollOne/setInitiative + re-sort |
| `TRE-5` | new: component test — CombatHeader editRound (never touches escalation) |
| — | new: live-browser dogfood of round-13 M2 build — 2–3 real fights, friction logged to backlog |

## Acceptance criteria

- [x] A Vitest + @testing-library/svelte component test file exists for each of: CombatantRow,
      CombatantForm, HealthBar, NumpadSheet, ConditionPicker, InitCell, CombatHeader
- [x] Each file asserts the specific behavior named in its `acceptance-matrix.md` row (see table
      above) — not just a smoke render
- [x] `npm run gate` passes green with the new tests included
- [x] A DM dogfood attestation is recorded in this change unit (fight count ≥ 2, confirms
      Setup → Active → Clear/Restart played live in a browser) — self-reported by the DM in chat,
      not driven or screenshotted by the agent; the attestation text itself is the evidence
      `spec-verifier` checks for, since play can't be verified from a diff
- [x] Every friction point the DM reports is captured by the agent as a new `B-xxx` row in
      `specs/backlog.md` (status `idea` or `ready`, Area = the capability prefix it touches); if
      the DM reports zero friction, that is noted explicitly rather than left silent
- [x] `B-001` and `B-002` rows in `specs/backlog.md` are flipped to `done` once this unit closes

## Dogfood attestation — user max approval

Live-browser dogfood happened **before this change unit's spec-driven workflow was initiated**,
across the `.claude/plans/2026-07-01-m2-first-touch-report-{1,2}-fixes.md` and
`2026-07-02-m2-first-touch-report-3-fixes.md` sessions — the DM played the M2 build live in a
browser across 3 iterative rounds, covering Setup, Active (round advance, escalation die, numpad
damage/heal/temp-HP, condition toggle, init roll/manual, mid-combat add), and menu/lifecycle
actions (Add/Restart/Clear). All friction found was resolved directly into the M2 rework
(commit `dfc8582` + doc fixups `82da34a`) rather than deferred — none left outstanding, so no new
`B-xxx` rows are needed for it.

Self-reported by the DM (Artem), approved as sufficient evidence at max-approval label — recorded
here in lieu of a fresh dogfood session for this unit.

## Out of scope

- Playwright/E2E test authoring — separate test-plan gap (`B-004`/`B-005`/`B-006`), not this unit
- Visual/design token pass (`B-008`) or desktop layout revisit (`B-009`)
- Fixing any friction found during dogfood — logged as new backlog rows only, not resolved here
- Any product-behavior change — this unit adds test/dogfood coverage for existing M2 behavior only
- Combats-list / Settings / About components (CombatFormDialog, ThemeSwitcher, DataActions,
  AboutPage, etc.) — not built yet in M2, nothing to test
- Agent-driven browser/screenshot use for the dogfood session — DM plays manually and reports
  findings in chat; agent only transcribes those into backlog rows
