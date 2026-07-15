# Tasks: 018-routing-fallback-not-found

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group. Spec amendments to
`specs/capabilities/platform.md` (PLT-9 amend, PLT-12 new) and to `specs/reference/*.md`
(i18n-catalog, acceptance-matrix) are the doc-syncer's job at `/spec-close` — no implementer phase
touches `specs/**`.

## Phase 1 — SPA catch-all rewrite (PLT-9)

**Owns:** `vercel.json`
**Parallel-safe with:** Phase 2, Phase 3

- [ ] Add a catch-all rewrite to `vercel.json` that sends any request with no matching static file
      to `/index.html` (SPA fallback), so deep links / hard reloads to client-only paths
      (`/combats/<id>`, `/combat`, `/foo`) boot the app shell instead of returning Vercel's 404.
- [ ] Rewrite applies only after Vercel's default filesystem check, so real static assets
      (JS/CSS/icons/manifest under `build/`) still resolve directly and are not rewritten.
- [ ] Do NOT switch `framework: null` / `outputDirectory: build` or move off `adapter-static`
      (ADR-007 stands); this is a host-rewrite fix only.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Page-not-found i18n keys

**Owns:** `messages/en.json`, `messages/de.json`, `messages/es.json`, `messages/fr.json`,
`messages/ja.json`, `messages/ru.json`, `src/lib/paraglide/**` (regenerated output only)
**Parallel-safe with:** Phase 1

- [ ] Add new `route.notFound.*` key(s) for the unknown-path screen — a title distinct from
      `combat.notFound.*` ("Combat not found"), e.g. a "Page not found" title plus the
      Back-to-Combats control label (reuse/mirror `combat.notFound.back` wording as appropriate).
- [ ] Add real translations for all 6 locales (`en/de/es/fr/ja/ru`), not English placeholders —
      match the existing localized `combat.notFound.*` rows as the quality bar.
- [ ] Regenerate paraglide via `npm run prepare` / build — never hand-edit `src/lib/paraglide/*`.
- [ ] The keys can exist unused at this phase; the consuming route lands in Phase 3.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Root catch-all not-found route (PLT-12)

**Owns:** `src/routes/[...catchall]/+page.svelte` (new), `src/routes/combats/[id]/+page.svelte`
(only if the shared not-found visual is extracted), the extracted shared not-found component (if
created, under `src/lib/components/app/`), and the new route test file(s)
**Parallel-safe with:** Phase 1
**Depends on:** Phase 2 (consumes the new `route.notFound.*` key; gate `check` fails without it)

- [ ] Add `src/routes/[...catchall]/+page.svelte` rendering a styled not-found state using app
      tokens, with a visible **and** `aria-label`-labelled control that calls `goto('/combats')`.
      Reuse the CLS-5 not-found look from `src/routes/combats/[id]/+page.svelte`'s `{:else if !combat}`
      branch (EmptyState-style markup + `Button` + `goto('/combats')`). Use the new `route.notFound.*`
      copy, not `combat.notFound.*`.
- [ ] The catch-all must NOT shadow real routes: `/combats`, `/combats/<id>`, `/settings`, `/about`
      still resolve to their own pages, and `/combats/<bad-id>` still renders the existing CLS-5
      screen — rely on SvelteKit route specificity (`[...catchall]` matches only otherwise-unmatched
      paths).
- [ ] The catch-all handles no-route-match only; it must never intercept thrown errors — genuine
      thrown errors from the `/` load or `store.hydrate()`/Dexie still surface the PLT-10
      `+error.svelte` boundary (leave `+error.svelte` and `+page.ts` unchanged).
- [ ] Extraction of the shared not-found markup into a reusable component is permitted for DRY but
      optional; if extracted, `combats/[id]` consumes it too and its rendered output (CLS-5) must be
      byte-for-byte unchanged. If not extracted, do not touch `combats/[id]/+page.svelte`.
- [ ] Add vitest route test(s) consistent with existing patterns: assert the catch-all renders the
      not-found title + labelled Back-to-Combats control, and that real routes are not shadowed. Do
      not edit `specs/reference/acceptance-matrix.md` (doc-syncer owns it at close).

**Gate:** `npm run gate` must pass before this phase is reported done.
