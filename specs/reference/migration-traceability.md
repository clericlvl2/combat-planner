# Migration traceability: old docs → new specs

Maps every normative statement in the 10 discipline docs (`docs/Combat Planner *.md`, pre-flip)
to its new home under `specs/capabilities/`, `specs/reference/`, or `docs/adr/`. Built for the
Phase 1 HARD GATE — **user approval required before the archive flip** (Phase 1 step 5). `dropped:
<reason>` rows are implementation-scaffolding or duplicate meta-content with no behavioral loss;
every one is called out explicitly rather than silently omitted.

Legend: **U** = mapped, unchanged fact. **R** = mapped, reworded/consolidated but same meaning.
**D** = dropped (reason given).

## Combat Planner Overview.md

| Section | Statement | New location | Status |
|---|---|---|---|
| "What it is" | App description/vision | `CLAUDE.md` header paragraph; `about.md` copy in [[../reference/i18n-catalog]] `about.*` | U |
| "Sub-docs" | Index of the 10 docs | `specs/README.md` capability-file table; `docs/README.md` (rewritten at flip) | R |
| "Maintaining this set" | One-fact-one-doc rule, owner map | `CLAUDE.md` doc rules section (rewritten at flip to the capability map); `specs/README.md` | R |
| "Maintaining this set" | "Spec docs are timeless... only Status & Roadmap is living" | `specs/README.md` (change-unit lifecycle replaces "rounds"); `docs/Combat Planner Status & Roadmap.md` stays live | R |

## Combat Planner Requirements Prompt.md

| Section | Statement | New location | Status |
|---|---|---|---|
| Entire doc | Original generic d20 source sketch, pre-13th-Age | superseded by PRD/Rules/Data/UX throughout; kept in `docs/archive/` for provenance only, no live pointer needed | D: superseded-by-design (doc's own stated purpose was "kept for provenance; superseded... where they differ" — never a live source of truth) |

## Combat Planner PRD.md

### §1–3 Vision, target user, goals/non-goals

| Statement | New location | Status |
|---|---|---|
| Vision (DM, one encounter, one-handed, offline, no network/account) | `CLAUDE.md` header; [[../capabilities/platform]] PLT-1, PLT-2, PLT-6 | U |
| Target user / context (single DM, single device, dim rooms) | [[../capabilities/platform]] PLT-2, PLT-6; `specs/README.md` | U |
| Goals (manage one combat: combatants/init/HP/temp/escalation/conditions/round) | Distributed across [[../capabilities/combatants]], [[../capabilities/initiative]], [[../capabilities/hp]], [[../capabilities/turns-rounds-escalation]], [[../capabilities/conditions]] | U |
| Non-goals (no sync/accounts/cloud, no rules automation, no other systems, no monster library, no telemetry) | [[../capabilities/conditions]] CND-1 (no automation); [[../capabilities/platform]] PLT-6 (no telemetry); rest have no behavior to spec (absence of a feature) | R (captured where a capability exists to bound; pure absences noted as out-of-scope, not requirements) |

### §4 Resolved scope decisions (1–23)

| # | Decision | New location | Status |
|---|---|---|---|
| 1 | Local-only, single device, no backend | [[../capabilities/platform]] PLT-1, PLT-6; `docs/adr/ADR-003.md` | U |
| 2 | Game system: 13th Age (escalation + temp HP) | [[../reference/glossary-conditions]] core terms; [[../capabilities/turns-rounds-escalation]] TRE-6; [[../capabilities/hp]] HP-1 | U |
| 3 | Escalation die 0–6, round-wrap +1, decoupled, DM override, reset on Clear/Restart | [[../capabilities/turns-rounds-escalation]] TRE-6 | U |
| 4 | Temp HP additive buffer, replace-on-set, drains before current | [[../capabilities/hp]] HP-1 | U |
| 5 | Combatant type: 3-value visual flag, optional, default enemy | [[../capabilities/combatants]] CBT-1 | U |
| 6 | One initiative list; type shown via color, never reorders by side | [[../capabilities/initiative]] INI-4; [[../capabilities/combatants]] CBT-1 | U |
| 7 | Lifecycle Setup→Active; Start behavior; identity-tracked turn pointer | [[../capabilities/lifecycle]] LIF-1..3; [[../capabilities/turns-rounds-escalation]] TRE-1 | U |
| 7b | Clear/Restart/remove-all reset semantics | [[../capabilities/lifecycle]] LIF-5..7 | U |
| 7c | Tap=roll, long-press=manual init; Start auto-rolls rest | [[../capabilities/initiative]] INI-2, INI-5 | U |
| 7d | HP floor at −MaxHP, heal never reduces, temp replace-on-set | [[../capabilities/hp]] HP-1, HP-2 | U |
| 8 | Conditions: pure visual, manual removal, up to 12, unique | [[../capabilities/conditions]] CND-1, CND-2 | U |
| 9 | Backup: export/import all + single combat | [[../capabilities/import-export]] IMP-1, IMP-2 | U |
| 10 | Global per-combat Undo/Redo, 10-deep, scope, Delete/Reset-all excluded | [[../capabilities/undo-redo]] UND-1, UND-2, UND-6 | U |
| 11 | i18n: 6 languages, AI-translated, autodetect + fallback | [[../capabilities/settings]] SET-1; `docs/adr/ADR-005.md` | U |
| 12 | Pages: Combats → Combat; Settings; About | [[../capabilities/platform]] PLT-3; [[../capabilities/settings]] SET-5 | U |
| 13 | Combats list: swatch palette, drag reorder, new at top | [[../capabilities/combats-list]] CLS-2, CLS-6; [[../reference/glossary-conditions]] color palette | U |
| 14 | HP numpad: Deal Damage/Restore HP/Set Temp HP, delta-based | [[../capabilities/hp]] HP-3 | U |
| 15 | Card density: compact → expand | [[../capabilities/combatants]] CBT-2; [[../reference/component-inventory]] | U |
| 16 | Theme: dark+light, follow system, manual toggle | [[../capabilities/settings]] SET-2 | U |
| 17 | Hard caps: 30 combatants, 100 combats | [[../reference/limits]]; [[../capabilities/combatants]] CBT-3; [[../capabilities/combats-list]] CLS-2 | U |
| 18 | Onboarding: empty-state hints, first-launch auto-combat | [[../capabilities/combats-list]] CLS-7 | U |
| 19 | PWA: update toast, install hint, silent offline | [[../capabilities/platform]] PLT-1, PLT-4 | U |
| 20 | Accessibility: WCAG 2.1 AA | [[../capabilities/platform]] PLT-5 | U |
| 21 | Privacy: no telemetry | [[../capabilities/platform]] PLT-6; `docs/adr/ADR-010.md` | U |
| 22 | Edit combatant: all stats editable, Max HP ⇏ current | [[../capabilities/combatants]] CBT-4; [[../capabilities/hp]] HP-5 | U |
| 23 | HP change log: read-only, distinct from undo, travels with export | [[../capabilities/hp-log]] LOG-1..5 | U |

### §5 Personas

| Statement | New location | Status |
|---|---|---|
| Dana the DM persona | `specs/README.md` (implicit context); not a testable requirement | D: narrative/marketing color, no AC attached anywhere in source docs — no behavior to lose |

### §6 Epics A–F (stories + AC)

| Epic/story | New location | Status |
|---|---|---|
| A1 responsive | [[../capabilities/platform]] PLT-2 | U |
| A2 persists reload/update | [[../capabilities/platform]] PLT-7 | U |
| A3 offline | [[../capabilities/platform]] PLT-1 | U |
| A4 installable + dismissible hint | [[../capabilities/platform]] PLT-4 | U |
| A5 update toast | [[../capabilities/platform]] PLT-4 | U |
| A6 language switch | [[../capabilities/settings]] SET-1 | U |
| A7 theme | [[../capabilities/settings]] SET-2 | U |
| A8 one-handed / WCAG-AA | [[../capabilities/platform]] PLT-2, PLT-5 | U |
| B1 nav per breakpoint | [[../capabilities/platform]] PLT-3 | U |
| B2 FAB bottom-right mobile | [[../capabilities/platform]] PLT-2; [[../reference/component-inventory]] FAB table | U |
| C1 list display | [[../capabilities/combats-list]] CLS-1 | U |
| C2 create combat | [[../capabilities/combats-list]] CLS-2 | U |
| C3 edit combat | [[../capabilities/combats-list]] CLS-3 | U |
| C4 delete combat | [[../capabilities/combats-list]] CLS-4 | U |
| C5 open combat | [[../capabilities/combats-list]] CLS-5 | U |
| C6 reorder | [[../capabilities/combats-list]] CLS-6 | U |
| C7 first-launch | [[../capabilities/combats-list]] CLS-7 | U |
| C8 export/import | [[../capabilities/import-export]] IMP-1..5; [[../capabilities/combats-list]] CLS-8 | U |
| D1 combatant row fields | [[../capabilities/combatants]] CBT-2 | U |
| D2 add combatant | [[../capabilities/combatants]] CBT-3 | U |
| D3 edit combatant / Max HP | [[../capabilities/combatants]] CBT-4; [[../capabilities/hp]] HP-5 | U |
| D4 HP numpad | [[../capabilities/hp]] HP-3, HP-6 | U |
| D5 negative HP | [[../capabilities/hp]] HP-1, HP-4 | U |
| D6 health bar | [[../capabilities/hp]] HP-4 | U |
| D7 apply conditions | [[../capabilities/conditions]] CND-2 | U |
| D8 remove conditions | [[../capabilities/conditions]] CND-1, CND-2 | U |
| D9 note inline | [[../capabilities/combatants]] CBT-5 | U |
| D10 remove combatant | [[../capabilities/combatants]] CBT-6; [[../capabilities/turns-rounds-escalation]] TRE-4 | U |
| D11 duplicate | [[../capabilities/combatants]] CBT-7 | U |
| D12 HP change log | [[../capabilities/hp-log]] LOG-1..5 | U |
| E0 Setup state | [[../capabilities/lifecycle]] LIF-1, LIF-2 | U |
| E1 roll/manual init | [[../capabilities/initiative]] INI-1, INI-2, INI-4 | U |
| E2 Start | [[../capabilities/lifecycle]] LIF-3 | U |
| E3 sort + tiebreak | [[../capabilities/initiative]] INI-4 | U |
| E4 Clear/Restart | [[../capabilities/lifecycle]] LIF-5, LIF-6 | U |
| E5 round/escalation visible Active-only | [[../capabilities/turns-rounds-escalation]] TRE-5, TRE-6 | U |
| E6 edit round decoupled | [[../capabilities/turns-rounds-escalation]] TRE-5 | U |
| E7 whose turn / identity-bound | [[../capabilities/turns-rounds-escalation]] TRE-1 | U |
| E8 advance + r99 wrap block + FAB placement | [[../capabilities/turns-rounds-escalation]] TRE-2, TRE-3; [[../reference/component-inventory]] | U |
| E9 escalation track/set | [[../capabilities/turns-rounds-escalation]] TRE-6 | U |
| E10 remove active/remove-all | [[../capabilities/turns-rounds-escalation]] TRE-4; [[../capabilities/lifecycle]] LIF-7 | U |
| F1(PRD) settings + reset-all | [[../capabilities/settings]] SET-1..4 | U |
| F2(PRD) About page | [[../capabilities/settings]] SET-5 | U |

### §7 Non-functional requirements

| Statement | New location | Status |
|---|---|---|
| Offline-first | [[../capabilities/platform]] PLT-1 | U |
| Persistence | [[../capabilities/platform]] PLT-7 | U |
| Performance & caps | [[../capabilities/platform]] PLT-8; [[../reference/limits]] | U |
| Responsive | [[../capabilities/platform]] PLT-2 | U |
| Accessibility | [[../capabilities/platform]] PLT-5 | U |
| Localization | [[../capabilities/settings]] SET-1 | U |
| Privacy | [[../capabilities/platform]] PLT-6 | U |
| Reliability | [[../capabilities/platform]] PLT-7 | U |

### §8 Risks & mitigations

| Statement | New location | Status |
|---|---|---|
| Data-loss risk → export/import mitigation | [[../capabilities/import-export]] IMP-1, IMP-2 | U |
| Mis-taps risk → Undo/Redo mitigation | [[../capabilities/undo-redo]] UND-1 | U |
| Machine-translation quality risk | [[../capabilities/settings]] SET-1 (implicit — flagged, not a testable AC) | D: risk narrative, not a requirement; no AC existed for it in the source doc either |

### §9 Out of scope / §10 Open questions & status

| Statement | New location | Status |
|---|---|---|
| Out-of-scope list (monster library, sync, other systems, automation, live-session sharing) | `docs/Combat Planner Status & Roadmap.md` v2 backlog (stays live, unchanged) | U |
| Pointer to Status & Roadmap for open Qs/history | `docs/Combat Planner Status & Roadmap.md` (kept live; links repointed to capability IDs at flip) | U |

## Combat Planner Rules & Glossary.md

| Section | Statement | New location | Status |
|---|---|---|---|
| §1 Core terms | Combat/Combatant/PC/Ally/Round/Turn definitions | [[../reference/glossary-conditions]] Core terms | U |
| §2 Lifecycle | Setup/Active states, Start, Clear, Restart, remove-all-reverts | [[../capabilities/lifecycle]] LIF-1..8 | U |
| §2 Initiative | Value/bonus, manual entry, active-only lock, sort/tiebreak | [[../capabilities/initiative]] INI-1..5 | U |
| §2 Turns | Active-turn pointer, advancing, removing active | [[../capabilities/turns-rounds-escalation]] TRE-1, TRE-2, TRE-4 | U |
| §3 Escalation die | 0–6, round-wrap-only +1, DM override, decoupled, reset | [[../capabilities/turns-rounds-escalation]] TRE-6 | U |
| §4 Hit points | Max/current/temp HP, numpad actions | [[../capabilities/hp]] HP-1, HP-3 | U |
| §4 Heal formula | `min(cur+n, max(max,cur))` | [[../capabilities/hp]] HP-2 | U |
| §4 HP change log pointer | Cross-ref to Data Model §9 | [[../capabilities/hp-log]] (whole file) | U |
| §4 Health status & bar | Thresholds table, reverse bar | [[../capabilities/hp]] HP-4 | U |
| §5 Defenses | AC/PD/MD, placeholder 10, stored not rolled | [[../reference/limits]] form table; [[../capabilities/combatants]] CBT-2 | U |
| §6 Conditions | 12 preset, pure visual, table of meanings | [[../capabilities/conditions]] CND-1; [[../reference/glossary-conditions]] condition table | U |
| §7 Add-combatant form | Field/type/required/placeholder/default table | [[../reference/limits]] | U |
| §7 Numeric limits & validation | Min/max ranges table, clamp-on-commit | [[../reference/limits]] | U |
| §7 Hard caps | 30 combatants / 100 combats | [[../reference/limits]] | U |
| §8 Duplicate behavior | Suffixing, resets, copies, placement, cap | [[../capabilities/combatants]] CBT-7 | U |

## Combat Planner Data Model.md

| Section | Statement | New location | Status |
|---|---|---|---|
| §1 Entities overview | AppData → Settings/Combat/Combatant/Condition tree + caps | [[../reference/limits]] (caps); implicit across capability files | R (diagram itself not reproduced — pure structure diagram, caps + fields fully covered elsewhere) |
| §2 Settings fields | language/theme/firstLaunchDone/installHintDismissed/dataVersion | [[../capabilities/settings]] SET-1, SET-2; [[../capabilities/combats-list]] CLS-7; [[../capabilities/platform]] PLT-4; `docs/adr/ADR-013.md` | U |
| §3 Combat fields | id/title/description/colorTag/listOrder/state/round/escalation/activeCombatantId/undo-redo stacks | [[../capabilities/combats-list]] CLS-1..3; [[../capabilities/lifecycle]]; [[../capabilities/turns-rounds-escalation]]; [[../capabilities/undo-redo]] | U |
| §3 Derived values | escalationDie, sortedCombatants, canAdvance, showRoundAndEscalation | [[../capabilities/turns-rounds-escalation]] TRE-3, TRE-5, TRE-6; [[../capabilities/initiative]] INI-4; [[../capabilities/lifecycle]] LIF-1 | U |
| §4 Combatant fields | id/name/type/addOrder/initiative/bonus/maxHp/currentHp/tempHp/ac/pd/md/note/conditions/hpLog | [[../capabilities/combatants]]; [[../capabilities/hp]]; [[../capabilities/conditions]]; [[../capabilities/hp-log]] | U |
| §4 Derived values | healthPercent, healthStatus, isActive | [[../capabilities/hp]] HP-4; [[../capabilities/turns-rounds-escalation]] TRE-1 | U |
| §5 Condition enumeration | Fixed set of 12, membership-only | [[../capabilities/conditions]] CND-1; [[../reference/glossary-conditions]] | U |
| §6 Relationships & integrity | Combatant→Combat ownership, activeCombatantId validity, state-transition rules, escalation reset, duplicate rules | [[../capabilities/combatants]] CBT-8; [[../capabilities/lifecycle]] LIF-7, LIF-8; [[../capabilities/turns-rounds-escalation]] TRE-4; [[../capabilities/combatants]] CBT-7 | U |
| §7 Key operations table | Every transition (firstLaunch..resetAll) | Distributed 1:1 across all 12 capability files (each operation appears as an AC or requirement body in its owning file) | U |
| §8 Undo model | Scope, off-stack exclusions, snapshot reversal, HP-change reversal, stack mechanics | [[../capabilities/undo-redo]] UND-1..7 | U |
| §9 HP change log | Entry shape, scope, ordering, lifetime, undo interaction, derivation | [[../capabilities/hp-log]] LOG-1..4 | U |
| §10 Persistence & portability | Persistence guarantee, schema versioning, export/import semantics, fail-safe rules, reset-all | [[../capabilities/platform]] PLT-7; `docs/adr/ADR-013.md`; [[../capabilities/import-export]] IMP-1..5; [[../capabilities/settings]] SET-3 | U |

## Combat Planner UX & IA.md

| Section | Statement | New location | Status |
|---|---|---|---|
| §1 Page map | Combats/Combat/Settings/About | [[../capabilities/platform]] PLT-3; [[../capabilities/settings]] SET-5 | U |
| §2 Navigation | Per-breakpoint nav pattern, destinations | [[../capabilities/platform]] PLT-3 | U |
| §3 Combats (home) | List display, row menu, drag reorder, create/import, empty state | [[../capabilities/combats-list]] CLS-1, CLS-2, CLS-6, CLS-7; [[../capabilities/import-export]] IMP-4 | U |
| §4a Setup state | No auto-sort, no active turn/Advance/round/escalation, FAB+bottom bar layout | [[../capabilities/lifecycle]] LIF-1, LIF-2; [[../reference/component-inventory]] FAB/StartBar | U |
| §4b Start transition | One-tap auto-roll/re-sort/activate | [[../capabilities/lifecycle]] LIF-3 | U |
| §4c Active state | Advance FAB, auto-scroll + jump-to-turn button, compact/expanded row, type stripes, HP-status card background (incl. PC-vs-enemy/ally dead-tint distinction) | [[../capabilities/turns-rounds-escalation]] TRE-2 (auto-scroll/jump-to-turn); [[../capabilities/combatants]] CBT-1, CBT-2; [[../capabilities/hp]] HP-4 (type-differentiated dead tint) | U |
| §4c Numpad panel | Open trigger, summary header, digit pad, commit actions, HP log History, dismiss | [[../capabilities/hp]] HP-3, HP-6; [[../capabilities/hp-log]] LOG-2 | U |
| §4c Turn/round/escalation controls | Advance, edit round, set escalation, Restart, Clear, remove-active | [[../capabilities/turns-rounds-escalation]] TRE-2, TRE-5, TRE-6; [[../capabilities/lifecycle]] LIF-5, LIF-6 | U |
| §5 Key flows F1–F5 | Run a fight / mid-combat add / fix mistake / re-run / prep-then-run | [[../reference/acceptance-matrix]] cross-cutting flows table | U |
| §6 State coverage table | Empty/Setup/Active/first-launch/cap/confirm/undo/offline/update states per screen | Distributed: [[../capabilities/lifecycle]], [[../capabilities/combats-list]] CLS-7, [[../reference/limits]], [[../capabilities/undo-redo]], [[../capabilities/platform]] PLT-1/PLT-4 | R (table format not reproduced; every cell's fact is covered by a capability AC) |
| §7 Responsive behavior | Mobile-first, breakpoint layout notes, ≥44px targets | [[../capabilities/platform]] PLT-2 | U |
| §8 Feedback/errors/a11y | Confirmations, Undo/Redo, HP log pointer, toast/hint placement (bottom-center toast, top banner, never overlaps FAB/start-bar), validation, caps, import feedback, PWA hints, a11y basics | [[../capabilities/lifecycle]] LIF-5/6; [[../capabilities/combats-list]] CLS-4; [[../capabilities/undo-redo]]; [[../capabilities/hp-log]]; [[../reference/limits]]; [[../capabilities/import-export]] IMP-5; [[../capabilities/platform]] PLT-4, PLT-5 (toast/banner placement); [[../reference/component-inventory]] Global chrome placement | U |
| §9 Control surface map | Every control's container/visibility/trigger, all screens | [[../reference/component-inventory]] (placement subset kept); full per-control trigger table not reproduced | R: trigger mechanics (tap/long-press/drag) are captured in the owning capability file's AC (e.g. INI-2 tap/long-press, CLS-6 drag); container/visibility placement kept in [[../reference/component-inventory]] and [[../capabilities/platform]] PLT-2/PLT-3; the doc's table *format* (one row per control) is not reproduced verbatim — no distinct fact identified as lost beyond what's cross-referenced |

## Combat Planner Component Inventory.md

| Section | Statement | New location | Status |
|---|---|---|---|
| §1 How to read | Meta/pointers-only preamble | N/A (doc-structure note) | D: meta-documentation, not a requirement |
| §2 Component hierarchy | Full tree | [[../reference/component-inventory]] Hierarchy | U |
| §3 Global shell & chrome table | AppShell/Toaster/UpdateToast/InstallBanner/ConfirmDialog: purpose + primitive + states | Behavior: [[../capabilities/platform]] PLT-4 (install/update), [[../capabilities/lifecycle]] LIF-5/6 + [[../capabilities/combats-list]] CLS-4 + [[../capabilities/settings]] SET-3 (confirm dialogs). Component→primitive mapping itself: not reproduced | D (partial): shadcn-primitive choice per chrome component is implementation scaffolding for the build step, not a spec requirement — every *behavior* those components implement is captured in the capability files listed |
| §4 Navigation table | NavSidebar/AppHeader/NavLink + primitives | Behavior: [[../capabilities/platform]] PLT-3. Primitive mapping: [[../reference/component-inventory]] Navigation placement (kept, condensed) | R |
| §5 Combats (home) table | CombatList/CombatRow/ColorTagDot/CombatRowMenu/FAB/ImportControl/EmptyState/CombatFormDialog/ColorSwatchPicker | Behavior: [[../capabilities/combats-list]] CLS-1..8; [[../reference/glossary-conditions]] (color palette). Component/primitive breakdown: [[../reference/component-inventory]] Combats list row (condensed) | R |
| §6 Combat header table | CombatHeader/IconButton/RoundCounterControl/EscalationDieControl/CombatOverflowMenu | Behavior: [[../capabilities/turns-rounds-escalation]] TRE-5, TRE-6; [[../capabilities/undo-redo]]. Layout: [[../reference/component-inventory]] Header section | U |
| §7 Setup/Active bodies table | CombatantList/FAB/StartBar/JumpToTurnButton/EmptyState | Behavior: [[../capabilities/lifecycle]] LIF-2; [[../capabilities/turns-rounds-escalation]] TRE-2. Layout: [[../reference/component-inventory]] FAB table | U |
| §8 Combatant row (matrix + sub-components) | Prop matrix, TypeStripe/CombatantRowMenu/InitCell/HpCell/HealthBar/DefenseStats/ConditionIconList/ConditionPicker/TempHpField/NoteField | Behavior: [[../capabilities/combatants]] CBT-1, CBT-2, CBT-5; [[../capabilities/initiative]] INI-2; [[../capabilities/hp]] HP-4; [[../capabilities/conditions]] CND-3. Layout summary: [[../reference/component-inventory]] Combatant row section | U |
| §9 Numpad sheet table | NumpadSheet/HpSummaryHeader/EntryDisplay/DigitPad/CommitActions/HpLogSection/HpLogEntryRow | Behavior: [[../capabilities/hp]] HP-3, HP-6; [[../capabilities/hp-log]] LOG-2. Layout: [[../reference/component-inventory]] Numpad sheet section | U |
| §10 Forms table | CombatantFormDialog/TypeSelect/NumberField/NoteField primitives | Behavior: [[../capabilities/combatants]] CBT-3, CBT-4, CBT-5; [[../reference/limits]]. Primitive mapping: not reproduced | D (partial): shadcn primitive per form field is a build decision; every field/range/validation behavior is in [[../reference/limits]] and [[../capabilities/combatants]] |
| §11 Settings & About table | SettingsGroup/LanguageSwitcher/ThemeSwitcher/DataActions/AboutPage primitives | Behavior: [[../capabilities/settings]] SET-1..5. Primitive mapping: not reproduced | D (partial): same reasoning as §10 — primitive choice is a build decision, behavior fully specified |
| §12 shadcn primitive reverse index | Which primitive used by which component (incl. the `Tooltip` row, deferred-to-build a11y reinforcement) | [[../reference/component-inventory]] Primitive coverage table | U |
| §13 Glyph gaps | Missing chrome glyphs flagged for ADR-011 | [[../reference/component-inventory]] Glyph gaps; `docs/adr/ADR-011.md` glyph-gaps note | U |
| §14 State coverage | Per-component state → owning UX/Data section | Behavior already covered per-state in the owning capability file (empty/disabled/dead/error states appear in [[../capabilities/lifecycle]], [[../capabilities/undo-redo]], [[../capabilities/turns-rounds-escalation]], [[../capabilities/hp]], [[../capabilities/combatants]], [[../capabilities/import-export]]) | D: this section was itself a cross-reference index back to UX/Data — those facts are now cross-referenced directly from each capability file instead of through this intermediate table |

## Combat Planner Architecture.md

| Section | New location | Status |
|---|---|---|
| Context (4 hard constraints) | `docs/adr/README.md` Context | U |
| Stack-at-a-glance table | `docs/adr/README.md` Stack at a glance | U |
| ADR-001 .. ADR-013 (Decision/Rationale/Alternatives/Consequences, verbatim) | `docs/adr/ADR-001.md` .. `docs/adr/ADR-013.md` | U |

## Combat Planner i18n Message Catalog.md

| Section | New location | Status |
|---|---|---|
| §1 How to read | N/A (meta preamble) | D: doc-structure note, restated as pointer prose in [[../reference/i18n-catalog]] header instead |
| §2 Namespace tree | [[../reference/i18n-catalog]] Namespace tree | U |
| §3–§17 all key tables (nav/combats/combat/setup/active/numpad/conditions/health/forms/settings/about/dialogs/toasts/errors/a11y) | [[../reference/i18n-catalog]] (same section order) | U |
| §18 Interpolation & ICU summary | Folded into per-key "Shape" column throughout [[../reference/i18n-catalog]] rather than a separate summary table | R: same facts (which keys carry variables/plurals), no separate index table reproduced |
| §19 Open gaps | [[../reference/i18n-catalog]] Open gaps | U |

## Combat Planner Test Plan.md

| Section | New location | Status |
|---|---|---|
| §1 How to read | N/A (meta preamble) | D: doc-structure note |
| §2 Test layers table | [[../reference/acceptance-matrix]] Coverage targets & CI gate section (tool/layer facts folded in); full "does not cover" column not reproduced | R |
| §3 Unit cases (3.1–3.9) | Case descriptions remain in `docs/archive/Combat Planner Test Plan.md` (archived, not deleted) — [[../reference/acceptance-matrix]] indexes by capability ID rather than reproducing case prose | R: acceptance-matrix is a thin index per the plan's design; full case text is preserved in the archived doc, not lost |
| §4 Component cases | Same as §3 — indexed, not reproduced | R |
| §5 E2E scenarios (F1–F5, offline, PWA update, import fail-safe) | [[../reference/acceptance-matrix]] Cross-cutting E2E flows table; full scenario prose stays in the archived doc | R |
| §6 Acceptance matrix (PRD IDs → test → layer) | [[../reference/acceptance-matrix]] main table, remapped to capability IDs | U (remapped) |
| §7 Coverage targets & CI gate | [[../reference/acceptance-matrix]] Coverage targets & CI gate | U |
| §8 Gaps (flagged) | Not reproduced in the new reference file | D: these are process gaps about the *test plan itself* (no coverage % ratified, viewport matrix unpinned, etc.) — they are project-status items, not product requirements; belongs in `docs/Combat Planner Status & Roadmap.md` if still open, not in a spec reference file. **Flagged for the user:** confirm these 5 gaps are either already resolved or should be copied into Status & Roadmap before archiving. |

## Combat Planner Status & Roadmap.md

Not migrated — stays live per the plan (it's explicitly the one mutable/non-timeless doc). At the
flip its cross-references to old doc sections get repointed to capability IDs; its content
(changelog, build status, roadmap) is otherwise unchanged.

## Summary of drops requiring explicit sign-off

1. PRD §5 Dana persona — narrative color, no AC.
2. PRD §8 machine-translation-quality risk note — risk narrative, no AC existed.
3. Data Model §1 entity diagram — structure fully covered by field lists + limits elsewhere; ASCII tree itself not reproduced.
4. Component Inventory §3, §10, §11 — shadcn-primitive-per-component mapping (implementation/build scaffolding); all behavior preserved.
5. Component Inventory §14 — state-coverage cross-reference table; same facts now attached directly to each capability's own states.
6. i18n Catalog §18 — separate ICU/interpolation summary table; same facts folded into each key's "Shape" column.
7. Test Plan §3–§5 case prose — preserved verbatim in the archived doc; acceptance-matrix is a thin ID index only, per the plan's design.
8. Test Plan §8 gaps — process/status items (no ratified coverage %, no pinned viewport matrix, persistence-round-trip test ownership unstated, a11y-scan scope undecided, RNG-injection point unconfirmed). Checked against `docs/Combat Planner Status & Roadmap.md`: none of the 5 are recorded there yet. **Action needed at the Phase 1 flip:** copy these 5 items into Status & Roadmap's Next/Open-questions so they aren't lost when the Test Plan doc is archived.

## Independent verification (fresh-agent pass)

A fresh read-only subagent (no access to this table's authoring context) checked this table
against all 10 old docs and all `specs/` files. It found three genuine gaps, since fixed:

- **Auto-scroll-to-active-turn + "jump to turn" button** (UX & IA §4c/§9) — was named in the
  component hierarchy but its trigger/behavior was nowhere in `specs/`. Added to
  [[../capabilities/turns-rounds-escalation]] TRE-2.
- **PC-vs-enemy/ally dead-tint card-background distinction** (UX & IA §4c) — collapsed to a
  generic "reflects HP status" note. Added to [[../capabilities/hp]] HP-4.
- **Toast/install-banner placement rules** (UX & IA §8/§9: bottom-center toast, top banner, never
  overlaps FAB/start-bar) — absent from `specs/`. Added to [[../capabilities/platform]] PLT-4 and
  [[../reference/component-inventory]] Global chrome placement.

It also flagged the `Tooltip` primitive row (Component Inventory §12) as silently dropped from
`reference/component-inventory.md`'s reverse index — restored — and a garbled leftover sentence
in `specs/capabilities/settings.md` SET-1 — fixed. All other rows it spot-checked (ADR split
fidelity, numeric limits, PRD decisions/epics, drop reasoning) held up with no further issues.
The table above reflects the post-fix state.
