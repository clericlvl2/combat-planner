# Combat Planner

An offline-first **13th Age** initiative tracker and combat planner. Runs entirely
in the browser as an installable PWA — no backend, no account, no network calls at
runtime ([ADR-007](docs/Combat%20Planner%20Architecture.md), [ADR-010](docs/Combat%20Planner%20Architecture.md)).
All data lives locally in IndexedDB.

> **Status:** build-ready skeleton (M0). No feature logic yet — route shells, the
> token layer, the i18n catalog, the Dexie schema, and tooling are in place; the
> store seam and combat features land in **M1**. Source is annotated with
> `// TODO M1` / `// TODO M-phase` markers pointing at the owning spec section.
> See [docs/](docs/) and [Status & Roadmap](docs/Combat%20Planner%20Status%20%26%20Roadmap.md).

## Stack

| Concern        | Choice                                                | ADR |
|----------------|-------------------------------------------------------|-----|
| Framework      | SvelteKit + Svelte 5 (runes), client-only SPA         | 001 |
| Adapter        | `@sveltejs/adapter-static` (`fallback: index.html`)   | 001 |
| State          | Svelte 5 `$state`/`$derived` + thin store seam        | 002 |
| Persistence    | Dexie (IndexedDB)                                      | 003 |
| PWA            | `@vite-pwa/sveltekit` (Workbox, `registerType: prompt`) | 004 |
| i18n           | Paraglide (inlang), compile-time, 6 locales           | 005 |
| Drag & drop    | `svelte-dnd-action`                                   | 006 |
| UI             | Tailwind v4 (CSS-first) + shadcn-svelte + `@lucide/svelte` | — |
| Lint / format  | Biome                                                 | 009 |
| Tests          | Vitest (unit + browser) + Playwright (E2E)            | 009 |

## Requirements

- Node ≥ 22 (developed on 22.12), npm ≥ 11

## Develop

```sh
npm install
npm run dev          # http://localhost:5173
npm run dev -- --open
```

## Scripts

| Script              | Does                                                 |
|---------------------|------------------------------------------------------|
| `npm run dev`       | Vite dev server                                      |
| `npm run build`     | Production build → `build/` (static SPA + service worker) |
| `npm run preview`   | Serve the production build locally (port 4173)       |
| `npm run check`     | `svelte-kit sync` + `svelte-check` (types)           |
| `npm run lint`      | `biome check .`                                       |
| `npm run format`    | `biome format --write .`                             |
| `npm run test:unit` | Vitest (node unit project + browser component project) |
| `npm run test:e2e`  | Playwright E2E (requires browsers: `npx playwright install`) |
| `npm run test`      | `test:unit --run` then `test:e2e`                    |

## Build

```sh
npm run build        # outputs to build/
npm run preview
```

The build emits a fully static SPA (`index.html` fallback) plus a Workbox service
worker that precaches the app shell for offline use.

## Internationalisation

Messages live in `messages/<locale>.json` (flat, dot-namespaced keys). `en` is the
source of truth; `de/es/fr/ja/ru` are **stubs** (English placeholders, flagged via
`_translation_status`) pending translation ([ADR-005](docs/Combat%20Planner%20Architecture.md)).
Paraglide compiles them to `src/lib/paraglide/` (gitignored). Access via
`import { m } from '$lib/i18n'` → `m['nav.combats']()`.

## Documentation

Full design specs (mirrored from the source vault, Obsidian wikilinks intact) are in
[`docs/`](docs/) — start at [Overview](docs/Combat%20Planner%20Overview.md) and the
[docs index](docs/README.md).

## License

[MIT](LICENSE)
