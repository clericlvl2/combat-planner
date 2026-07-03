---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner
  - Combat Planner Index
  - Combat Planner Overview
related:
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Architecture]]"
  - "[[Combat Planner Component Inventory]]"
  - "[[Combat Planner Test Plan]]"
  - "[[Combat Planner Status & Roadmap]]"
  - "[[Combat Planner Requirements Prompt]]"
---


> **Archived — superseded by `specs/`.** Frozen for historical provenance; do not edit. Current
> source of truth: `specs/capabilities/`, `specs/reference/`, and `docs/adr/`. See
> `specs/README.md` for the process and `specs/reference/migration-traceability.md` for exactly
> where each fact in this document moved.


# Combat Planner — Overview (Index)

> Master hub for the Combat Planner planning doc set. Start here, then dive into a sub-doc below. This note is a directory, not a copy — each fact lives in exactly one doc.

## What it is

**Combat Planner** is a focused combat planner / initiative tracker for **13th Age** that a single Dungeon Master runs at the table on their own device to manage turn order, hit points, temp HP, the escalation die, and conditions during one encounter at a time. It is a **local-only, offline-first, installable PWA** — mobile-first and operable one-handed in a dim room, fully private (no backend, no accounts, no network), with data that survives reloads and app updates.

## Sub-docs

- **[[Combat Planner PRD]]** — Product Requirements: vision, target user, goals/non-goals, the 23 resolved scope decisions, personas, full epics/user-stories with acceptance criteria, non-functional requirements, risks, out-of-scope.
- **[[Combat Planner Rules & Glossary]]** — 13th Age domain reference: every game term, the lifecycle/initiative/turn rules, escalation die math, HP/temp-HP/heal formula, health-status thresholds, defenses, the 12 conditions, and the single source of truth for field defaults, numeric limits, and hard caps.
- **[[Combat Planner Data Model]]** — Conceptual model: AppData → Settings / Combat / Combatant / Condition entities and fields, derived (non-stored) values, integrity rules, key operations as state transitions, the per-combat undo/redo model, the per-combatant HP change log, and persistence/import-export semantics. No storage tech.
- **[[Combat Planner UX & IA]]** — Page map, navigation per breakpoint, Combat screen states (Setup / Start / Active), combatant compact-vs-expanded rows, the HP numpad, key flows, per-screen state coverage, responsive behavior, and feedback/error/accessibility states. No visual design.
- **[[Combat Planner Component Inventory]]** — implementation-layer **component catalog**: every reusable UI component per screen/region, the hierarchy, the variant/prop matrix, and the component → shadcn-svelte primitive → Lucide glyph mapping. Pairs with Architecture (ADR-008/011) and UX & IA.
- **[[Combat Planner Architecture]]** — the **implementation-layer ADR** (first doc that makes tech choices): SvelteKit + Svelte 5 runes, IndexedDB/Dexie, @vite-pwa/sveltekit service worker, Paraglide i18n, svelte-dnd-action, adapter-static SPA on Vercel, shadcn-svelte + Tailwind, Biome/Vitest/Playwright — each as a Decision · Rationale · Alternatives · Consequences entry.
- **[[Combat Planner i18n Message Catalog]]** — the **English source message catalog**: the message-key namespace tree, the English string per key, and the interpolation / ICU shape (counts, plurals, cap/clamp variables, condition + a11y labels). Realizes Architecture ADR-005; pairs with UX & IA (where strings appear) and Component Inventory (what renders them).
- **[[Combat Planner Test Plan]]** — the **test strategy + acceptance matrix** (realizes Architecture ADR-009): the unit / component / E2E layer split, the Vitest/component/Playwright case inventory, and the table mapping every PRD epic/story + UX flow → covering test → layer. Pairs with Architecture (ADR-009/002/013) and all five spec docs.
- **[[Combat Planner Status & Roadmap]]** — project **status**, the round-by-round changelog, open questions, and next docs/milestones.
- **[[Combat Planner Requirements Prompt]]** — the original source sketch the whole set was derived from (generic d20 framing, pre-13th-Age). Kept for provenance; superseded by the docs above where they differ.

## Maintaining this set

How the doc set evolves — the rules a fresh editor (human or agent) follows:

- **One fact, one doc.** Each fact lives in exactly one owner doc (see §Sub-docs for who owns what); every other mention is a short summary + a `[[link]]` pointer, never a copy. Owners today: numeric limits → Rules §7 · undo model → Data §8 · HP change log → Data §9 · control locations → UX §9 · tech choices → Architecture · component inventory → [[Combat Planner Component Inventory]] · i18n catalog → [[Combat Planner i18n Message Catalog]] · test plan + acceptance matrix → [[Combat Planner Test Plan]].
- **Adding a fact** → put the detail in its owner doc; if another doc needs it, add a pointer, not a restatement.
- **Changing / retiring a fact** → edit it in the owner doc only; pointers need no change unless the section moves.
- **Spec docs are timeless** (PRD, Rules, Data, UX, Architecture) — no status, dates, or "what's next" in them. Only **[[Combat Planner Status & Roadmap]]** is living/mutable.
- **Record the change** → the spec is hardened in numbered **rounds**; when a round closes, add one changelog row in [[Combat Planner Status & Roadmap]].
