---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner Architecture
  - Combat Planner ADR
  - Combat Planner Tech Stack
related:
  - "[[Combat Planner Overview]]"
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Component Inventory]]"
  - "[[Combat Planner i18n Message Catalog]]"
  - "[[Combat Planner Test Plan]]"
  - "[[Combat Planner Status & Roadmap]]"
---

# Combat Planner — Architecture & Tech-Stack (ADR)

> **First implementation-layer doc.** Everything in [[Combat Planner PRD]], [[Combat Planner Rules & Glossary]], [[Combat Planner Data Model]], and [[Combat Planner UX & IA]] stays deliberately tech-agnostic. This note is where implementation choices are made. Each decision is recorded ADR-style: **Decision · Rationale · Alternatives · Consequences.**
> Status: **Accepted** (2026-06-28). Supersedes nothing.

## Context

Combat Planner is a **local-only, offline-first, installable PWA** — a single-DM 13th Age initiative tracker, no backend, no accounts, no network dependency, no telemetry. The architecture must honor four hard constraints from the planning docs:

1. **Fully offline** — every feature works with zero network; offline is the default, not a fallback.
2. **Durable local persistence** — data survives reload and app update; an interrupted write must not corrupt existing combats.
3. **Fully private** — no telemetry/analytics, no network calls for app function.
4. **Mobile-first, one-handed, WCAG 2.1 AA**, 6 bundled languages, dark+light.

## Stack at a glance

| Layer | Choice | ADR |
|-------|--------|-----|
| Language | TypeScript | — |
| Framework | SvelteKit (Svelte 5) | ADR-001 |
| State | Svelte 5 runes + thin store layer | ADR-002 |
| Local storage | IndexedDB via Dexie | ADR-003 |
| PWA shell / service worker | @vite-pwa/sveltekit (Workbox), `registerType: prompt` | ADR-004 |
| i18n | Paraglide (inlang) — compile-time, bundled | ADR-005 |
| Drag-reorder | svelte-dnd-action | ADR-006 |
| Build / deploy | Vite + `@sveltejs/adapter-static` (SPA) on Vercel | ADR-007 |
| UI components | shadcn-svelte | ADR-008 |
| Styling | Tailwind CSS | ADR-008 |
| Icons | Lucide (`lucide-svelte`) | ADR-011 |
| Combat color-tag palette | 8 token-driven swatches | ADR-012 |
| Schema versioning / migrations | Dexie `version().upgrade()` + shared transforms | ADR-013 |
| Lint / format | Biome | ADR-009 |
| Unit tests | Vitest + @testing-library/svelte | ADR-009 |
| E2E tests | Playwright | ADR-009 |
| Telemetry / analytics | **None — deliberately dropped** | ADR-010 |

---

## ADR-001 — UI framework: SvelteKit (Svelte 5)

**Decision.** Build the app with SvelteKit on Svelte 5, in TypeScript, run as a client-only SPA (see ADR-007).

**Rationale.** Small offline PWA with no server needs: SvelteKit gives routing, Vite tooling, and a first-class PWA story while compiling to a lean bundle (no virtual-DOM runtime tax) — good for mobile load and one-handed responsiveness. Svelte 5 runes give ergonomic reactivity for the combat state machine.

**Alternatives.** React + Effector + FSD (off this project's chosen stack); Svelte without Kit (loses routing/PWA integration); vanilla TS (too much boilerplate for forms/lists/i18n).

**Consequences.** SvelteKit is used purely as a static SPA shell — no SSR, no server routes, no load-function data fetching from a backend (there is none). Routes map to the page map: Combats, Combat, Settings, About.

## ADR-002 — State: Svelte 5 runes + a thin store layer

**Decision.** Model reactive combat state with `$state` / `$derived` runes, owned by a small typed store module that encapsulates the lifecycle transitions (start, advance, clear, restart, etc.) and persists to Dexie. Derived values are `$derived`, never stored.

**Rationale.** Mirrors the [[Combat Planner Data Model]] split: stored fields (roster, round, override, active pointer) vs derived (`sortedCombatants`, `escalationDie`, `canAdvance`, `healthStatus`). Runes are native, minimal, and keep the Setup→Active machine readable. The store layer is the single place transitions and persistence happen, so the undo/redo history and the "interrupted write" guard live in one seam.

**Alternatives.** Classic `writable`/`derived` stores (more boilerplate, pre-runes); XState (rigorous but heavy for a 2-state lifecycle).

**Consequences.** Undo/Redo is a **per-combat bounded history (10 deep)** owned by the store: each reversible transition pushes an inverse/snapshot entry, the header Undo ↶ / Redo ↷ walk it, and a new action clears the redo branch. The stack is persisted with the combat in Dexie (ADR-003) and dropped when the combat is deleted. Transitions are pure functions over state → easy to unit-test (ADR-009).

Separately, the same HP transitions (including a Max-HP edit, pushed as its **own discrete undo step**) **append a read-only entry to that combatant's `hpLog`** (Data Model §9), and an HP **undo pops the matching entry** (redo re-adds it) to keep the two consistent. The append/pop lives in the same store seam, so it is unit-testable alongside the transitions.

## ADR-003 — Local persistence: IndexedDB via Dexie

**Decision.** Persist all `AppData` in IndexedDB through Dexie. Combats are individual records (settings a singleton record), so single-combat export/import maps to one row.

**Rationale.** IndexedDB is **transactional** (an interrupted write won't corrupt existing combats — directly satisfies the reliability NFR), **async** (no main-thread jank on writes at the 30×100 caps), and roomy (no ~5 MB localStorage ceiling). Dexie is a thin, typed wrapper with clean transaction + bulk APIs.

**Alternatives.** `idb` (same engine, less sugar — viable, chosen against only for Dexie's ergonomics); localStorage whole-blob (no transactions → corruption risk, synchronous main-thread blocking, size cap — rejected as it violates the reliability NFR).

**Consequences.** A `dataVersion` marker is stored for safe import + future migrations. Writes are debounced/batched per action. The store layer (ADR-002) is the only writer. Each combatant's `hpLog` (Data Model §9) is stored inline on the combatant within the combat record, so it persists across reload/update and **rides along with single-combat export/import** automatically (deliberately unlike the undo/redo stack, which is stripped on export) — no separate table or join needed.

## ADR-004 — PWA shell & update strategy: @vite-pwa/sveltekit (Workbox)

**Decision.** Use `@vite-pwa/sveltekit` (vite-plugin-pwa) with Workbox, `registerType: 'prompt'`. Workbox precaches the full app shell + assets for offline; the web app manifest is generated by the plugin.

**Rationale.** Full precache delivers the "every feature works offline" guarantee. `prompt` registration drives the locked **"Update available — reload"** toast: a waiting service worker surfaces the toast, and reload activates the new version without data loss (data lives in IndexedDB, independent of the SW cache). The subtle, once-and-dismissible install hint keys off the `beforeinstallprompt` event, with dismissal persisted (`installHintDismissed` in Settings).

**Alternatives.** Hand-rolled `src/service-worker.ts` (full control, but you own precache/versioning/update messaging by hand — more footguns).

**Consequences.** All i18n message bundles and fonts/icons are precached so language switching works offline. Offline is silent (no nag). SW update is the only "network-ish" UX, and it degrades gracefully when offline.

## ADR-005 — i18n: Paraglide (inlang), compile-time & bundled

**Decision.** Localize with Paraglide (inlang). Messages live as per-language JSON (en, de, es, fr, ja, ru); Paraglide compiles them to typesafe, tree-shakeable functions. Locale is auto-detected from the browser on first run (fallback English) and switchable in Settings; the choice persists.

**Rationale.** Compile-time output means **zero runtime locale fetch** — every string is bundled and works offline by construction, satisfying "6 languages bundled offline, no hardcoded strings." Typesafety catches missing keys at build. JSON-per-language fits the AI-translation-for-v1 workflow (translate a file, flag for later human review).

**Alternatives.** svelte-i18n (runtime dictionaries — needs care to stay fully precached, untyped); typesafe-i18n (typed but less Svelte-native, more setup).

**Consequences.** No string is rendered without a message key. The active language is part of Settings (kept across Reset-all). New strings are added to the source language file first, then propagated.

## ADR-006 — Drag-reorder: svelte-dnd-action

**Decision.** Implement manual combats-list reordering with `svelte-dnd-action`.

**Rationale.** The de-facto Svelte drag library: pointer + **touch** + keyboard support, accessible, FLIP animations. Touch-first is mandatory (phone-first app). On drop, the new order updates `listOrder` and persists via the store → Dexie ("drag to reorder; order persists").

**Alternatives.** Native HTML5 DnD (poor/inconsistent on touch, weaker a11y — rejected for a mobile-first tool).

**Consequences.** Reorder is a store transition like any other; order survives reload.

## ADR-007 — Build & deploy: Vite + adapter-static (SPA) on Vercel

**Decision.** Vite is the bundler (SvelteKit's default). Build with `@sveltejs/adapter-static` in SPA mode (`fallback: index.html`, prerendered shell). Host the static output on Vercel.

**Rationale.** The app has no backend and must run as a fully static, offline-capable SPA. `adapter-static` emits pure static assets — no SSR, no serverless runtime — exactly matching "local-only / no backend / fully offline." Vercel serves the static bundle (CDN, simple deploys) without invoking any server functions.

**Alternatives.** `@sveltejs/adapter-vercel` in SPA mode (pulls in a server-capable adapter never used; easier to accidentally add a server route later — rejected); other static hosts (Cloudflare Pages / Netlify / GitHub Pages — viable, chosen against only to keep Vercel per the stack table).

**Consequences.** No environment secrets, no server runtime, no edge functions. CI builds the static bundle and deploys; the SW + manifest ship as static assets.

## ADR-008 — UI components & styling: shadcn-svelte + Tailwind CSS

**Decision.** Compose UI from shadcn-svelte primitives, styled with Tailwind CSS.

**Rationale.** shadcn-svelte gives copy-in, ownable, accessible components (built on Bits UI) rather than a heavy locked component library — good for a small bundle and for the bespoke combatant row / numpad / drag list. Tailwind enables the dark+light theming and WCAG-AA contrast tokens (incl. the reverse/alarm HP bar and the three locked type colors: PC blue, monster red, ally green) with consistent spacing and ≥44px touch targets.

**Alternatives.** A full component kit (heavier, more opinionated); plain CSS/SCSS (more hand-rolled theming).

**Consequences.** Theme is token-driven (CSS variables) so dark/light + the alarm/health palette + type colors are centralized and contrast-checked. Components are vendored into the repo (ownable, no upstream version churn).

## ADR-009 — Tooling: Biome, Vitest, Playwright

**Decision.** Biome for lint + format; Vitest + @testing-library/svelte for unit/component tests; Playwright for E2E.

**Rationale.** Biome is a single fast lint+format tool (no ESLint+Prettier split). Vitest shares Vite's transform pipeline (fast, zero extra config) and covers the store transitions (start/advance/clear/restart, HP clamping, sort/tiebreak, undo) and components. Playwright covers the critical end-to-end flows from [[Combat Planner UX & IA]] §5 (run a fight, mid-combat add, undo, restart, prep-on-tablet→import) across mobile/desktop viewports, including offline and the install/update paths.

**Consequences.** The derived-value and transition purity from ADR-002 makes unit tests cheap. E2E asserts the offline guarantee and PWA update toast.

## ADR-010 — Telemetry: none (deliberate)

**Decision.** Ship **no** analytics or telemetry. `@vercel/analytics` from the initial stack sketch is **dropped**; no remote logging of any kind. Only ephemeral dev-time console logging during development.

**Rationale.** The locked scope mandates "no telemetry/analytics of any kind — fully private" (PRD Decision 21, Non-goals, Privacy NFR, [[Combat Planner Overview]]). `@vercel/analytics` beacons usage data over the network, contradicting both the privacy guarantee and the "no network calls for app function / fully offline" invariant.

**Alternatives.** Keep analytics + amend the privacy scope (rejected — would break a locked decision across 4 docs and the offline guarantee); local-only logger (acceptable but unnecessary to ship).

**Consequences.** The app makes **zero** network calls at runtime except the service-worker's own update check. Errors are surfaced in-app, not phoned home.

## ADR-011 — Icons: Lucide (`lucide-svelte`)

**Decision.** Use **Lucide** via `lucide-svelte` for all glyphs: the three combatant-type icons, the 12 condition icons, and UI chrome.

**Rationale.** Lucide is **shadcn-svelte's default icon set** (ADR-008) — adopting it is zero extra decision and keeps one consistent stroke weight. ~1500 glyphs, individually importable (tree-shakeable → small bundle), MIT-licensed, bundled offline (no CDN, honors the offline/private invariant).

**Mapping.**
- **Type (firm):** PC = `user`, monster = `skull`, ally = `shield`. Color is reinforcement; the icon is the real signal (never color-alone — [[Combat Planner UX & IA]] §4c).
- **Chrome (firm):** back `chevron-left`, undo `undo-2`, redo `redo-2`, advance `chevron-right` (or `play`), overflow `ellipsis-vertical`, add `plus`, jump-to-turn `crosshair`, import `upload`, export/share `share-2`.
- **12 conditions (starting map, glyphs finalized in the component pass):** charmed `heart`, confused `shuffle`, dazed `star`, fear `ghost`, helpless `bed`, hindered `link`, shocked `zap`, stuck `anchor`, stunned `tornado`, vulnerable `shield-off`, weakened `trending-down`, staggered `activity`.

**Alternatives.** Tabler / Phosphor (fine, but not the shadcn default → extra integration); mixed sets (inconsistent stroke — rejected).

**Consequences.** Icons import per-glyph; a small `icons.ts` map centralizes the type/condition/chrome names so a later swap is one-file. Condition glyph choices are non-blocking and may be tuned for recognizability during UI build.

## ADR-012 — Combat color-tag palette: 8 token-driven swatches

**Decision.** The combat `colorTag` ([[Combat Planner Data Model]] §3) is chosen from a fixed **8-swatch** preset palette: **Neutral (slate, default), Red, Orange, Amber, Green (emerald), Teal, Blue (sky), Violet**. Each swatch is a **CSS theme variable with a light and a dark value** (≈ Tailwind `-500` light / `-400` dark), centralized with the rest of the token system (ADR-008).

**Rationale.** Resolves [[Combat Planner PRD]] §10 (was open). These tags live on **combat-list rows**, separate from the three locked combatant-type colors (which live on combatant rows) — no co-location, so hue reuse is safe. 8 is enough spread without losing mutual distinguishability at swatch size in a dim room. Two-value tokens keep WCAG-AA legibility in both themes; the swatch reinforces the title text (never color-alone).

**Alternatives.** Free-form color picker (overkill, inconsistent, harder to keep AA); 12+ swatches (indistinguishable as small dots in low light — rejected).

**Consequences.** A `colorTags` token group (8 × {light, dark}) is defined once; `colorTag` stores the swatch **key** (not a hex), so re-theming never touches stored data. Neutral is the default for an untagged combat.

## ADR-013 — Schema versioning & migrations: additive-first, migrate-only-on-shape-break

**Decision.** Two aligned version markers: the **Dexie DB version** (local IndexedDB schema) and **`dataVersion`** ([[Combat Planner Data Model]] §2, also stamped into export files). v1 ships as Dexie `version(1)` with tables `combats` (keyPath `id`, index `listOrder`) and `settings` (singleton); combatants/conditions/`hpLog`/undoStack are stored **inline as JSON** on the combat record (ADR-003). Prefer **additive, default-tolerant** field changes (read-time defaulting) — these need **no migration**. A real migration is required **only on a shape-incompatible change** (removing/renaming a persisted field, or adding one old data can't default).

**Rationale.** Answers the open "when is the first migration actually needed" — *not until a field shape breaks*. Because the rich structure is inline JSON, Dexie's `stores()` only indexes top-level keys, so most evolution is data-shape, handled in `.upgrade()` rather than index changes.

**Mechanism (when a migration is needed).** Bump `version(n).upgrade(tx => transform)` and write the step as a **pure function**; the **import path reuses the same per-step transforms** to migrate older `dataVersion` files forward. Import already refuses a **newer** `dataVersion` ("update the app" — Data Model §10); an **older** file is migrated via the shared transforms. One transform, two callers (Dexie upgrade + import). **Hard rule:** never repurpose a field name with new meaning — only add or version-migrate.

**Alternatives.** Schema-on-read only (no Dexie upgrade — works but scatters defaulting logic; rejected for a single seam); a heavy migration framework (overkill at this scale).

**Consequences.** Transforms live beside the store seam (ADR-002), unit-testable (ADR-009). `dataVersion` is the single compatibility gate for portability; the Dexie version and `dataVersion` bump together.
