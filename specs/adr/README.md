# Architecture Decision Records

Split from the original architecture doc (removed during the spec-driven-development migration —
see git history) into per-decision files. Each ADR: **Decision · Rationale · Alternatives ·
Consequences.** All accepted 2026-06-28 unless noted; ADR-013's v2 migration note is dated
2026-07-02. Supersedes nothing.

## Context

Combat Planner is a **local-only, offline-first, installable PWA** — a single-DM 13th Age
initiative tracker, no backend, no accounts, no network dependency, no telemetry. The
architecture honors four hard constraints: fully offline, durable local persistence (an
interrupted write must not corrupt existing combats), fully private (no telemetry/analytics), and
mobile-first/one-handed/WCAG 2.1 AA with 6 bundled languages and dark+light themes.

## Stack at a glance

| Layer | Choice | ADR |
|-------|--------|-----|
| Language | TypeScript | — |
| Framework | SvelteKit (Svelte 5) | [ADR-001](ADR-001.md) |
| State | Svelte 5 runes + thin store layer | [ADR-002](ADR-002.md) |
| Local storage | IndexedDB via Dexie | [ADR-003](ADR-003.md) |
| PWA shell / service worker | @vite-pwa/sveltekit (Workbox), `registerType: prompt` | [ADR-004](ADR-004.md) |
| i18n | Paraglide (inlang) — compile-time, bundled | [ADR-005](ADR-005.md) |
| Drag-reorder | svelte-dnd-action | [ADR-006](ADR-006.md) |
| Build / deploy | Vite + `@sveltejs/adapter-static` (SPA) on Vercel | [ADR-007](ADR-007.md) |
| UI components | shadcn-svelte | [ADR-008](ADR-008.md) |
| Styling | Tailwind CSS | [ADR-008](ADR-008.md) |
| Icons | Lucide (`lucide-svelte`) | [ADR-011](ADR-011.md) |
| Combat color-tag palette | 8 token-driven swatches | [ADR-012](ADR-012.md) |
| Schema versioning / migrations | Dexie `version().upgrade()` + shared transforms | [ADR-013](ADR-013.md) |
| Lint / format | Biome | [ADR-009](ADR-009.md) |
| Unit tests | Vitest + vitest-browser-svelte | [ADR-009](ADR-009.md) |
| E2E tests | Playwright | [ADR-009](ADR-009.md) |
| Telemetry / analytics | **None — deliberately dropped** | [ADR-010](ADR-010.md) |

## Index

- [ADR-001](ADR-001.md) — UI framework: SvelteKit (Svelte 5)
- [ADR-002](ADR-002.md) — State: Svelte 5 runes + a thin store layer
- [ADR-003](ADR-003.md) — Local persistence: IndexedDB via Dexie
- [ADR-004](ADR-004.md) — PWA shell & update strategy: @vite-pwa/sveltekit (Workbox)
- [ADR-005](ADR-005.md) — i18n: Paraglide (inlang), compile-time & bundled
- [ADR-006](ADR-006.md) — Drag-reorder: svelte-dnd-action
- [ADR-007](ADR-007.md) — Build & deploy: Vite + adapter-static (SPA) on Vercel
- [ADR-008](ADR-008.md) — UI components & styling: shadcn-svelte + Tailwind CSS
- [ADR-009](ADR-009.md) — Tooling: Biome, Vitest, Playwright
- [ADR-010](ADR-010.md) — Telemetry: none (deliberate)
- [ADR-011](ADR-011.md) — Icons: Lucide (`lucide-svelte`)
- [ADR-012](ADR-012.md) — Combat color-tag palette: 8 token-driven swatches
- [ADR-013](ADR-013.md) — Schema versioning & migrations: additive-first, migrate-only-on-shape-break
