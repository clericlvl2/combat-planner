# Specs — process manual

`specs/` is the source of truth for what Combat Planner does. It replaces the old
discipline-sliced docs (`docs/archive/`) with capability-sliced ones, so a task on one feature
reads one file instead of fanning out across five.

## Layout

```
specs/
  README.md            this file
  capabilities/        SOURCE OF TRUTH — one file per feature, stable requirement IDs,
                        each requirement carries its own acceptance criteria
  reference/            cross-cutting tables that span capabilities (limits, glossary,
                        i18n catalog, component inventory, acceptance-matrix)
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

1. **draft** — `/spec-new <slug>` scaffolds `specs/changes/NNN-slug/change.md` from the template
   and interviews you for Why + What changes (by capability ID) + acceptance criteria + out of
   scope. Stops here for your approval — nothing is implemented from a draft.
2. **approved** — you approve the draft as-is (or after edits).
3. **in-progress** — `/spec-tasks` turns the approved `change.md` into `tasks.md`: phases with
   explicit file ownership and parallel-safe groupings. `/spec-run` dispatches `implementer`
   agents per phase (parallel when file-disjoint), collects structured reports, halts on any
   gate failure.
4. **verifying** — `/spec-verify` spawns a fresh `spec-verifier` agent (no implementation
   context) against the diff and the change unit's acceptance criteria; writes
   `verification.md` with a per-AC verdict and `file:line` evidence.
5. **docs-synced** — `/spec-close` runs `doc-syncer` to update the owning capability file(s)
   (and only those), re-verifies the doc edit, adds one changelog row to
   `docs/Combat Planner Status & Roadmap.md`, and moves the unit to `specs/archive/`.
6. **archived** — done; the capability files are the only lasting record besides the changelog
   row. The `specs/changes/NNN-slug/` directory itself is kept in `specs/archive/` for
   provenance.

## Roles

- **You** — write Why + acceptance criteria, approve the draft, approve the verified result.
  That's the whole manual surface.
- **implementer** (`.claude/agents/implementer.md`) — executes exactly one `tasks.md` phase,
  touches only that phase's owned files, ends with the gate + a structured report.
- **spec-verifier** (`.claude/agents/spec-verifier.md`) — read-only, fresh context, checks a
  diff against acceptance criteria independently of whoever implemented it.
- **doc-syncer** (`.claude/agents/doc-syncer.md`) — applies the closing edits to the owning
  capability spec(s) only; its output gets its own spec-verifier pass.

## Gates

Every phase and every change unit ends green on `npm run gate` (lint → check → unit tests →
build). A failing gate blocks the phase; it is never patched around by weakening the gate itself.

## Requirement IDs

A capability file's requirements are the acceptance surface: `HP-3`, `INI-1`, etc. A change unit
references the IDs it touches; `specs/reference/acceptance-matrix.md` is a thin index from ID to
its covering test layer — it never restates acceptance criteria, which live on the requirement
itself in the capability file.
