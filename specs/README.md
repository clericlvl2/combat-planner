# Specs — process manual

`specs/` is the source of truth for what Combat Planner does and how work flows through it. It
replaces the old discipline-sliced docs with capability-sliced ones, so a task on one feature
reads one file instead of fanning out across five.

## Quickstart

You have an idea, a bug, or a roadmap item. Here's the path from that to shipped:

1. **Idea → backlog row.** Add (or find) a `B-xxx` row in `specs/backlog.md`. Skip this only for
   work that's already obviously scoped and about to start.
2. **`/spec-new <slug>`** — scaffolds `specs/changes/NNN-slug/change.md` from the template and
   interviews you for Why, affected capability IDs, acceptance criteria, and out-of-scope. Writes
   frontmatter `status: draft`. Stops there — nothing is implemented from a draft.
3. **You approve the draft.** Once you're happy with it (as written or after edits), flip
   `change.md`'s frontmatter to `status: approved`.
4. **`/spec-tasks`** — turns the approved `change.md` into `tasks.md`: phases with explicit file
   ownership and parallel-safe groupings. Flips `status` to `in-progress` once `tasks.md` lands.
5. **`/spec-run`** — dispatches `implementer` agents through `tasks.md`, one phase (or
   parallel-safe group) at a time, halting on any gate failure.
6. **`/spec-verify`** — spawns a fresh `spec-verifier` agent against the diff and acceptance
   criteria. Flips `status` to `verifying` when dispatched; writes `verification.md`.
7. **`/spec-close`** — syncs the owning capability spec(s), gets a second independent verifier
   pass on that doc edit, appends one row to `specs/CHANGELOG.md`, commits everything the unit
   touched (trailer `Spec: NNN-slug`), and archives the unit to `specs/archive/`.

**Shortcut:** a trivial spec-only fix (typo, broken wikilink, a one-line pointer correction) may
skip the full unit ceremony — edit the capability/reference file directly and mention it in the
next changelog row. Don't use this shortcut for anything that touches `src/**`.

**One-call alternative:** `/spec-orchestrate` runs steps 2–7 end-to-end in one invocation — it
drives `/spec-new` → the approval gate → `/spec-tasks` → `/spec-run` → `/spec-verify` →
`/spec-close` itself, only stopping at the approval gate and three critical junctures (a
`spec-verifier` FAIL/override, an unresolved gate failure, or a scope conflict). Route work
through it (or the manual steps above) only when it touches `src/**` or
`specs/capabilities/**`; anything else can go straight to a `worker-bee`/`scout-bee` agent
without a change unit at all.

**Where things live:** capability truth in `specs/capabilities/`, cross-cutting tables in
`specs/reference/`, ADRs in `specs/adr/`, active work in `specs/changes/`, closed work in
`specs/archive/`, the task queue in `specs/backlog.md`, the append-only history in
`specs/CHANGELOG.md`.

## Layout

```
specs/
  README.md            this file
  CHANGELOG.md          append-only — one row per closed change unit, plus frozen spec-era history
  backlog.md            structured task queue — idea/ready/in-unit/done/v2 rows, promoted
                        into a change unit by `/spec-new`; also owns the Milestones table
  capabilities/        SOURCE OF TRUTH — one file per feature, stable requirement IDs,
                        each requirement carries its own acceptance criteria
  reference/            cross-cutting tables that span capabilities (limits, glossary,
                        i18n catalog, component inventory, acceptance-matrix)
  adr/                  architecture decision records (ADR-001..013)
  templates/            change.md and tasks.md skeletons
  changes/              active change units, one dir per unit: NNN-slug/
  archive/              closed change units, moved here on close
```

Capability files and their ID prefixes:

| File | Prefix | Covers |
|------|--------|--------|
| `lifecycle.md` | LIF | Setup/Active, Start, Clear/Restart |
| `initiative.md` | INI | roll/manual/lock, sort, tiebreak |
| `turns-rounds-escalation.md` | TRE | turn advance, round counter, escalation die |
| `hp.md` | HP | damage/heal/temp HP, health bands, numpad |
| `hp-log.md` | LOG | per-combatant HP change log |
| `undo-redo.md` | UND | per-combat undo/redo history |
| `conditions.md` | CND | the 12 conditions |
| `combatants.md` | CBT | fields, add/edit/duplicate/remove, caps |
| `combats-list.md` | CLS | combats CRUD, reorder, color tags, first launch |
| `import-export.md` | IMP | export/import all + single combat |
| `settings.md` | SET | language/theme/reset, About |
| `platform.md` | PLT | offline, PWA install/update, responsive, a11y, perf |

## Change-unit lifecycle

`draft → approved (user gate) → in-progress → verifying → docs-synced → archived`

State is recorded in `specs/changes/NNN-slug/change.md`'s YAML frontmatter, `status:` field —
each skill below reads and writes it, so the current state is always a file fact, never a chat
memory.

1. **draft** — `/spec-new <slug>` checks `specs/backlog.md` for a matching row and, if promoting
   one, links its `B-xxx` in the new unit; then scaffolds `specs/changes/NNN-slug/change.md` from
   the template (frontmatter `status: draft`) and interviews you for Why + What changes (by
   capability ID) + acceptance criteria + out of scope. Stops here for your approval — nothing is
   implemented from a draft.
2. **approved** — you approve the draft as-is (or after edits) by flipping frontmatter to
   `status: approved`.
3. **in-progress** — `/spec-tasks` requires `status: approved` before it will run; it turns
   `change.md` into `tasks.md` (phases with explicit file ownership and parallel-safe groupings)
   and flips `status` to `in-progress` once `tasks.md` lands. `/spec-run` then dispatches
   `implementer` agents per phase (parallel when file-disjoint), collects structured reports, and
   halts on any gate failure. `status` stays `in-progress` through this.
4. **verifying** — `/spec-verify` flips `status` to `verifying` when it dispatches a fresh
   `spec-verifier` agent (no implementation context) against the diff and the change unit's
   acceptance criteria; the agent writes `verification.md` with a per-AC verdict and `file:line`
   evidence.
5. **docs-synced** — `/spec-close` runs `doc-syncer` to update the owning capability file(s) (and
   only those), then dispatches a second, independent `spec-verifier` pass — this time against
   the doc-syncer's own diff — which writes `doc-verification.md` (distinct from the code pass's
   `verification.md`). Once that passes, `status` flips to `docs-synced` and `/spec-close` adds
   one row to `specs/CHANGELOG.md` and commits everything the unit touched.
6. **archived** — `/spec-close` moves the unit to `specs/archive/NNN-slug/` (`git mv`, preserving
   history) and flips `status` to `archived`. The capability files are the only lasting record
   besides the changelog row; the `specs/changes/NNN-slug/` directory itself is kept in
   `specs/archive/` for provenance.

**Human override.** You may override a verifier's verdict (yours is the final call). Record the
override in the verification file itself, not just in chat: change the verdict line to
`PASS (user override)` and add a one-clause reason, so the override survives in the artifact.

## Roles

- **You** — write Why + acceptance criteria, approve the draft, approve the verified result.
  That's the whole manual surface.
- **implementer** (`.claude/agents/implementer.md`) — executes exactly one `tasks.md` phase,
  touches only that phase's owned files, ends with the gate + a structured report.
- **spec-verifier** (`.claude/agents/spec-verifier.md`) — read-only, fresh context, checks a
  diff against acceptance criteria independently of whoever implemented it.
- **doc-syncer** (`.claude/agents/doc-syncer.md`) — applies the closing edits to the owning
  capability spec(s) only; its output gets its own spec-verifier pass.

None of implementer/spec-verifier/doc-syncer ever commits — `/spec-close` is the only step that
creates a commit, and it does so once, at the end, for the whole unit.

## Gates

*The gate* means `npm run gate`: lint → check → unit tests → build. Every phase and every change
unit ends green on it; a failing gate blocks the phase and is never patched around by weakening
the gate itself.

Two narrower checks exist alongside it, deliberately, for speed — neither replaces the gate:

- The **Stop hook** runs a fast subset (lint + check) on every session stop, to catch obvious
  breakage without paying the full build/test cost on every turn.
- **E2E tests run separately in CI**, not as part of `npm run gate` (see `specs/adr/ADR-009.md`)
  — they're slower and belong to the CI stage, not the local/agent gate loop.

## Terms

- **change unit** — one `specs/changes/NNN-slug/` (or `specs/archive/NNN-slug/` once closed);
  the unit of work the six-state lifecycle tracks.
- **capability** — one feature area, one file in `specs/capabilities/`, source of truth for its
  requirements.
- **requirement ID** — a capability's stable acceptance surface, e.g. `HP-3`, `INI-1`.
  `specs/reference/acceptance-matrix.md` is a thin index from ID to its covering test layer — it
  never restates acceptance criteria, which live on the requirement itself in the capability
  file.
- **AC** — acceptance criteria, the independently-verifiable bullets on a change unit or a
  requirement. Not to be confused with Armor Class, the 13th Age combat stat — same initials,
  unrelated concepts.
- **gate** — `npm run gate`; see Gates above.
- **phase** — one ownership-scoped slice of work inside a single change unit's `tasks.md`.
  Never a milestone — milestones are a different, larger grain (see below).
- **milestone** — M1–M6, the product roadmap grain, owned by the Milestones table in
  `specs/backlog.md`. A change unit's task may name the milestone it serves, but milestones
  aren't tracked as change-unit state.
- **B-xxx** — a backlog row ID in `specs/backlog.md`.
- **dogfood** — playing real fights in the actually-built UI, not a spec exercise.
- **spec era / rounds** — the pre-SDD hardening history (numbered rounds of audit/`/grill-me`
  passes) that predates this lifecycle; frozen verbatim in `specs/CHANGELOG.md`.

## Ownership rule

`specs/` owns everything durable about this project's process and product truth; git history is
the only archive (nothing is duplicated into a frozen doc tree); `.claude/plans/` are session
artifacts, not durable records — anything in a plan worth keeping belongs in `specs/` instead.
