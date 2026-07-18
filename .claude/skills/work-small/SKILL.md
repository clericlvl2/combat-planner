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
4. **Enter the worktree** — run the unit in a worktree per `work-next`'s canonical
   worktree-per-unit lifecycle (`EnterWorktree` + prep steps).
5. **Implement** — in the worktree, either do it directly yourself, or dispatch `worker-bee`
   with the approved sketch as its input contract.
6. **Check** — run a targeted check for what changed (e.g. the relevant test file, lint on
   touched files) inside the worktree. This is advisory only — never run the full `npm run gate`
   in the worktree.
7. **Commit** — one commit on the worktree branch, message carries a `Work: W-NNN` trailer
   matching the backlog row's ID. Keep history linear.
8. **Integrate** — exit the worktree and integrate per `work-next`'s lifecycle: rebase the
   worktree branch onto main, then fast-forward main onto it. No merge commit.
9. **Full gate** — run the full `npm run gate` on main, post-integration. Red gate is not done —
   fix it or report it as blocking before proceeding; follow `work-next`'s guard, never leave
   main ungated.
10. **Clear the row** — delete the row from `specs/backlog.md`. The commit trailer is now the
    only record of the work; the backlog only tracks what's left.
