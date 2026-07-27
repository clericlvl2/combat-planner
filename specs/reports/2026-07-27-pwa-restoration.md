# Verification: restore PWA offline and install (W-033)

**Status:** e2e-verified and code-complete (2026-07-27); the manual production/device pass listed
at the end is **NOT YET RUN** and blocks closing the row.
**Date:** 2026-07-27
**Plan:** `.claude/plans/2026-07-27-restore-pwa-offline-install.md`

## Pre-fix evidence (verified 2026-07-27)

Checked against both the local `build/` output and live production
(`https://combat-planner-five.vercel.app/`, 2493 bytes, byte-identical to `build/index.html` at
the time):

- `build/index.html` had **zero** matches for `serviceWorker`, `registerSW`, `sw.js`, or
  `rel="manifest"`. The service worker never registered; the app was not installable.
- `build/sw.js` precached 46 entries (JS/CSS/icons/`manifest.webmanifest`) with **no `.html` entry
  at all**, so even a registered worker had no app shell to serve offline.
- `src/lib/pwa/register.ts` was a comment-only placeholder (`export {}`, `TODO M-phase`).

## Three independent root causes

1. **No head injection / registration.** `@vite-pwa/sveltekit` injects nothing into HTML on its
   own — inspected `node_modules/@vite-pwa/sveltekit/dist/index.mjs` (no `transformIndexHtml`, no
   `%sveltekit.head%` handling). The app has to wire `virtual:pwa-register/svelte` itself; that
   work was deferred and never done.
2. **Fallback HTML missing from the precache manifest.** `adapter-static` writes `index.html`
   during its `adapt()` step, which runs *after* the PWA plugin's `closeBundle`, so workbox globbed
   a `client/` tree where the fallback didn't exist yet. Fixed with
   `kit: { spa: true, adapterFallback: 'index.html' }`, which makes the plugin synthesize the
   missing precache entry itself.
3. **Placeholder icons.** `static/icons/` held only two SVGs; Android commonly declines
   `beforeinstallprompt` without raster (PNG) icons in the manifest.

## What each phase changed (commits `517cd73`..`9dcdbec`)

- **Phase 1** (`517cd73`, `vite.config.ts`) — `kit.spa`/`kit.adapterFallback`, `globPatterns`
  scoped to `client/**` with font extensions restored, `workbox.navigateFallback: '/index.html'`.
  Precache went from 46 entries with no shell to 47 including `index.html`.
- **Phase 2** (`47663a6`, `src/lib/pwa/register.ts`, `src/routes/+layout.svelte`, `src/app.html`) —
  `register.ts` wraps `useRegisterSW` from `virtual:pwa-register/svelte`, exposing `needRefresh`
  and `updateServiceWorker`. `+layout.svelte` raises a non-expiring "update available" sonner
  toast on `needRefresh`, kept outside the `{#key language}` subtree so a language switch can't
  re-fire it. **The manifest `<link>` is static in `src/app.html`, not injected from
  `<svelte:head>`** — see the deviation below.
- **Phase 3** (`8636169`, `src/lib/components/app/InstallBanner.svelte`, `AppShell.svelte`) — new
  `InstallBanner` mounted once in `AppShell`, capturing `beforeinstallprompt`, gated on
  `!installHintDismissed` and not-standalone, once-and-dismissible via
  `store.updateSettings({ installHintDismissed: true })`.
- **Phase 4** (`9dcdbec`, `vite.config.ts`, `static/icons/*`, `package.json`) — `@vite-pwa/assets-generator`
  (dev dep) generates `pwa-192x192.png`, `pwa-512x512.png`, `pwa-512x512-maskable.png` from the
  existing placeholder SVGs; all three added to `manifest.icons` alongside the SVG entries.
  Precache went from 47 to 50 entries.
- **Phase 5** (this unit) — `e2e/pwa.e2e.ts` (new Playwright spec), `vercel.json` (`sw.js`
  cache-control header), this report.

Post-fix state (verified against a fresh `npm run build`, 2026-07-27): precache **50 entries**
including `url:"index.html"` and all five icon files; exactly one `rel="manifest"` in
`build/index.html`; `sw.js` wires a `NavigationRoute(createHandlerBoundToURL("/index.html"))`.

## Plan deviation: the manifest `<link>` moved from `<svelte:head>` to `src/app.html`

The plan (Phase 2) specified injecting `<link rel="manifest">` via `<svelte:head>` in
`+layout.svelte`, driven by `pwaInfo` from `virtual:pwa-info`. That was tried first and does not
work: `src/routes/+layout.ts` sets `export const ssr = false` (ADR-007), so adapter-static renders
the SPA fallback shell with SvelteKit's `ssr` forced off for that render — `<svelte:head>` content
from `+layout.svelte` never reaches `build/index.html`, only the client bundle at hydration. Since
the manifest link has to be present in the *static* HTML for a browser (or crawler) to discover
installability without running JS first, `<svelte:head>` cannot deliver it here regardless of
timing.

Two fixes were available: a static `<link rel="manifest">` in `src/app.html` (chosen), or setting
`prerender = true` on the root layout so SSR runs for the fallback. The second would have
contradicted ADR-007's "client-only SPA, `prerender = false` everywhere" for a one-line gain, so
the user chose the static link. Service-worker **registration** itself stays in `register.ts` and
runs at hydration in client JS — that's correct as-is and needs no static HTML presence, since
registration doesn't need to exist before first paint.

## Phase 5 in detail

### `e2e/pwa.e2e.ts`

Three tests, run against `vite preview` (a real, non-mocked service worker —
`devOptions.enabled: false` only suppresses it in dev and Vitest):

1. **Manifest link + icons.** Asserts exactly one `link[rel="manifest"]`, fetches its `href`, and
   asserts the parsed manifest's `icons` array has at least one `image/png` entry.
2. **SW registers and activates.** Gates on `navigator.serviceWorker.ready` resolving with
   `registration.active !== null` — never a timeout. For a workbox `generateSW` build, `activate`
   only fires after the `install` event's `precacheController.install()` has settled, so by the
   time `ready` resolves the precache is guaranteed populated, not just the registration existing.
3. **Offline shell serving.** After confirming `navigator.serviceWorker.ready`, sets
   `context.setOffline(true)` and does two **full (non-SPA) navigations**: `goto('/')` (root) and
   `goto('/settings')` (a second in-scope route, reached by a real document load rather than
   client-side routing). Both assert `body` stays visible — i.e. the SW's `navigateFallback` serves
   the cached shell rather than the browser showing a `net::ERR_INTERNET_DISCONNECTED` page.

**Deliberate scope-narrowing, and why:** the plan asked for the offline deep-link case to be tested
against a `/combats/<id>` route specifically. That could not be made reliable in this harness and
was dropped in favor of `/settings`. Root cause, investigated directly (not guessed): `vite
preview` — which is what Playwright's `webServer` runs, per `playwright.config.ts` — rewrites the
built HTML's `import(...)` specifiers and inline `base` computation to be **relative to the
request's path depth on every response**, even though the actual file on disk
(`build/index.html`) uses **absolute** `/_app/...` paths. Verified two ways:
- `grep` on `build/index.html` directly: `import("/_app/immutable/entry/start...")` (absolute).
- `curl`ing `vite preview` for `/` vs `/combats/<uuid>` returns `./_app/...` and `../_app/...`
  respectively — different relative depths for the same cached document.
- Confirmed this is a `vite preview`-only artifact, not a production concern: serving the same
  `build/` directory with `sirv build --single index.html` (a plain static file server, the same
  serving model Vercel uses) returns the literal absolute `/_app/...` paths at every depth, with no
  per-request rewriting.

Because workbox's `generateSW` precaching fetches `/` once at SW-install time and caches that exact
response body, the cached shell carries `vite preview`'s depth-0-relative markup (`./_app/...`).
Serving that same cached body offline for a **two-segment** route (`/combats/<uuid>`, which the
URL-resolution algorithm treats as a file whose "directory" is `/combats/`) resolves `./_app/...`
to `/combats/_app/...` — a 404, so the dynamic `import()` that boots the client throws and the app
never hydrates (confirmed via `page.on('pageerror')`: `Failed to fetch dynamically imported module
... /combats/_app/immutable/entry/start....js`). The **same test against a one-segment route**
(`/settings`, `/combats` list) resolves correctly and reliably passes, because a one-segment path's
implied "directory" already matches root. This reproduced identically and deterministically across
repeated runs — it is not a race, it's a structural mismatch specific to `vite preview`'s dev/test
convenience behavior, which does not exist in the production static file on Vercel (absolute paths,
no per-request rewriting, no depth dependency at all).

Fixing the root cause is out of this phase's scope (`vite.config.ts` isn't in Phase 5's file
ownership, and the config change would be a `preview`-mode-only workaround for a preview-only
symptom, not a real product bug). It is called out explicitly in the manual verification checklist
below instead, since production is expected to behave correctly (absolute paths at every depth) and
the manual pass is the way to confirm that expectation against a real deploy.

**Result:** `npx playwright test` — 8/8 passing (`smoke.e2e.ts` × 2 projects, `pwa.e2e.ts` × 3
tests × 2 projects), run **three times** against three independent fresh
`npm run build && npm run preview` cycles, no flake observed.

### `vercel.json`

Added:

```json
"headers": [
  {
    "source": "/sw.js",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
  }
]
```

`buildCommand`, `outputDirectory`, `framework`, and `rewrites` are untouched. Rationale: a CDN- or
browser-cached stale `sw.js` is the one failure mode here that's genuinely hard to recover from
remotely — this header forces every fetch of `sw.js` to revalidate, so the update-toast flow
(Phase 2) can always find a newer worker.

## What the e2e spec genuinely proves, versus what rests on the manual pass

**Proven by `e2e/pwa.e2e.ts` (automated, reproducible):**
- The manifest link is present in the served document and the manifest is fetchable and lists PNG
  icons.
- The service worker registers and reaches `active` state (which for this build implies precaching
  completed).
- With the worker active and the network cut, a fresh document navigation to a **one-segment**
  in-scope route (root `/` and `/settings`) is served from cache rather than failing with a browser
  network error.

**NOT proven by e2e, and resting entirely on the manual pass below:**
- Offline behavior for **two-segment routes** (`/combats/<id>`) specifically — the actual "resume a
  bookmarked/PWA-launched combat while offline" scenario the feature exists for. Reasoned above to
  be sound in production (absolute asset paths, no depth dependency), but this is inference from a
  static file diff and a `sirv` cross-check, not a direct on-device confirmation.
- `beforeinstallprompt` and the InstallBanner's real eligibility — Playwright cannot fire this event
  on demand, so the banner's Svelte-level render logic has its own component spec
  (`InstallBanner.svelte.spec.ts`, Phase 3), but whether Android actually offers installation for
  this manifest/icon set is unverified by any automated test.
- The update-toast flow surviving a real redeploy (`needRefresh` firing and `updateServiceWorker`
  reloading with IndexedDB intact) — the toast wiring is code-reviewed and the underlying store
  survives a *manual* SW-update in Phase 2's own testing note, but there is no automated
  redeploy-and-observe-the-toast test, nor should there be (it requires two distinct builds served
  in sequence).
- Anything about real Android/Chrome install-to-home-screen behavior: icon rendering on the home
  screen, standalone `display-mode` detection in practice, or airplane-mode behavior on an actual
  device rather than Playwright's simulated `context.setOffline(true)`.

## Manual production verification checklist — NOT YET RUN

This entire section is **unverified**. It requires the user's real Android device against the live
Vercel deploy and cannot be performed by an agent or by CI. Do not treat any item below as passing
until it has actually been run and its result recorded here.

- [ ] Manifest link present in production `view-source:` of the deployed `/` (and ideally of a
      `/combats/<id>` URL, to confirm the static `app.html` link survives the SPA fallback at
      depth).
- [ ] Service worker registers and reaches `activated` in DevTools → Application → Service Workers
      on the production origin.
- [ ] Airplane mode, then reload of the app's root URL → app shell loads, last-open combat visible.
- [ ] Airplane mode, then open a **saved/bookmarked** `/combats/<id>` URL directly (not via in-app
      navigation) → renders the combat, does not show a browser offline error page. This is the
      specific case `e2e/pwa.e2e.ts` could not cover (see above) — it is the highest-priority item
      on this checklist.
- [ ] Install to home screen succeeds (Chrome offers "Add to Home Screen" / the `InstallBanner`
      fires); the installed icon shows the expected (placeholder) artwork, not a generic globe/blank
      icon.
- [ ] After a redeploy, relaunching the installed PWA (or reloading a tab) shows the "update
      available" toast; tapping its action reloads and the app comes back with existing combats
      intact (verifies `updateServiceWorker(true)` + IndexedDB survival together, not just each in
      isolation).

## Files

- `vite.config.ts` — Phase 1 (`kit.spa`, `adapterFallback`, `workbox.globPatterns`,
  `navigateFallback`), Phase 4 (PNG manifest icons)
- `src/lib/pwa/register.ts` — Phase 2
- `src/app.html` — Phase 2 (static manifest `<link>`, deviation above)
- `src/routes/+layout.svelte` — Phase 2 (update toast)
- `src/lib/components/app/InstallBanner.svelte`, `AppShell.svelte` — Phase 3
- `static/icons/*.png`, `static/icons/README.md` — Phase 4
- `package.json` — Phase 4 (`@vite-pwa/assets-generator` dev dep)
- `e2e/pwa.e2e.ts` — Phase 5 (this unit)
- `vercel.json` — Phase 5 (this unit)
