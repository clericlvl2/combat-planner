# Reference: Acceptance matrix (capability → covering test → layer)

Thin index only — test tooling/rationale: `specs/adr/ADR-009.md`. Case descriptions and
assertions live in the actual test files: `src/**/*.spec.ts`, `src/**/*.svelte.spec.ts`, `e2e/`.
`U`=unit, `C`=component, `E`=E2E.

| Capability req(s) | Covering test | Layer |
|---|---|---|
| [[../capabilities/platform]] PLT-2 | F1 on mobile+desktop; tablet nav spot-check | E |
| [[../capabilities/platform]] PLT-12 | `catchall-page.svelte.spec.ts` — no-route-match renders not-found title + labelled Back-to-Combats button | C |
| [[../capabilities/platform]] PLT-7 | PWA update/reload; Dexie persistence round-trip | E |
| [[../capabilities/platform]] PLT-1 | Offline guarantee (no runtime network calls) | E |
| [[../capabilities/platform]] PLT-4 | Install-hint shown-once + dismissal persists | E |
| [[../capabilities/platform]] PLT-4 | PWA update toast/reload | E |
| [[../capabilities/settings]] SET-1 | language `<Select>` commit + persisted reload — **gap:** `settings/+page.svelte` shipped (unit 006) with no test file yet | — (planned C, E) |
| [[../capabilities/settings]] SET-2 | theme `<ToggleGroup>` + persisted reload — **gap:** `settings/+page.svelte` shipped (unit 006) with no test file yet | — (planned C, E) |
| [[../capabilities/platform]] PLT-2, PLT-5 | a11y labels + focus/target audit on F1 | C, E |
| [[../capabilities/platform]] PLT-3, PLT-2 | Nav per viewport; FAB present mobile, header desktop | E |
| [[../capabilities/combats-list]] CLS-1..CLS-5 | CombatFormDialog (create/edit, name-required); delete confirm; open row | C, E |
| [[../capabilities/combats-list]] CLS-6 | Drag-reorder persists | E |
| [[../capabilities/combats-list]] CLS-7 | firstLaunch transition; lands on combat page | U, E |
| [[../capabilities/import-export]] IMP-1..5, [[../capabilities/combats-list]] CLS-8 | ADR-013 migration transform; import fail-safe; F5 (prep tablet → run phone) | U, E |
| [[../capabilities/combatants]] CBT-2 | CombatantRow compact↔expanded toggle | C |
| [[../capabilities/combatants]] CBT-3 | addCombatant (defaults, 30-cap); form clamp/name-required | U, C |
| [[../capabilities/combatants]] CBT-4, [[../capabilities/hp]] HP-5 | editCombatant (Max-HP discrete undo step) | U |
| [[../capabilities/hp]] HP-3 | dealDamage/restoreHp/setTempHp/empty-entry no-op; NumpadSheet | U, C |
| [[../capabilities/hp]] HP-1, HP-4 | HP clamp at −maxHp; healthStatus banding + reverse/alarm bar | U, C |
| [[../capabilities/conditions]] CND-2 | addCondition/removeCondition; ConditionPicker toggle | U, C |
| [[../capabilities/combatants]] CBT-5 | NoteField (250-char cap) | C |
| [[../capabilities/combatants]] CBT-6, [[../capabilities/turns-rounds-escalation]] TRE-4 | Remove transition + active-pointer move; Undo (F3) | U, E |
| [[../capabilities/combatants]] CBT-7 | Duplicate suffix/reset/cap (§3.8) | U |
| [[../capabilities/hp-log]] LOG-1..5 | hpLog append/pop; History section (empty/populated) | U, C |
| [[../capabilities/lifecycle]] LIF-1, LIF-2 | Lifecycle pre-Start; Setup state-coverage | U, E |
| [[../capabilities/initiative]] INI-2 | rollOne / setInitiative + re-sort | U, C |
| [[../capabilities/lifecycle]] LIF-3 | Start transition; F1 (run a fight) | U, E |
| [[../capabilities/initiative]] INI-4 | Sort order + tiebreak | U |
| [[../capabilities/lifecycle]] LIF-5, LIF-6 | Clear/Restart transitions; Undo; F4 (restart & re-run) | U, E |
| [[../capabilities/turns-rounds-escalation]] TRE-5 | editRound (never touches escalation) | U, C |
| [[../capabilities/turns-rounds-escalation]] TRE-1 | F2 (mid-combat add; re-sort keeps active identity) | U, E |
| [[../capabilities/turns-rounds-escalation]] TRE-2, TRE-3 | advanceTurn + canAdvance round-99 wrap boundary | U |
| [[../capabilities/turns-rounds-escalation]] TRE-6 | Escalation set/round-wrap-only increment | U |
| [[../capabilities/turns-rounds-escalation]] TRE-4, [[../capabilities/lifecycle]] LIF-7 | Active-pointer move on removal + revert-to-Setup on remove-all | U |
| [[../capabilities/settings]] SET-3 | resetAll domain logic (keeps lang/theme, re-runs first-launch), tested in `app.spec.ts` — **gap:** inline Data-group UI in `settings/+page.svelte` (no dedicated DataActions component) shipped (unit 006) with no test file yet | U — (planned C, E) |
| [[../capabilities/settings]] SET-5 | About page render — **gap:** `about/+page.svelte` (no dedicated AboutPage component) shipped (unit 006) with no test file yet | — (planned C, E) |
| [[../capabilities/undo-redo]] UND-1..7 | Undo/redo stack mechanics (§3.6); F3 (undo a mistake) | U, E |

## Cross-cutting E2E flows (F1–F5)

| Flow | Exercises |
|---|---|
| F1 — Run a fight | [[../capabilities/lifecycle]], [[../capabilities/initiative]], [[../capabilities/turns-rounds-escalation]], [[../capabilities/hp]], [[../capabilities/conditions]] |
| F2 — Add mid-combat | [[../capabilities/combatants]] CBT-3, [[../capabilities/turns-rounds-escalation]] TRE-1 |
| F3 — Undo a mistake | [[../capabilities/undo-redo]] |
| F4 — Restart & re-run | [[../capabilities/lifecycle]] LIF-6 |
| F5 — Prep tablet → run phone | [[../capabilities/import-export]] IMP-2, IMP-4 |

## Coverage targets & CI gate

Store seam (transitions + derived helpers) and ADR-013 migration transforms: near-total branch
coverage (pure, cheap to test). Component: every enumerated state in
[[component-inventory]] has at least one render/interaction assertion. E2E: F1–F5 + offline +
PWA update + import fail-safe green on mobile + desktop projects. CI gate: `npm run gate`
(lint → check → unit/component → build; E2E run separately per `specs/adr/ADR-009.md`) — never
weakened to unblock a merge.
