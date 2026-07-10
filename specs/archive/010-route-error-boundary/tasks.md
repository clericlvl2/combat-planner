# Tasks: 010-route-error-boundary

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Ordering: **Phase 1 is the foundation and runs first.** Phases 2–4 own disjoint files, each
depend only on Phase 1's message keys (Phase 4 has no i18n dependency at all), and are mutually
parallel-safe once Phase 1 is done.

Scope guard (from `change.md` "Out of scope"): no query-param/hash state, no adapter-static /
server-404 work, no service-worker/PWA flow, no combat domain logic (HP/initiative/turns/
conditions/undo), no new routes or moving data-loading into SvelteKit `load`. Capability-spec
(`specs/capabilities/*.md`) amendments for PLT-10/PLT-11/CLS-5/CLS-7 are the doc-syncer's job —
implementers touch code + messages only, never `specs/`.

## Phase 1 — i18n message keys (foundation)

**Owns:** `messages/en.json`, `messages/de.json`, `messages/es.json`, `messages/fr.json`, `messages/ja.json`, `messages/ru.json`
**Parallel-safe with:** none (Phases 2 and 3 consume these keys)

- [ ] Add message keys for the PLT-10 error surface: a heading/body line for "something went
      wrong" and the recovery-action label(s) (reload and/or "Go to Combats"). Follow the
      existing dotted-namespace convention (e.g. the `setup.empty.title` style already in
      `messages/*.json`).
- [ ] Add message keys for the CLS-5 not-found state: the not-found title (replacing the
      hard-coded `Combat not found.`) and the visible label for the control that returns to
      `/combats` (e.g. "Back to Combats").
- [ ] Add each new key to all six locale files with the same key set; provide real translations,
      not English placeholders, consistent with the other locales.
- [ ] Do NOT hand-edit `src/lib/paraglide/*` (Paraglide rule) — it is generated. Regenerate via
      `npm run prepare` (build also triggers it) so the new `m[...]` accessors exist.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Route error boundary, PLT-10

**Owns:** `src/routes/+error.svelte` (new file)
**Parallel-safe with:** Phase 3, Phase 4

- [ ] Before writing UI, load `specs/design/prototype.html`, `specs/design/card-prototype.html`
      and `specs/reference/component-inventory.md` as binding design truth for the error surface
      (tokens, chrome, button styling).
- [ ] Create `src/routes/+error.svelte`: a styled error surface using app tokens/components (not
      SvelteKit's default page). It renders inside `+layout.svelte`'s `AppShell`, so verify the
      shell chrome stays present; do not restructure the layout.
- [ ] Read the error via `$app/state` `page.error` / `page.status`; render the Phase 1 error
      strings (no hard-coded copy).
- [ ] Provide a recovery action: reload and/or navigate to `/combats` (per the acceptance
      criteria). Use existing UI button component + `aria-label`/label (PLT-5 focus + semantic
      label).
- [ ] Confirm it catches a thrown error from the `/` load and from `store.hydrate()`/Dexie
      access (this is the boundary the `+page.ts` in Phase 4 relies on).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Combat screen: Back-closes-overlay + not-found recovery, PLT-11 + CLS-5

**Owns:** `src/routes/combats/[id]/+page.svelte`
**Parallel-safe with:** Phase 2, Phase 4

Both work items live in this one file and both touch the combat screen's look/behaviour, so they
are a single implementer's phase (one visual surface = one implementer), not split.

- [ ] Before touching the not-found UI, load `specs/design/*.html` +
      `specs/reference/component-inventory.md` for the not-found/empty-state styling.
- [ ] CLS-5: replace the bare `<p ...>Combat not found.</p>` in the `{:else if !combat}` branch
      with a styled not-found state that includes a visible, labelled control (button/link)
      navigating to `/combats`. Use the Phase 1 message keys for the title and the control label;
      give the control an `aria-label`/visible label + focus state (PLT-5).
- [ ] PLT-11: push a history entry when a transient overlay opens (`addOpen` / `editOpen` /
      `numpadOpen`) so a browser Back gesture closes the top-most open sheet and stays on the
      combat page; only Back with no overlay open leaves the page. Handle `popstate` to close the
      current overlay, and ensure opening/closing a sheet does not pollute forward-history
      navigation (no stray forward entries after a normal close).
- [ ] Keep the existing `!store.ready` loading branch and the normal combat render path intact;
      do not alter combat domain logic, controller wiring, or the FAB/header controls.
- [ ] Store-seam invariant: this page reads store state and calls controller intents only — if
      any new code passes runes-backed state to a pure/domain/Dexie path, `$state.snapshot()`
      first. (No new persistence is expected here.)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — First-launch redirect hardening, CLS-7

**Owns:** `src/routes/+page.ts`
**Parallel-safe with:** Phase 2, Phase 3 (no dependency on Phase 1 — no user-facing strings)

- [ ] In `src/routes/+page.ts`, ensure the root load always resolves to a `redirect` and never
      falls through to a broken/empty combat page when first-launch seeding yields no combat: the
      `wasFirstLaunch && store.combats[0]` branch already degrades to `/combats`, so harden that
      path so a missing seeded combat lands on `/combats` deterministically (not silently
      relying on `store.combats[0]`).
- [ ] Let a genuine `store.hydrate()`/Dexie failure propagate so the Phase 2 `+error.svelte`
      boundary surfaces it — do not swallow real errors; only the "no seeded combat" case must
      degrade to `/combats`.
- [ ] Preserve existing normal first-launch behaviour: exactly one seeded combat is opened
      directly at `/combats/<id>`; subsequent launches land on `/combats`.
- [ ] Do not duplicate first-launch seeding logic here — it stays in `store.hydrate()` /
      `App.firstLaunch` (this load only reads the prior `firstLaunchDone` flag).

**Gate:** `npm run gate` must pass before this phase is reported done.
