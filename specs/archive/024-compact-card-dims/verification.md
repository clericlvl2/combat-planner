# Verification: 024-compact-card-dims

Note: this supersedes a prior FAIL-heavy pass that was scored against a stale copy of
change.md. The authoritative worktree change.md (re-read directly at
`/home/artem-budarnyh/projects/combat-planner/.claude/worktrees/024-compact-card-dims/specs/changes/024-compact-card-dims/change.md`,
independently confirmed, not just taken on the coordinator's word) documents a
user-ordered second scope change (2026-07-17): mobile touch rows on the combatant card go
44px → 40px, with PLT-2 explicitly amended for this card's interactive rows. All ACs below
are scored against that amended text.

| AC | Verdict | Evidence |
|----|---------|----------|
| tokens.css: `--card-pad: 10px` and `--hp-size: 16px`; no other token value changes | PASS | specs/design/tokens.css diff: only `--card-pad` (12px→10px) and `--hp-size` (18px→16px) changed; no other token lines touched |
| CombatantRow.svelte: chevron/`⋮` render 40px mobile (`size-10`), 28px at `lg` (`lg:size-7`), same size as each other | PASS | src/lib/components/app/CombatantRow.svelte:131,142 — both buttons `size-10 lg:size-7`, identical classes on both |
| CombatantRow.svelte: unified HP tap row renders 40px (`min-h-10`) below `lg`, ≤32px at `lg`, single unified target | PASS | src/lib/components/app/CombatantRow.svelte:170 — `min-h-10 w-full ... lg:min-h-8`; still a single `<button>` wrapping the HP figure + health bar, opens numpad via `onclick={() => onOpenNumpad(combatant.id)}` |
| Card chips (init pill, condition chips, `+Condition`/`+Note` triggers) render 22px; init pill keeps fixed width/pointer cursor/no min-height | PASS | src/lib/components/app/CombatantRow.svelte:97 (`tagTriggerClass` → `h-[22px]`), src/lib/components/app/ConditionIconList.svelte:26 (`h-[22px]`), src/lib/components/app/InitCell.svelte:85 (`h-[22px]`, `w-full` inside fixed-width wrapper, no `min-h-` added, `cursor-pointer` on parent element retained) |
| Card row structure/field set unchanged: same 4 rows, same order, no field moves | PASS | Diff only touches height/padding utility classes (`h-6`→`h-[22px]`, `size-11 lg:size-8`→`size-10 lg:size-7`, `min-h-11`→`min-h-10 lg:min-h-8`, `--card-pad`/`--hp-size` values); no markup restructure, no row/field additions or removals in CombatantRow.svelte, ConditionIconList.svelte, InitCell.svelte |
| Card interactive rows (chevron, `⋮`, HP row) measure exactly 40px on touch axis below `lg` — amended PLT-2 card exception | PASS | src/lib/components/app/CombatantRow.svelte:131,142 (`size-10` = 40px) and :170 (`min-h-10` = 40px); matches amended AC exactly; init-pill hit wrapper (InitCell.svelte) uses `w-full` inside its parent's sizing, not independently constrained to 44/40px and not called out as a target dim in the amended table — no regression found there |
| `card-prototype.html` / `prototype.html` have no diff | PASS | `git diff HEAD -- specs/design/card-prototype.html specs/design/prototype.html` — empty output, no changes |
| `npm run gate` passes | PASS | Ran full gate from worktree root: `npx biome check src specs messages e2e project.inlang static *.ts *.js *.json` → 0 errors, 3 pre-existing warnings (documented quirk); `npm run check` → svelte-check 5460 files, 0 errors, 0 warnings; `CHOKIDAR_USEPOLLING=true npx vitest run` → 31 test files / 136 tests, all passed; `npm run build` → succeeded, adapter-static wrote `build/`, PWA precache generated |

## Scope check
File set matches declared ownership: `specs/design/tokens.css`, `src/lib/components/app/CombatantRow.svelte`, `src/lib/components/app/ConditionIconList.svelte`, `src/lib/components/app/InitCell.svelte`, plus reference/changelog docs (`specs/reference/component-inventory.md`, `specs/CHANGELOG.md` — out of scope for this code pass per dispatch instructions, ignored). No edits found in `CombatantForm`, `CombatRow`, headers, settings, or the prototype HTML files (confirmed empty diff). `HealthBar` track height and `--badge-width` untouched. Scope respected.

## Other findings
None. The previously-flagged "44px→40px regression" was a false positive from scoring against a stale change.md snapshot read from the main checkout rather than the worktree; the worktree's authoritative change.md documents this exact 40px value as a deliberate, dated (2026-07-17) user-ordered second scope change that explicitly amends PLT-2 for this card's rows only (all other surfaces keep the 44px floor per "What changes" table and "Out of scope" list). Verified independently by reading the worktree file directly (not via WebStorm MCP, which returned stale/cached content for `CombatantRow.svelte` earlier in this review — re-confirmed current values via `grep` on disk for this pass).
