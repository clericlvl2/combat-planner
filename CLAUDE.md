# Combat Planner — Constitution

Local-only, offline-first 13th Age initiative tracker (SvelteKit/Svelte 5 PWA). No backend, no
telemetry, single DM, single device. Full product/rules/data context lives in `specs/` — this
file is the compressed operating manual every session/agent loads first.

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

## Doc rules

One fact, one owner file; every other mention is a pointer, never a copy. Requirements live in
`specs/capabilities/*.md` (stable IDs, inline acceptance criteria); cross-cutting facts live in
`specs/reference/*.md`. See `specs/README.md` for the full layout and the change-unit lifecycle.

| Fact | Owner |
|------|-------|
| Lifecycle (Setup/Active, Start, Clear/Restart) | `specs/capabilities/lifecycle.md` (LIF) |
| Initiative (roll/manual/lock, sort, tiebreak) | `specs/capabilities/initiative.md` (INI) |
| Turns, rounds, escalation die | `specs/capabilities/turns-rounds-escalation.md` (TRE) |
| HP (damage/heal/temp, bands, numpad) | `specs/capabilities/hp.md` (HP) |
| HP change log | `specs/capabilities/hp-log.md` (LOG) |
| Undo/redo model | `specs/capabilities/undo-redo.md` (UND) |
| Conditions | `specs/capabilities/conditions.md` (CND) |
| Combatants (fields, add/edit/duplicate/remove, caps) | `specs/capabilities/combatants.md` (CBT) |
| Combats list (CRUD, reorder, color tags, first launch) | `specs/capabilities/combats-list.md` (CLS) |
| Import/export | `specs/capabilities/import-export.md` (IMP) |
| Settings (language/theme/reset, About) | `specs/capabilities/settings.md` (SET) |
| Platform (offline, PWA, responsive, a11y, perf) | `specs/capabilities/platform.md` (PLT) |
| Numeric limits & caps | `specs/reference/limits.md` |
| 13th Age glossary & conditions | `specs/reference/glossary-conditions.md` |
| Component catalog & control placement | `specs/reference/component-inventory.md` |
| i18n key catalog | `specs/reference/i18n-catalog.md` |
| Test coverage index | `specs/reference/acceptance-matrix.md` |
| Tech/stack choices | `specs/adr/README.md` (ADR-001..013) |
| Changelog | `specs/CHANGELOG.md` |
| Milestones / roadmap / task backlog | `specs/backlog.md` |

## Process

All feature/fix work flows through `specs/` — see `specs/README.md` for the change-unit
lifecycle and which agent does what. Don't hand-orchestrate a task that already has a `/spec-*`
skill for it.

## Paraglide rule

Never hand-edit `src/lib/paraglide/*` — it is generated. Edit `messages/*.json`, then
regenerate (`npm run prepare` / build triggers it).

## Design-truth rule

Any UI-touching task loads `specs/design/*.html` and `specs/reference/component-inventory.md`
as binding design truth before writing code — the prototypes carry the authoritative values
(incl. light palette), `component-inventory.md` carries control placement/card layout.
