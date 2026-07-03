---
name: spec-verify
description: Spawn an independent spec-verifier agent against a change unit's diff and acceptance criteria, and summarize the resulting verification.md. Use after /spec-run reports a change unit implemented, before /spec-close. Do not use this to fix failures yourself in the same pass — that defeats the independent-check purpose.
---

Get an independent read on whether a change unit actually satisfies its acceptance criteria. This
skill's whole point is a fresh, uninvolved check — do not pre-analyze the diff yourself and hand
the verifier your conclusion; let it look cold.

## Steps

1. Confirm the change unit has been implemented (a `tasks.md` with all phases done, or the user
   says so) and figure out the diff range to hand the verifier: a commit range if already
   committed, otherwise "working tree".
2. Flip `change.md`'s frontmatter to `status: verifying` before dispatching.
3. Dispatch a `spec-verifier` agent (Agent tool, subagent_type `spec-verifier`) with: the change
   unit path and the diff range. Give it nothing else — no summary of what you think it will find.
4. Read the `verification.md` it writes (this is the **code-pass** filename; `/spec-close` later
   triggers a second, doc-pass verification written to `doc-verification.md` — never conflate the
   two files or overwrite one with the other).
5. If every AC is PASS and scope was respected: tell the user it's ready for `/spec-close`.
6. If anything is FAIL, or an out-of-scope edit was flagged: report the specific failures to the
   user verbatim (AC + evidence-or-lack-thereof) and stop — fixing failures is a new implementer
   phase (or a manual fix), followed by a **new** `spec-verify` pass. Never mark a change unit
   verified because "it's probably fine" or because the failures look minor.
7. **User override:** if the user wants to accept a FAIL verdict anyway (their call, not yours to
   argue away), edit that row in `verification.md` to `PASS (user override)` plus a short reason
   clause — the override must live in the artifact, not just in chat history.
