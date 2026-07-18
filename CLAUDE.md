# Combat Planner — Constitution

Local-only, offline-first 13th Age initiative tracker (SvelteKit/Svelte 5 PWA). No backend, no
telemetry, single DM, single device. Shipped and live. Code is the source of truth for behavior;
`specs/` holds only ADRs, product goals, backlog, and domain glossary — see `specs/README.md`.

## Stack lock (ADRs)

One line each; never restate rationale here — follow the pointer.

| # | Decision | Pointer |
|---|----------|---------|
| ADR-001 | SvelteKit (Svelte 5), client-only SPA | `specs/adr/ADR-001.md` |
| ADR-002 | Svelte 5 runes + thin store layer; derived values never stored | `specs/adr/ADR-002.md` |
| ADR-003 | IndexedDB via Dexie; store layer is the only writer | `specs/adr/ADR-003.md` |
| ADR-004 | @vite-pwa/sveltekit (Workbox), `registerType: prompt` | `specs/adr/ADR-004.md` |
| ADR-005 | Paraglide (inlang) i18n, compile-time, 6 bundled locales | `specs/adr/ADR-005.md` |
| ADR-006 | svelte-dnd-action for combats-list reorder | `specs/adr/ADR-006.md` |
| ADR-007 | Vite + adapter-static (SPA) on Vercel | `specs/adr/ADR-007.md` |
| ADR-008 | shadcn-svelte + Tailwind CSS | `specs/adr/ADR-008.md` |
| ADR-009 | Biome (lint/format) + Vitest + vitest-browser-svelte + Playwright | `specs/adr/ADR-009.md` |
| ADR-010 | No telemetry/analytics — deliberate | `specs/adr/ADR-010.md` |
| ADR-011 | Lucide icons (`lucide-svelte`) | `specs/adr/ADR-011.md` |
| ADR-012 | 8 token-driven color-tag swatches | `specs/adr/ADR-012.md` |
| ADR-013 | Dexie `version().upgrade()` migrations, additive-first | `specs/adr/ADR-013.md` |

## Gate

Canonical check sequence — run before considering any change done:

```
npm run gate
```

(expands to `lint && check && test:unit -- --run && build`). CI runs the same gate. Never weaken
or skip a gate step to unblock a commit.

## Store seam invariant

Call `$state.snapshot()` on runes-backed state before passing it to pure domain functions or to
Dexie — raw `$state` proxies throw `DataCloneError` on persist. This is the single most common
footgun in this codebase; check it first when a Dexie write throws.

## Paraglide rule

Never hand-edit `src/lib/paraglide/*` — it is generated. Edit `messages/*.json`, then
regenerate (`npm run prepare` / build triggers it).

## Design-truth rule

**Shipped code is design truth.** Token values live in `src/lib/styles/tokens.css`; component
structure/placement is read from the components themselves. No design prototypes exist.

## Work

`specs/backlog.md` is the work queue (`W-NNN` rows). Two loops drive it: `/work-small` for
low-risk changes, `/work-large` for everything else; `/work-next` picks the next row and runs
it through the right loop. Each unit runs in its own git worktree per `/work-next`'s canonical
worktree-per-unit lifecycle.

## History

Linear history — rebase + fast-forward, no merge commits. Every work commit carries a
`Work: W-NNN` trailer.
