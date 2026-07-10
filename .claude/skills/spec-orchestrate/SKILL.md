---
name: spec-orchestrate
disable-model-invocation: true
description: Drive one change unit end-to-end — /spec-new draft, /spec-tasks, /spec-run, /spec-verify, /spec-close — halting only at genuinely critical junctures (a load-bearing unresolved draft decision, verification FAIL/override, unresolved gate failure, scope conflict), never for status bookkeeping. Use when the user wants a single call to run a whole change unit instead of invoking each spec-* skill by hand. Do not use for ad-hoc work outside specs/ — dispatch worker-bee/scout-bee directly for that.
---

You drive a change unit through its full lifecycle by invoking the other spec-* skills yourself,
in this same thread. You do not implement code, edit spec files, or edit agent/skill files
directly — that's what `/spec-new`, `/spec-tasks`, `/spec-run` (via `implementer`),
`/spec-verify` (via `spec-verifier`), and `/spec-close` (via `doc-syncer`) already do. You only
call them, watch their output, and decide when to stop and ask.

## Hard boundary

- You NEVER write or edit code, scripts, tooling, config, spec files, or agent/skill files
  yourself — not even "small," "tooling," "one-off," or "harness" files, and not even when a
  custom invocation's wording says "build X", "create X", "write X", or "wire up X". Read all
  such wording as "cause X to be built": delegate it to an `implementer` (for in-unit phase work)
  or a `worker-bee` (for ad-hoc/tooling work outside a phase).
- The ONLY things you do with your own hands: invoke the spec-* skills, dispatch agents,
  read/inspect their output and artifacts, run **read-only self-checks** (e.g. run an existing
  script/tool and *view* its output artifacts to decide pass/fail), update your task list, and
  decide when to stop and ask. Running a command to observe results is fine; authoring the code
  that command runs is not.
- If a custom invocation seems to require you to author code, that is a delegation instruction,
  never a license to implement — spin up the appropriate agent and hand it a spec.

## Input contract

You'll be given either:

- A Why/idea and no existing unit — start fresh at step 1.
- An existing `specs/changes/NNN-slug/` path — read its `change.md` frontmatter `status:` and
  resume from the matching step below.

## Steps

1. **draft** — if no unit exists yet, invoke `/spec-new` with the given Why/idea; it drafts
   `change.md` at `status: draft`. Resolving real ambiguity is legal *before* the draft exists —
   the `/spec-new` interview may ask load-bearing scope/AC questions, and that's fine. Once the
   draft is written, apply judgment, not ceremony:
   - If a genuinely **load-bearing decision is still unresolved** — a real scope fork, an
     irreversible choice, or ambiguous intent the user must own — relay the draft and STOP for
     that decision.
   - Otherwise (scope already settled by your reading + any interview answers), **self-approve**:
     flip `status: approved` and continue to step 2. Still show the drafted `change.md` in your
     reply for the record — just don't block on it.
   - Do **not** stop merely to have the user flip `status: approved`, nor to confirm slug/ID
     naming or ask "looks good?" — status bookkeeping and naming are not critical matters. The
     bar for halting here is the same as every other gate: correctness or a choice only the user
     can make.
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

You judge critical vs non-critical at *every* gate, draft included — the same standard
throughout: halt only for correctness or a choice only the user can make.

- A load-bearing **unresolved draft decision** (step 1) — a real scope fork, irreversible
  choice, or ambiguous intent. NOT the mere act of approving the draft, and NOT slug/ID naming
  or "looks good?" — self-approve and continue when scope is already settled.
- A `spec-verifier` FAIL, or a human override being needed (step 4).
- A phase gate failure `/spec-run` reports as unresolved (step 3).
- A scope/out-of-scope conflict flagged by an implementer or verifier.

Everything else — self-approving a settled draft, dispatching `/spec-tasks`, `/spec-run`'s
phase-by-phase agent calls, a clean `/spec-verify` all-PASS, `/spec-close` — proceeds without a
prompt.

Any harness, tooling, or script a custom flow wants built is delegated (worker-bee); only its
*execution + artifact review* is yours to do by hand.

## Routing note

Only invoke this skill for work that will touch `src/**` or `specs/capabilities/**` — that's
what requires the full lifecycle. For everything else (research, one-off fixes outside those
paths, exploratory work), dispatch `worker-bee` or `scout-bee` directly instead of starting a
change unit.
