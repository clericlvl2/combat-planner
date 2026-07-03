---
name: spec-close
description: Close out a verified change unit — sync the owning capability spec(s), re-verify the doc edit, add one specs/CHANGELOG.md row, commit everything the unit touched, and move the unit to specs/archive/. Use only after /spec-verify has produced an all-PASS verification.md. Do not use this to skip verification.
---

Close one change unit. Refuse to run this if `verification.md` doesn't show all ACs passing (or
all failures overridden per the `PASS (user override)` convention) — tell the user to fix and
re-verify first instead of closing on a red or missing verification.

## Steps

1. Read `specs/changes/NNN-slug/verification.md`. If it's missing or has any plain FAIL (not
   overridden), stop and tell the user why this can't close yet.
2. Dispatch a `doc-syncer` agent (Agent tool, subagent_type `doc-syncer`) with the change unit
   path and the affected capability IDs from `change.md`. It edits only the owning capability
   spec(s) (and `specs/reference/*` if a cross-cutting fact changed) and adds one changelog row
   to `specs/CHANGELOG.md`'s **Change units** table.
3. Dispatch a fresh `spec-verifier` agent against **the doc-syncer's diff** (not the original code
   diff) — check the capability-file edits actually match what verification.md confirmed shipped,
   nothing more and nothing contradictory. This is a second, independent pass; do not reuse the
   first verification.md for this. Its output is `specs/changes/NNN-slug/doc-verification.md` —
   a distinct filename from the code pass's `verification.md`, never overwrite one with the
   other. The same user-override convention applies here too (`PASS (user override)` + reason,
   written into `doc-verification.md` itself) if the user chooses to accept a doc-pass FAIL.
4. If that doc-verification passes: flip `change.md`'s frontmatter to `status: docs-synced`. If
   it fails (and isn't overridden): report the mismatch to the user and stop — do not move the
   unit, commit, or hand-patch the docs yourself.
5. If `change.md`'s frontmatter `backlog:` names a `B-xxx` row, flip that row in
   `specs/backlog.md` to `done`.
6. Move `specs/changes/NNN-slug/` to `specs/archive/NNN-slug/` (`git mv`, preserve history) and
   flip frontmatter to `status: archived`.
7. **Commit.** Stage everything the unit touched — code, capability/reference edits, the
   changelog row, the backlog flip, and the archive move — and create one commit:
   - Conventional-commit subject: `<type>(<area>): <summary>`.
   - Body includes trailer `Spec: NNN-slug` (this is what the CI Spec-trailer check looks for —
     the commit will fail CI without it).
   - Body also includes trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
   This is the only commit for the whole unit; nothing the unit touched should be left
   uncommitted after this step.
8. Report to the user: capability/reference files updated, changelog row added, commit hash +
   message, unit archived at `specs/archive/NNN-slug/`.
