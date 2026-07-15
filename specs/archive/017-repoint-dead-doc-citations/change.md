---
status: archived
backlog: B-016
---

# Change: repoint-dead-doc-citations

## Why

`src/**` comments and test `describe(...)` labels still cite **dead pre-migration doc
sections** — `§`-numbered pointers into the old SDD docs (UX, Component Inventory, Data Model,
Rules & Glossary, Test Plan) that were **deleted 2026-07-03** in the specs restructure. 223 such
citations survive across 57 files spanning six dead namespaces. Every one is a dangling pointer:
a reader who follows `Data §7` or `Component Inventory §5` lands nowhere. Repoint each to the
live owner (a capability ID or a `specs/reference/*` file) where a clean 1:1 target exists; drop
the dead `§` where none does. (B-016; found in SDD restructure sweep.)

## What changes

Comment/traceability hygiene only — **no capability requirement is amended**, no runtime
behavior changes. The table below is the binding **old-namespace → live-owner** remap the sweep
applies (per-`§` target resolved by topic during implementation):

| Dead namespace (examples in code) | Live owner to repoint to |
|----|----|
| `Data §` / `Data Model §` (transitions, roster, derived, undo, hpLog, settings) | capability ID by topic — e.g. undo→`UND`, hpLog→`LOG`, roster/lifecycle→`CBT`/`LIF`, derived→`INI`/`HP`/`TRE`, settings→`SET`; numeric fields → `specs/reference/limits.md` |
| `Rules §` / `Rules & Glossary §` (numeric ranges, game rules) | numeric ranges/caps → `specs/reference/limits.md`; game rules by topic → `INI` / `TRE` / `HP` / `CBT`; condition terms → `specs/reference/glossary-conditions.md` |
| `Test Plan §` (in `*.spec.ts` comments + `describe(...)` labels) | `specs/reference/acceptance-matrix.md` (or the covering capability AC) |
| `UX §` | `specs/reference/component-inventory.md` or the owning capability ID |
| `Component Inventory §` | `specs/reference/component-inventory.md` |

No capability-spec IDs are added or amended (`—`).

## Acceptance criteria

- [ ] After the sweep, `grep -rE '(UX\|Component Inventory\|Data Model\|Data\|Rules( & Glossary)?\|Test Plan\|Glossary) ?§' src/` returns **zero** matches — no dead pre-migration `§` citation survives anywhere under `src/**` (comments, `.spec.ts` describe/it labels, `.gitkeep`, `README.md` included).
- [ ] Each edited comment/label either (a) cites a live capability ID matching `/[A-Z]{2,4}-\d+/` (e.g. `HP-3`, `CBT-7`, `UND-2`), or (b) cites a `specs/reference/*.md` filename that exists (`limits.md`, `acceptance-matrix.md`, `component-inventory.md`, `glossary-conditions.md`), or (c) had the dead `§` dropped leaving grammatical, still-meaningful prose. No comment is left citing a nonexistent capability ID or reference file.
- [ ] The diff touches **only** comments, JSDoc, and test `describe(...)`/`it(...)` label strings. No executable code, no test assertions/expectations, no imports, no runtime behavior changes.
- [ ] Live `ADR-0xx` references are left untouched (they are current, not dead).
- [ ] `npm run gate` passes (lint + check + unit tests + build), confirming zero behavior change.
- [ ] `src/lib/components/app/NumpadSheet.svelte`'s `§7 HP ranges` comment is repointed to
  `specs/reference/limits.md`.
- [ ] `src/lib/components/app/README.md` contains **zero** bare `§N` or `UX & IA §` dead-doc
  pointers, and its component-map table lists **only** components that actually exist on disk
  under `src/lib/components/app/` (no phantom/never-built entries), each row citing a live owner
  (a `specs/reference/component-inventory.md` section or a capability ID) where relevant.

## Out of scope

- Editing any file under `specs/**` (capability files, reference docs, ADRs) — this unit only
  rewrites pointers *inside* `src/**` to already-existing spec owners; it creates/changes no spec
  content.
- Any change to code logic, control flow, test assertions, expected values, or imports.
- Live `ADR-0xx` citations and any non-`§` comment content — not rewritten.
- Prose/quality rewrites of comments beyond swapping the dead pointer, **except** for the
  `src/lib/components/app/README.md` reconcile authorized above: that file's component-map table
  and prose may be rewritten as needed to drop phantom/never-built component rows and replace
  dead `§`/`UX & IA §` pointers with live owners — it stays a doc reconcile, not new spec content.
