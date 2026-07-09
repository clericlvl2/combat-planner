# Verification: 008-deploy-vercel

| AC | Verdict | Evidence |
|----|---------|----------|
| PLT-9 — `vercel.json` pins buildCommand/outputDirectory/framework:null | PASS | `vercel.json` (repo root, introduced in commit `d832b4c`): `{"buildCommand": "npm run build", "outputDirectory": "build", "framework": null}` |
| PLT-9 — `npm run build` emits `build/index.html` matching pinned outputDirectory | PASS | Ran `npm run build` locally (2026-07-09): completed via `@sveltejs/adapter-static`, log line `Wrote site to "build"`; confirmed `build/index.html` exists (1966 bytes, timestamp Jul 9 23:08) |
| PLT-9 — production URL responds 200 over HTTPS with app-shell HTML | PASS | `curl -sI https://combat-planner-five.vercel.app/` → `HTTP/2 200`, `server: Vercel`, `strict-transport-security` (HSTS) present; `curl -s` body starts `<!doctype html>` with `/_app/immutable/entry/start...js` modulepreload + `__sveltekit_` bootstrap script — matches adapter-static SPA shell. Matches recorded evidence in `deploy-notes.md`. Verified independently, not just trusted from notes. |
| PLT-9 — push to `main` auto-deploys (Vercel Git integration) | PASS (documented, not diff-verifiable) | `deploy-notes.md`: "Vercel Git integration connected; Production Branch = `main`... Dashboard link: Vercel project `combat-planner` (operator-held; not diff-visible)." This is dashboard-configured per change.md's own note ("This step is dashboard-configured, not diff-visible") — cannot be confirmed from the repo diff alone; taking the operator's record as the only available evidence, consistent with the AC's own caveat. |
| PLT-9 — `platform.md` gains PLT-9 requirement (synced at spec-close) | NOT YET PRESENT (expected) | `grep -n "PLT-9" specs/capabilities/platform.md` returned no match. Per dispatch instructions this is expected at this stage (doc-syncer adds it at `/spec-close`), not a FAIL. |

## Scope check

In-scope only. Diff touches exactly:
- `vercel.json` (repo root) — committed in `d832b4c`
- `specs/changes/008-deploy-vercel/change.md` (working tree, modified — checkbox state)
- `specs/changes/008-deploy-vercel/tasks.md` (working tree, modified — checkboxes checked off)
- `specs/changes/008-deploy-vercel/deploy-notes.md` (working tree, new file)

No `src/**` edits found (`git status --porcelain` confirms only the four files above are
touched). This matches the change unit's declared ownership and the "no src/** changes" out-of-scope
declaration.

## Other findings

None. No regressions detected; `npm run build` completed cleanly with adapter-static/PWA output
as expected under ADR-004/ADR-007. The live URL's body was independently curled (not just taken
from `deploy-notes.md`) and matches the adapter-static SPA shell described.
