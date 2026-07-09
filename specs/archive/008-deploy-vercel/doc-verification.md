# Doc verification: 008-deploy-vercel

| Check | Verdict | Evidence |
|----|---------|----------|
| `platform.md` PLT-9 requirement text matches `change.md`'s What-changes row (static SPA over HTTPS, public URL, push-to-main auto-deploy, `@sveltejs/adapter-static`/`build/` output, Vercel, ADR-007, no server runtime/no env secrets) | PASS | `specs/capabilities/platform.md:127-131`: "## PLT-9 — Deployed & reachable / The production build is served as a static SPA over HTTPS at a public URL; a push to `main` auto-deploys that URL. Mechanism: `@sveltejs/adapter-static` (`build/` output) hosted on Vercel per `ADR-007`; no server runtime, no env secrets." — verbatim match to `change.md`'s `PLT-9` row. |
| PLT-9 ACs match `change.md` / `verification.md`-confirmed facts (200/HTTPS/app-shell HTML; push-to-main auto-deploy via Vercel Git integration, dashboard-configured) | PASS | `platform.md:133-136`: "The production URL responds `200` over HTTPS and returns the app-shell HTML (adapter-static SPA shell) — verified at `https://combat-planner-five.vercel.app/`." and "A commit pushed to `main` produces a new production deployment at that URL (Vercel Git integration, dashboard-configured)." Matches `verification.md`'s two corresponding PASS rows (curl 200/HTTPS/app-shell evidence; dashboard-configured auto-deploy). |
| PLT-9 does not overstate scope (no PWA-install/offline claim) | PASS | No mention of "install", "offline", "precache", or "PWA" anywhere in the new PLT-9 block (`platform.md:127-136`) — confirmed via read of the added lines. Matches `change.md`'s Out-of-scope declaration that PWA-install/offline is deferred to M4. |
| PLT-9 follows existing PLT-* ID/formatting convention | PASS | Sibling headers PLT-1..8 (`platform.md:11,20,39,62,81,98,106,117`) all use `## PLT-N — Title` + prose paragraph + `**AC:**` bullet list; PLT-9 (`platform.md:127`) follows the identical structure and is the correct next sequential ID (8→9, no gap/collision). |
| `CHANGELOG.md` gained exactly one new row for unit 008, format matching sibling rows | PASS | Single new line added: `| 008-deploy-vercel | 2026-07-09 | Production build deployed and reachable: ... |` — matches the `| Unit | Date | Change |` structure and backtick-quoting style of rows 001-007. Only one row added (`git diff` shows a single `+` line in the Change-units table). |
| No files outside `platform.md` / `CHANGELOG.md` touched by this doc diff | PASS | `git status --porcelain` shows other pending changes (`change.md`, `tasks.md`, `verification.md`, `deploy-notes.md`) but those belong to the code-verification pass, not the doc-syncer's diff; `git diff specs/capabilities/platform.md specs/CHANGELOG.md` touches only the two named files, confirming the doc-syncer's edit set is scoped correctly. |

## Scope check
In-scope only — doc-syncer's diff is confined to `specs/capabilities/platform.md` and `specs/CHANGELOG.md`, both declared targets.

## Other findings
None. No contradiction with unrelated capability ACs; PLT-1..8 text unchanged (diff shows pure addition, no edits to existing sections).
