---
name: spec-close
description: Close out a verified change unit — sync the owning capability spec(s), re-verify the doc edit, add one Status & Roadmap changelog row, and move the unit to specs/archive/. Use only after /spec-verify has produced an all-PASS verification.md. Do not use this to skip verification.
---

Close one change unit. Refuse to run this if `verification.md` doesn't show all ACs passing —
tell the user to fix and re-verify first instead of closing on a red or missing verification.

## Steps

1. Read `specs/changes/NNN-slug/verification.md`. If it's missing or has any FAIL, stop and tell
   the user why this can't close yet.
2. Dispatch a `doc-syncer` agent (Agent tool, subagent_type `doc-syncer`) with the change unit
   path and the affected capability IDs from `change.md`. It edits only the owning capability
   spec(s) (and `specs/reference/*` if a cross-cutting fact changed) and adds one changelog row
   to `docs/Combat Planner Status & Roadmap.md`.
3. Dispatch a fresh `spec-verifier` agent against **the doc-syncer's diff** (not the original code
   diff) — check the capability-file edits actually match what verification.md confirmed shipped,
   nothing more and nothing contradictory. This is a second, independent pass; do not reuse the
   first verification.md for this.
4. If that doc-verification passes: move `specs/changes/NNN-slug/` to `specs/archive/NNN-slug/`
   (`git mv`, preserve history). If it fails: report the mismatch to the user and stop — do not
   move the unit or hand-patch the docs yourself.
5. Report to the user: capability/reference files updated, changelog row added, unit archived at
   `specs/archive/NNN-slug/`.
