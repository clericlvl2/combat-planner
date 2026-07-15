---
id: platform
prefix: PLT
---

# Platform — offline, PWA, responsive, a11y, performance NFRs

Stack mechanism for PWA/offline/build: `specs/adr/ADR-004.md`, `ADR-007.md`, `ADR-010.md`
(telemetry). This file owns the observable behavior, not the implementation choice.

## PLT-1 — Offline-first

Every feature works with no network; offline is the default assumption, not a fallback. No
screen requires connectivity.

**AC:**
- With the network blocked, every feature still works and no runtime network call fires except
  the service worker's own update check ([[platform]] PLT-4, PLT-6).

## PLT-2 — Responsive, one-handed mobile

Mobile-first; layout adapts per breakpoint (mobile/tablet/desktop) with no feature desktop-only.
Primary actions stay reachable in the mobile thumb zone via bottom-right floating controls.
Touch targets ≥44px in all modes. Exact control placement per breakpoint:
[[../reference/component-inventory]].

On desktop, the Combat screen is a single centered column — extrapolated from the mobile
layout, not a distinct desktop composition — with the same combatant-card shape carried over
unchanged, just re-centered. The card shape itself is [[../reference/component-inventory]]'s to
own; this requirement does not restate that detail.

On desktop, Settings/About/the Combats list stay reachable from an open combat screen — the
desktop icon-nav destinations are not lost just because the Combat route renders its own header
component instead of the shared one ([[../reference/component-inventory]] for which component
renders the row on which screen).

**AC:**
- No feature is available on desktop but missing on mobile, or vice versa.
- On mobile, the screen's primary action is reachable via a bottom-right floating control.
- All interactive targets measure at least 44px on the touch axis.
- On desktop, the Combat screen renders as a single centered column (no split-pane), reusing
  the mobile card composition unchanged.
- On the desktop breakpoint, with a combat open, Settings/About/Combats-list remain reachable
  from the combat screen's header.

## PLT-3 — Navigation per breakpoint

Mobile: swipe-right reveals a sidebar with nav links. Tablet: header with burger menu. Desktop:
header with inline icon-button navigation. Destinations: Combats, Settings, About.

The create action follows the same per-breakpoint split as nav wherever a create-FAB exists: a
header "+" icon button on desktop, a FAB on mobile. Combat — Active's advance-turn control
follows the same desktop swap: on desktop (≥1024px) the Active header shows a `header-advance`
tonal roundel icon button; the Advance FAB is hidden at that breakpoint (`lg:hidden`). The FAB
and the header roundel remain mobile-only / desktop-only respectively — never both at once.

Combat screen chrome per breakpoint: Setup header is back + title + `⋮`, with two floating Add /
hold-to-start Start controls (FABs on mobile, icon buttons on desktop). Active header is back +
title + `⋮`, plus a round/escalation-die sub-bar rendered below the header chrome; on desktop
(≥1024px) the Active header also carries a `header-advance` roundel icon button, with the mobile
Advance FAB hidden at that breakpoint. Exact control placement:
[[../reference/component-inventory]].

**AC:**
- Swiping right on mobile opens a sidebar containing links to Combats, Settings, and About.
- Tablet shows a burger-menu header; desktop shows inline icon-button nav in the header (each
  icon carrying an `aria-label` and the current destination marked); both expose the same three
  destinations.
- Wherever a create-FAB exists, desktop shows an equivalent header "+" icon button instead.
- On desktop (≥1024px), Combat — Active shows a header Advance roundel icon button, and the
  mobile Advance FAB is hidden (`lg:hidden`); both the FAB and the header roundel remain present
  on mobile.

## PLT-4 — Installable PWA + update toast

The app is installable; a subtle install hint appears when eligible, shown **once** and
**dismissible** (dismissal persists via `installHintDismissed` so it never reappears); it runs
standalone after install. When a new version is cached, an "Update available — reload" toast
appears; reloading applies the update without data loss (data lives in IndexedDB, independent of
the service-worker cache). Placement: the update toast renders bottom-center, lifted above the
FAB/thumb zone; the install hint is a slim top banner. Neither ever overlaps the FAB or the Setup
start bar ([[../reference/component-inventory]]).

**AC:**
- The install hint appears at most once per device unless storage is cleared; dismissing it
  persists that choice.
- After install, the app launches standalone (no browser chrome).
- When an update is waiting, the reload toast appears; reloading applies it and all combats/
  settings are still present afterward.
- The update toast renders bottom-center and the install hint renders as a top banner; neither
  ever visually overlaps the FAB or the Setup start bar.

## PLT-5 — Accessibility (WCAG 2.1 AA)

Practical WCAG 2.1 AA: contrast in both themes, ≥44px touch targets (PLT-2), visible focus,
semantic labels, scalable text. Color tags and health states are never conveyed by color alone
except two deliberate, compensated exceptions: the combatant-type stripe (color + stripe count,
backed by an `aria-label` naming the type — see [[combatants]] CBT-1) and the combats-list
`ColorTagDot` (the dot's fill is the picked color with no accompanying label; the dot's letter
is the combat title's initial — a disambiguator, not a color signifier — so the picked color
itself carries no status information a user depends on).

**AC:**
- Every interactive control has a visible focus state and a semantic label.
- Every status conveyed by color (health state, color tags) also has a non-color signal
  (icon/label), except the combatant-type stripe (compensating `aria-label`) and the
  `ColorTagDot` (its color is decorative/organizational only, not itself a status).
- Both themes meet AA contrast for text and status colors, including the reverse/alarm HP bar.
  All three NumpadSheet commit buttons (Deal Damage, Restore HP, Set Temp HP) pass AA in both
  themes. ([[hp]] HP-3)

## PLT-6 — Privacy: no telemetry

No telemetry or analytics of any kind; no network calls for app function. Data never leaves the
device.

**AC:**
- The app makes zero network calls at runtime other than the service worker's own update check.

## PLT-7 — Reliability

An interrupted action (e.g. a reload mid-combat) must not corrupt existing combat state; all
state (combats, combatants, turn pointer, round, escalation, settings) persists locally across
reloads and updates.

**AC:**
- Reloading mid-write never leaves a combat in a partially-written or corrupted state; other
  combats are unaffected by an interrupted write to one.
- All persisted state survives a reload and an app update unchanged.

## PLT-8 — Performance at scale

Smooth interaction (no perceptible lag on HP edits, sort, turn advance) at the hard caps of 30
combatants per combat and 100 combats ([[../reference/limits]]); adding beyond either is blocked
(enforced by [[combatants]] CBT-3 and [[combats-list]] CLS-2 respectively).

**AC:**
- HP edits, sorting, and turn-advance remain responsive with a combat at the full 30-combatant
  cap.

## PLT-9 — Deployed & reachable

The production build is served as a static SPA over HTTPS at a public URL; a push to `main`
auto-deploys that URL. Mechanism: `@sveltejs/adapter-static` (`build/` output) hosted on Vercel
per `ADR-007`; no server runtime, no env secrets. The static host must also serve the SPA shell
(`index.html`) for any request with no matching static file — deep links, param routes
(`/combats/<id>`), and unknown paths alike — via a `vercel.json` catch-all rewrite applied after
the filesystem check, so client routing boots instead of the host returning its own 404. Without
this, real static assets (JS/CSS/icons/manifest) still resolve directly first; only requests that
match nothing on disk fall through to the rewrite.

**AC:**
- The production URL responds `200` over HTTPS and returns the app-shell HTML (adapter-static
  SPA shell) — verified at `https://combat-planner-five.vercel.app/`.
- A commit pushed to `main` produces a new production deployment at that URL (Vercel Git
  integration, dashboard-configured).
- `vercel.json` contains a catch-all rewrite sending unmatched requests to `/index.html`; a
  deep-link or hard reload to `/combats/<id>` (or any other client-only path) returns the
  app-shell HTML and boots client routing, not the host's own 404, while real static assets
  under `build/` still resolve directly.

## PLT-12 — Unknown-path recovery screen

A client route with no route match at all (e.g. `/combat`, `/foo`) renders a styled not-found
recovery screen with a visible, `aria-label`-labelled Back-to-Combats control — never SvelteKit's
default 404 page and never the PLT-10 thrown-error boundary (no error is thrown; there's simply
no matching route). Mechanism: a root `[...catchall]` route that only matches otherwise-unmatched
paths, so it never shadows a real route (`/combats`, `/combats/[id]`, `/settings`, `/about` all
still resolve to their own pages via SvelteKit's route-specificity rules) and never intercepts a
genuinely thrown error. `/combats/<bad-id>` keeps rendering the existing CLS-5 not-found screen
unchanged — the catch-all only ever sees paths with no route at all.

**AC:**
- Navigating to a path with no matching route (e.g. `/combat`, `/foo`) renders a styled
  not-found screen using app tokens, with a control that is both visibly labelled and carries an
  `aria-label`, and that navigates to `/combats` when activated.
- `/combats`, `/combats/[id]`, `/settings`, and `/about` still resolve to their own pages — the
  catch-all route never shadows a real route match.
- `/combats/<bad-id>` still renders the existing CLS-5 not-found screen ([[combats-list]] CLS-5),
  not the catch-all screen.
- A genuinely thrown error (e.g. the `/` load, `store.hydrate()`/Dexie access) still surfaces the
  PLT-10 `+error.svelte` boundary — the catch-all route contains no error-throwing logic and
  never intercepts a thrown error.

## PLT-10 — App-level error boundary

A thrown error in any route load (e.g. the `/` load) or in store hydration
(`store.hydrate()`/Dexie access) renders the app's own styled error surface — never SvelteKit's
default error page. The boundary lives inside the app shell chrome ([[platform]] PLT-1: still
offline-safe, no network dependency) and uses the same app tokens as every other screen. It
offers an explicit recovery action rather than a dead end. Mechanism: a route-level
`+error.svelte` reading the failed route's `page.error`/`page.status` from `$app/state`
(`ADR-007`).

**AC:**
- A route-level `+error.svelte` exists in the route tree and renders using app tokens/styling
  (not SvelteKit's default error page), reading `page.error`/`page.status` from `$app/state`.
- A thrown error in the `/` load or in `store.hydrate()`/Dexie access surfaces this boundary; the
  AppShell chrome remains present around it.
- The error surface is announced to assistive tech (`role="alert"`/`aria-live`) and offers a
  recovery action — a button with both a visible label and an `aria-label` — that either reloads
  the app or navigates to `/combats`.

## PLT-11 — Back-button dismisses transient overlays

On the combat screen, pressing the browser Back button closes the top-most open transient
overlay (Add / Edit / Numpad sheet) instead of leaving the route; only when no overlay is open
does Back leave the combat page. Opening a sheet pushes one history entry; the browser's
`popstate` event closes that sheet; closing a sheet normally (not via Back) consumes that history
entry itself so it never pollutes forward-history navigation. Model boundary: sheets are not
stacked today — at most one is open at a time, so "top-most" has at most one candidate.

**AC:**
- With an Add / Edit / Numpad sheet open on `/combats/[id]`, a browser Back gesture closes that
  sheet and stays on the combat page.
- With no sheet open, a browser Back gesture leaves the combat page as normal.
- Opening a sheet pushes exactly one history entry; closing it via the sheet's own close control
  (not Back) removes that entry rather than leaving a stray forward-history entry.
