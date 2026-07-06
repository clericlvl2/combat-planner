---
status: in-progress
backlog: —
---

# Change: deploy-vercel

## Why

Get a live HTTPS URL so the app can be dogfooded on a real phone instead of a localhost tab —
touch, mobile layout, and one-handed use only surface on a real device served over HTTPS.
Promotes the roadmap **Ship v1** milestone (`specs/backlog.md`), taken early and out of milestone
order (M4 PWA / M6 CI-gate not yet shipped) — deliberately deploy-only, see Out of scope.

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `PLT-9` | new requirement — **Deployed & reachable.** The production build is served as a static SPA over HTTPS at a public URL; a push to `main` auto-deploys that URL. Mechanism: `@sveltejs/adapter-static` (`build/` output) hosted on Vercel per `ADR-007`; no server runtime, no env secrets. |

## Acceptance criteria

- [ ] `PLT-9` — A `vercel.json` at repo root pins `buildCommand: "npm run build"`,
      `outputDirectory: "build"`, and `framework: null` (so Vercel serves the adapter-static
      bundle instead of applying its SvelteKit/adapter-vercel preset).
- [ ] `PLT-9` — `npm run build` emits `build/index.html` (the adapter-static SPA fallback shell),
      confirming the pinned `outputDirectory` matches real build output.
- [ ] `PLT-9` — The production URL responds `200` over HTTPS and returns the app shell HTML
      (verifiable via `curl` once the URL is recorded in the unit).
- [ ] `PLT-9` — A commit pushed to `main` produces a new production deployment at that URL
      (Vercel Git integration configured; verified from the Vercel deployment list / a fresh
      commit landing live). This step is dashboard-configured, not diff-visible.
- [ ] `PLT-9` — `platform.md` gains the `PLT-9` requirement with its AC (synced at spec-close).

## Out of scope

- **PWA install / offline verification** — installable-over-HTTPS, update toast, precache
  (`PLT-4`) belong to **M4**; this unit makes no PWA-install claim even though HTTPS is a
  prerequisite for it.
- **CI test-gate on deploy** — wiring `npm run gate` as a required check before Vercel promotes
  (M6). This unit only sets up build + host; it does not block deploys on tests.
- **Adapter swap** — stays `adapter-static` per ADR-007; no move to `adapter-vercel`.
- **Custom domain / analytics / env secrets** — default `*.vercel.app` URL; ADR-010 (no
  telemetry) and ADR-007 (no secrets) unchanged.
- **App source / feature code** — no `src/**` behavior changes; infra + one doc requirement only.
