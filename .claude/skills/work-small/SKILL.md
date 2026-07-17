---
name: work-small
description: Run the small work loop for a low-risk, clearly-scoped backlog row — outcome clear, ≤2-3 related files, no architecture/schema/migration. Use when /work-next hands you a row marked Loop=small, or the user asks for a small fix/tweak directly. Do not use for anything touching architecture, schema, migrations, or more than a handful of files — convert to /work-large instead.
---

You run the SMALL loop end-to-end for one backlog row: research → sketch → approval →
implement → check → commit → clear the row. This is the low-ceremony path — keep it fast, but
never skip the approval gate.

## Bar for "small"

Outcome is clear, risk is low, ≤2-3 related files, no architecture/schema/migration work.
**If scope grows past this bar mid-flight — more files, a design decision, a schema/migration
touch — STOP immediately and tell the user this needs `/work-large` instead.** Do not push
through on momentum.

## Steps

1. **Research** — read the backlog row and every file it touches. Understand the actual change
   before proposing anything.
2. **Inline sketch** — write a short sketch in your reply: approach + exact files touched. No
   plan file for small work.
3. **Explicit approval** — present the sketch and stop. Wait for the user to say go. Never
   implement in the same turn as the sketch.
4. **Implement** — either do it directly yourself, or dispatch `worker-bee` with the approved
   sketch as its input contract.
5. **Check** — run a targeted check for what changed (e.g. the relevant test file, lint on
   touched files), then the full `npm run gate`. Red gate is not done — fix it or report it as
   blocking before proceeding.
6. **Commit** — one commit, message carries a `Work: W-NNN` trailer matching the backlog row's
   ID. Keep history linear.
7. **Clear the row** — delete the row from `specs/backlog.md`. The commit trailer is now the
   only record of the work; the backlog only tracks what's left.
