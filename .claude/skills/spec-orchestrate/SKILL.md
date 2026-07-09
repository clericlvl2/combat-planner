---
name: spec-orchestrate
description: Drive one change unit end-to-end — /spec-new draft, approval gate, /spec-tasks, /spec-run, /spec-verify, /spec-close — halting only for the approval gate and three critical junctures (verification FAIL/override, unresolved gate failure, scope conflict). Use when the user wants a single call to run a whole change unit instead of invoking each spec-* skill by hand. Do not use for ad-hoc work outside specs/ — dispatch worker-bee/scout-bee directly for that.
---

You drive a change unit through its full lifecycle by invoking the other spec-* skills yourself,
in this same thread. You do not implement code, edit spec files, or edit agent/skill files
directly — that's what `/spec-new`, `/spec-tasks`, `/spec-run` (via `implementer`),
`/spec-verify` (via `spec-verifier`), and `/spec-close` (via `doc-syncer`) already do. You only
call them, watch their output, and decide when to stop and ask.

## Input contract

You'll be given either:

- A Why/idea and no existing unit — start fresh at step 1.
- An existing `specs/changes/NNN-slug/` path — read its `change.md` frontmatter `status:` and
  resume from the matching step below.

## Steps

1. **draft** — if no unit exists yet, invoke `/spec-new` with the given Why/idea. It stops at
   `status: draft` for approval — relay the drafted `change.md` to the user and STOP. Do not
   proceed past this gate on your own judgment; wait for the user to approve (flip
   `status: approved`, possibly after edits).
2. **approved → tasks** — once `status: approved`, invoke `/spec-tasks`. It turns `change.md`
   into `tasks.md` and flips `status: in-progress`.
3. **in-progress → run** — invoke `/spec-run`. It dispatches `implementer` agents phase by
   phase. If `/spec-run` halts on a gate failure it can't resolve, treat that as a critical
   juncture: stop, report the failure to the user, and wait for direction — do not retry
   blindly or patch around it yourself.
4. **verify** — once `/spec-run` reports all phases green, invoke `/spec-verify`. It dispatches
   a fresh `spec-verifier` agent and writes `verification.md`.
   - If every AC is PASS, continue to step 5 without asking.
   - If any AC is FAIL, or the verifier flags a scope/out-of-scope conflict, STOP: report the
     `verification.md` contents to the user and wait — do not attempt a fix-and-reverify loop on
     your own, and never edit a FAIL to PASS yourself (only the user can record an override, per
     `specs/README.md`'s Human override rule).
5. **close** — invoke `/spec-close`. It runs `doc-syncer`, gets a second verifier pass
   (`doc-verification.md`), appends the changelog row, commits, and archives the unit. Report
   the final summary (files touched, changelog row, commit) to the user.

## Ask-gates (the only points you interrupt)

- The draft → approved gate (step 1) — always, no exception.
- A `spec-verifier` FAIL, or a human override being needed (step 4).
- A phase gate failure `/spec-run` reports as unresolved (step 3).
- A scope/out-of-scope conflict flagged by an implementer or verifier.

Everything else — dispatching `/spec-tasks`, `/spec-run`'s phase-by-phase agent calls, a clean
`/spec-verify` all-PASS, `/spec-close` — proceeds without a prompt.

## Routing note

Only invoke this skill for work that will touch `src/**` or `specs/capabilities/**` — that's
what requires the full lifecycle. For everything else (research, one-off fixes outside those
paths, exploratory work), dispatch `worker-bee` or `scout-bee` directly instead of starting a
change unit.
