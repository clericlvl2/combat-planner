# Tasks: deploy-vercel

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Infra-only unit: no `src/**` changes. Phase 1 is implementer-runnable; Phase 2 is manual operator
work (Vercel dashboard) that `/spec-run` cannot execute — do it by hand and check off. The
`PLT-9` requirement is added to `platform.md` at `/spec-close` by doc-syncer, not here.

## Phase 1 — Pin static build for Vercel

**Owns:** `vercel.json`
**Parallel-safe with:** none

- [x] Create `vercel.json` at repo root with:
  - `buildCommand: "npm run build"`
  - `outputDirectory: "build"`
  - `framework: null` (stop Vercel applying its SvelteKit/adapter-vercel preset; serve the
    adapter-static bundle as plain static + SPA fallback)
- [x] Run `npm run build`; confirm it emits `build/index.html` (the adapter-static SPA fallback
      shell), proving `outputDirectory` matches real output. (AC: PLT-9 build/output)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Deploy & verify (manual operator — not an implementer phase)

**Owns:** `specs/changes/008-deploy-vercel/deploy-notes.md`
**Parallel-safe with:** none (depends on Phase 1 landing on the branch/main)

Manual steps — `/spec-run` skips this phase; the operator does these in the Vercel dashboard/CLI:

- [x] Connect `clericlvl2/combat-planner` to Vercel via Git integration; set Production Branch =
      `main`. Confirm `vercel.json` is picked up (no framework preset override).
- [x] Trigger a production deploy (merge/push to `main`); confirm a new deployment appears and
      succeeds. (AC: PLT-9 push-to-main auto-deploys)
- [x] `curl -I <prod-url>` returns `200` over HTTPS and the body is the app shell HTML.
      (AC: PLT-9 reachable)
- [x] Record the production URL + deploy dashboard link in `deploy-notes.md` so spec-verifier can
      curl it and spec-close can cite it.

**Gate:** no code gate (docs/notes only); the AC verification above is the gate.
