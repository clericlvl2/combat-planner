---
id: platform
prefix: PLT
---

# Platform — offline, PWA, responsive, a11y, performance NFRs

Sources: `PRD` §4 (decisions 19, 20, 21), §6 Epic A (A1–A5, A8), Epic B (B1, B2), §7
(non-functional requirements), §8 (Risks) · `Data Model` §2 (`installHintDismissed`), §10
(persistence/interrupted write) · `UX & IA` §2 (Navigation), §7 (Responsive behavior), §8
(toast/install/a11y) · `Test Plan` §5 (offline, PWA update E2E), §6 (A1–A5, A8, B1/B2 rows).

Stack mechanism for PWA/offline/build: `docs/adr/ADR-004.md`, `ADR-007.md`, `ADR-010.md`
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

**AC:**
- No feature is available on desktop but missing on mobile, or vice versa.
- On mobile, the screen's primary action is reachable via a bottom-right floating control.
- All interactive targets measure at least 44px on the touch axis.

## PLT-3 — Navigation per breakpoint

Mobile: swipe-right reveals a sidebar with nav links. Tablet: header with burger menu. Desktop:
header with inline navigation. Destinations: Combats, Settings, About.

**AC:**
- Swiping right on mobile opens a sidebar containing links to Combats, Settings, and About.
- Tablet shows a burger-menu header; desktop shows inline nav links in the header; both expose
  the same three destinations.

## PLT-4 — Installable PWA + update toast

The app is installable; a subtle install hint appears when eligible, shown **once** and
**dismissible** (dismissal persists via `installHintDismissed` so it never reappears); it runs
standalone after install. When a new version is cached, an "Update available — reload" toast
appears; reloading applies the update without data loss (data lives in IndexedDB, independent of
the service-worker cache).

**AC:**
- The install hint appears at most once per device unless storage is cleared; dismissing it
  persists that choice.
- After install, the app launches standalone (no browser chrome).
- When an update is waiting, the reload toast appears; reloading applies it and all combats/
  settings are still present afterward.

## PLT-5 — Accessibility (WCAG 2.1 AA)

Practical WCAG 2.1 AA: contrast in both themes, ≥44px touch targets (PLT-2), visible focus,
semantic labels, scalable text. Color tags and health states are never conveyed by color alone
except the combatant-type stripe, which is a deliberate, compensated exception (color + stripe
count, backed by an `aria-label` naming the type — see [[combatants]] CBT-1).

**AC:**
- Every interactive control has a visible focus state and a semantic label.
- Every status conveyed by color (health state, color tags) also has a non-color signal
  (icon/label), except the combatant-type stripe, which instead carries a compensating
  `aria-label`.
- Both themes meet AA contrast for text and status colors, including the reverse/alarm HP bar.

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
