---
status: archived
backlog: —
---

# Change: routing-fallback-not-found

## Why

Routing is broken on the Vercel deploy. `vercel.json` sets `framework: null` with no rewrites, so
Vercel serves `build/` as pure static files: any deep link or hard reload to a client-only path
(`/combats/<id>`, `/combat`, `/foo`) looks for a matching static file, finds none, and returns
**Vercel's own 404** — the SPA shell (`build/index.html`, emitted by `adapter-static`'s
`fallback`) is never served, so the app never boots and none of the app's own recovery screens
(the CLS-5 not-found, the PLT-10 boundary) ever get a chance to render. Works locally only because
Vite's dev server auto-serves the fallback.

Two things follow: (1) the static host must serve the SPA shell for unmatched/deep-link paths so
client routing boots at all; (2) once it boots, a truly unknown path (no route match, e.g.
`/combat`) currently lands on the PLT-10 "Something went wrong" boundary — the user wants those to
show a styled not-found + Back-to-Combats recovery screen instead. Bad combat ids keep the
existing CLS-5 styled not-found screen (user likes it; it was simply unreachable on deploy).

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `PLT-9` | amend: the production static host must serve the SPA shell (`index.html`) for any path with no matching static file (deep links, param routes, unknown paths), so client routing boots instead of returning the host's 404. Adds a catch-all rewrite in `vercel.json` (applied after the filesystem check, so real static assets still serve directly). |
| `PLT-12` | new requirement: a client route with **no route match** (e.g. `/combat`, `/foo`) renders a styled not-found recovery screen with a visible, labelled Back-to-Combats control — not SvelteKit's default 404 and not the PLT-10 thrown-error boundary. Implemented as a root `[...catchall]` route so it only matches otherwise-unmatched paths and never shadows real routes. |

CLS-5 (bad combat id → styled not-found screen) and PLT-10 (thrown-error boundary) are unchanged
in behavior; the PLT-9 fix only makes CLS-5's screen reachable on deploy.

## Acceptance criteria

- [ ] `vercel.json` contains a catch-all rewrite that sends any unmatched request to `/index.html`
      (SPA fallback). Real static assets (JS/CSS/icons/manifest under `build/`) still resolve
      directly — the rewrite applies only after the filesystem check (Vercel default).
- [ ] A deep-link / hard-reload to a client-only path (`/combats/<any-id>`) resolves to the
      app-shell HTML and boots client routing, rather than returning the host's 404 — evidenced by
      the fallback rewrite covering param and unmatched paths.
- [ ] A root client catch-all route (`src/routes/[...catchall]/+page.svelte` or equivalent) exists
      and renders a styled not-found state using app tokens, including a visible **and**
      `aria-label`-labelled control that navigates to `/combats`.
- [ ] The catch-all does not shadow real routes: `/combats`, `/combats/<id>`, `/settings`,
      `/about` still resolve to their own pages (SvelteKit route specificity — catch-all matches
      only otherwise-unmatched paths). `/combats/<bad-id>` still renders the existing CLS-5
      not-found screen, not the catch-all.
- [ ] Genuine thrown errors (`/` load, `store.hydrate()`/Dexie access) still surface the PLT-10
      `+error.svelte` boundary — the catch-all handles no-route-match only, never thrown errors.
- [ ] Copy for the unknown-path screen is localized: new i18n key(s) for the page-not-found title
      (distinct from `combat.notFound.*`, which reads "Combat not found") added to all 6
      `messages/*.json` locales; `src/lib/paraglide/*` is regenerated, never hand-edited.
- [ ] `npm run gate` passes (lint + check + test:unit --run + build).

## Out of scope

- No change to the CLS-5 combat-not-found screen's behavior or markup — only reachable-on-deploy
  is affected, via the PLT-9 fix. Bad combat ids are NOT redirected to home (user chose the styled
  screen over a redirect).
- No change to PLT-10's thrown-error boundary behavior.
- No redirect-to-home logic for either bad ids or unknown paths (decision: styled not-found, not
  redirect).
- No changes to domain/store/combat/HP/initiative logic or any capability outside PLT.
- No switch away from `adapter-static` to `adapter-vercel`; the fix is a host rewrite, not an
  adapter change (ADR-007 stands).
- Migrating the shared not-found visual into a reusable component is permitted for DRY but not
  required; if extracted, it must not alter CLS-5's rendered output.
