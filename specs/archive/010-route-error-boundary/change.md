---
status: archived
backlog: B-026
---

# Change: route-error-boundary

## Why

B-026 — routing edge cases. A scout sweep of the routing layer found four concrete gaps, none
hypothetical:

1. **No `+error.svelte` anywhere in the route tree.** Any thrown error in the `/` load
   (`src/routes/+page.ts`) or in `store.hydrate()`/Dexie access surfaces SvelteKit's generic,
   unstyled error page — breaking the offline app-shell the whole product promises ([[platform]]
   PLT-1).
2. **"Combat not found." is a dead-end.** `src/routes/combats/[id]/+page.svelte:112` renders a
   bare unstyled sentence for a stale/garbage combat id with no affordance back to the list.
3. **Browser Back never closes an open sheet/dialog** on the combat screen — no history entry is
   pushed for the Add/Edit/Numpad overlays, so Back always leaves the combat page instead of
   dismissing the top-most overlay.
4. **First-launch redirect has no failure surface.** `src/routes/+page.ts:22` relies on
   `store.combats[0]` existing; if the first-launch seed silently produces no combat the user
   gets no feedback (it degrades to `/combats`, but silently).

Non-issues confirmed by the scout and deliberately excluded: query-param / hash state (the app
reads none), adapter-static SPA fallback (working as designed, `ADR-007`), and
`page.params.id ?? ''` (already falls back cleanly to the not-found branch).

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `PLT-10` | new requirement: an app-level error boundary — a thrown error in any route load or in store hydration renders the app's own styled error surface (app-shell chrome intact, offline-safe) with an explicit recovery action, never SvelteKit's default error page. |
| `PLT-11` | new requirement: on the combat screen, pressing browser Back closes the top-most open transient overlay (Add / Edit / Numpad sheet) instead of navigating away; only once no overlay is open does Back leave the combat page. |
| `CLS-5` | amend: opening a non-existent / stale combat id shows a not-found state that includes an explicit control returning to the Combats list. |
| `CLS-7` | amend: if first-launch seeding yields no combat, the app lands on the Combats home (`/combats`) without throwing, rather than a broken/empty combat page. |

## Acceptance criteria

- [ ] `PLT-10` — A route-level error boundary (`+error.svelte`) exists in the route tree and
      renders inside the app shell using app tokens/styling (not SvelteKit's default page).
- [ ] `PLT-10` — A thrown error in the `/` load or in `store.hydrate()`/Dexie access surfaces
      that error boundary, and it offers a recovery action (reload and/or navigate to
      `/combats`); the AppShell chrome remains present.
- [ ] `CLS-5` — Navigating to `/combats/<nonexistent-id>` renders the not-found state including
      a visible, labelled control that navigates to `/combats`.
- [ ] `PLT-11` — With an Add / Edit / Numpad sheet open on `/combats/[id]`, a browser Back
      gesture closes that sheet and stays on the combat page; a subsequent Back then leaves the
      page. Opening a sheet does not otherwise pollute forward-history navigation.
- [ ] `CLS-7` — When the first-launch seed produces no combat, the app lands on `/combats` and
      no unhandled error is thrown; existing normal first-launch behaviour (one seeded combat
      opened directly) is unchanged.

## Out of scope

- Query-param / hash-driven route state — the app uses none; nothing to harden ([[platform]]).
- adapter-static SPA fallback / server-side 404 status — no server runtime exists (`ADR-007`);
  not applicable.
- Service-worker / PWA update + install flow (`PLT-4`, `PLT-6`) — unrelated to routing errors.
- Any change to combat domain logic — HP, initiative, turns/rounds, conditions, undo/redo.
- New routes, route restructuring, or moving data-loading into SvelteKit `load` functions.
- The `ColorTagDot` / search / reorder behaviours of the combats list (`CLS-6`, `CLS-9`).
