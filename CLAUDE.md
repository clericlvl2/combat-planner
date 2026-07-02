# Combat Planner — Constitution

Local-only, offline-first 13th Age initiative tracker (SvelteKit/Svelte 5 PWA). No backend, no
telemetry, single DM, single device. Full product/rules/data context lives in `specs/` — this
file is the compressed operating manual every session/agent loads first.

## Stack lock (ADRs)

One line each; never restate rationale here — follow the pointer.

| # | Decision | Pointer |
|---|----------|---------|
| ADR-001 | SvelteKit (Svelte 5), client-only SPA | `docs/Combat Planner Architecture.md` |
| ADR-002 | Svelte 5 runes + thin store layer; derived values never stored | `docs/Combat Planner Architecture.md` |
| ADR-003 | IndexedDB via Dexie; store layer is the only writer | `docs/Combat Planner Architecture.md` |
| ADR-004 | @vite-pwa/sveltekit (Workbox), `registerType: prompt` | `docs/Combat Planner Architecture.md` |
| ADR-005 | Paraglide (inlang) i18n, compile-time, 6 bundled locales | `docs/Combat Planner Architecture.md` |
| ADR-006 | svelte-dnd-action for combats-list reorder | `docs/Combat Planner Architecture.md` |
| ADR-007 | Vite + adapter-static (SPA) on Vercel | `docs/Combat Planner Architecture.md` |
| ADR-008 | shadcn-svelte + Tailwind CSS | `docs/Combat Planner Architecture.md` |
| ADR-009 | Biome (lint/format) + Vitest + @testing-library/svelte + Playwright | `docs/Combat Planner Architecture.md` |
| ADR-010 | No telemetry/analytics — deliberate | `docs/Combat Planner Architecture.md` |
| ADR-011 | Lucide icons (`lucide-svelte`) | `docs/Combat Planner Architecture.md` |
| ADR-012 | 8 token-driven color-tag swatches | `docs/Combat Planner Architecture.md` |
| ADR-013 | Dexie `version().upgrade()` migrations, additive-first | `docs/Combat Planner Architecture.md` |

## Gate

Canonical check sequence — run before considering any change done:

```
npm run gate
```

(expands to `lint && check && test:unit -- --run && build`; use the expanded form until the
script exists). CI runs the same gate. Never weaken or skip a gate step to unblock a commit.

## Store seam invariant

Call `$state.snapshot()` on runes-backed state before passing it to pure domain functions or to
Dexie — raw `$state` proxies throw `DataCloneError` on persist. This is the single most common
footgun in this codebase; check it first when a Dexie write throws.

## Doc rules

One fact, one owner doc; every other mention is a pointer, never a copy.

| Fact | Owner |
|------|-------|
| Numeric limits & caps | `docs/Combat Planner Rules & Glossary.md` §7 |
| Undo/redo model | `docs/Combat Planner Data Model.md` §8 |
| HP change log | `docs/Combat Planner Data Model.md` §9 |
| Control locations | `docs/Combat Planner UX & IA.md` §9 |
| Tech/stack choices | `docs/Combat Planner Architecture.md` |
| Component catalog | `docs/Combat Planner Component Inventory.md` |
| i18n key catalog | `docs/Combat Planner i18n Message Catalog.md` |
| Test strategy & acceptance matrix | `docs/Combat Planner Test Plan.md` |
| Project status / changelog | `docs/Combat Planner Status & Roadmap.md` |

## Process

All feature/fix work flows through `specs/` — see `specs/README.md` for the change-unit
lifecycle (draft → approved → in-progress → verifying → docs-synced → archived) and which agent
does what. Don't hand-orchestrate a task that already has a `/spec-*` skill for it.

## Paraglide rule

Never hand-edit `src/lib/paraglide/*` — it is generated. Edit `messages/*.json`, then
regenerate (`npm run prepare` / build triggers it).
