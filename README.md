# Combat Planner

An offline-first **13th Age** initiative tracker and combat planner. Runs entirely
in the browser as an installable PWA — no backend, no account, no network calls at
runtime ([ADR-007](specs/adr/ADR-007.md), [ADR-010](specs/adr/ADR-010.md)).
All data lives locally in IndexedDB.

> **Status:** shipped and live — deployed at
> [combat-planner-five.vercel.app](https://combat-planner-five.vercel.app).

## Stack

Stack and tooling choices, with rationale, live in [`specs/adr/`](specs/adr/) (ADR-001..013).

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
source of truth; other locales are translated ([ADR-005](specs/adr/ADR-005.md)).
Paraglide compiles them to `src/lib/paraglide/` (gitignored). Access via
`import { m } from '$lib/i18n'` → `m['nav.combats']()`.

## Documentation

Process/product context: [`specs/README.md`](specs/README.md). Stack decisions:
[`specs/adr/`](specs/adr/).

## License

[MIT](LICENSE)
