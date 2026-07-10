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

**AC:**
- No feature is available on desktop but missing on mobile, or vice versa.
- On mobile, the screen's primary action is reachable via a bottom-right floating control.
- All interactive targets measure at least 44px on the touch axis.
- On desktop, the Combat screen renders as a single centered column (no split-pane), reusing
  the mobile card composition unchanged.

## PLT-3 — Navigation per breakpoint

Mobile: swipe-right reveals a sidebar with nav links. Tablet: header with burger menu. Desktop:
header with inline icon-button navigation. Destinations: Combats, Settings, About.

The create action follows the same per-breakpoint split as nav wherever a create-FAB exists: a
header "+" icon button on desktop, a FAB on mobile. Combat — Active's advance-turn and
jump-to-turn controls follow the same desktop swap: on desktop (≥1024px) the Active header shows
`header-advance`/`header-jump` tonal roundel icon buttons; the Advance FAB and the Jump pill are
hidden at that breakpoint (`lg:hidden`). Both the FAB/pill pair and the header roundels remain
mobile-only / desktop-only respectively — never both at once.

Combat screen chrome per breakpoint: Setup header is back + title + `⋮`, with two floating Add /
hold-to-start Start controls (FABs on mobile, icon buttons on desktop). Active header is back +
title + `⋮`, plus a round/escalation-die sub-bar rendered below the header chrome; on desktop
(≥1024px) the Active header also carries `header-advance`/`header-jump` roundel icon buttons,
with the mobile Advance FAB and Jump pill hidden at that breakpoint. Exact control placement:
[[../reference/component-inventory]].

**AC:**
- Swiping right on mobile opens a sidebar containing links to Combats, Settings, and About.
- Tablet shows a burger-menu header; desktop shows inline icon-button nav in the header (each
  icon carrying an `aria-label` and the current destination marked); both expose the same three
  destinations.
- Wherever a create-FAB exists, desktop shows an equivalent header "+" icon button instead.
- On desktop (≥1024px), Combat — Active shows header Advance/Jump roundel icon buttons, and the
  mobile Advance FAB and Jump pill are hidden (`lg:hidden`); both the FAB/pill pair and the
  header roundels remain present on mobile.

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
per `ADR-007`; no server runtime, no env secrets.

**AC:**
- The production URL responds `200` over HTTPS and returns the app-shell HTML (adapter-static
  SPA shell) — verified at `https://combat-planner-five.vercel.app/`.
- A commit pushed to `main` produces a new production deployment at that URL (Vercel Git
  integration, dashboard-configured).
