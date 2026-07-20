# Investigation: progressive nav lag + Settings won't open

**Status:** unconfirmed root cause — needs runtime repro before any fix. Backlog W-028.
**Date:** 2026-07-20

## Symptom (user report)

App gets progressively laggy after moving back and forth between pages. Eventually opened
Settings and could not select language or theme — the selectors "didn't open." HP was barely
touched during the session (3–5 hpLog entries at most).

## Ruled out

- **Unbounded `hpLog` deep-clone** (initial theory) — dead. Cost scales with hpLog length; with
  only 3–5 entries the per-action `structuredClone` (`undo.ts:14`) / `$state.snapshot`
  (`combat-store.svelte.ts:60`) / Dexie write are cheap. Not the driver.
- **Listener / timer / subscription leaks** — none. No `liveQuery`, `setInterval`,
  `requestAnimationFrame`, `ResizeObserver`/`IntersectionObserver`/`MutationObserver` anywhere in
  `src/`. `popstate` listener (`combats/[id]/+page.svelte:98`) and theme `matchMedia`
  (`theme.ts` via `+layout.svelte:18`) are cleanup-paired. `svelte:window` swipe listeners
  (`NavSidebar`) auto-remove and mount once (AppShell singleton). dnd zone (`CombatList`) is a
  standard cleanup-on-destroy `use:` action.
- **Effect loops / expensive derives** — no `$effect` writes state it also reads; list re-sort is
  bounded (≤100 combats).

## Current hypothesis — stuck overlay body-lock (needs confirmation)

The app stacks bits-ui overlays that portal into `<body>` and apply a scroll-lock +
`pointer-events: none` on body while open: nav Sheet (`NavSidebar`), numpad Sheet, add/edit
Dialogs (`combats/[id]/+page.svelte`), and the Settings Select popovers. The combat page also
drives overlays through `history.pushState` / `history.back()` (`combats/[id]/+page.svelte:98-113`).

Likely failure mode fitting both symptoms: an overlay torn down by route navigation (or the
history back/forward dance) **mid-close**, so bits-ui never releases the ref-counted body lock.
Stuck lock ⇒ page feels progressively dead to clicks, then fully unclickable — Settings Select
included ("didn't open"). Concrete trigger: navigating away with numpad/edit open never
reconciles the pushed history entry (`overlayHistoryPushed` orphans, `+page.svelte:103-113`).

## Next step (required before fixing)

Runtime repro: launch app, bounce between a combat's overlays + nav sidebar + Settings, then
inspect whether `<body>` is stuck with `pointer-events: none` / `data-scroll-locked` after
overlays close. Confirm mechanism, then scope the fix (likely multi-file: overlay teardown +
history reconciliation + body-lock release → `/work-large`).

## Suspect files

- `src/routes/combats/[id]/+page.svelte:98-113` — overlay history push/back + orphaned
  `overlayHistoryPushed`.
- `src/lib/components/ui/sheet/*`, `src/lib/components/ui/dialog/*`,
  `src/lib/components/ui/select/*` — bits-ui wrappers; check scroll-lock / body pointer-events
  release on unmount.
- `src/lib/components/app/NavSidebar.svelte`, `NumpadSheet.svelte`, `CombatantForm.svelte`.
