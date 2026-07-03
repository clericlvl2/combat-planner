---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner Status
  - Combat Planner Roadmap
  - Combat Planner Status & Roadmap
related:
  - "[[Combat Planner Overview]]"
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Architecture]]"
---

# Combat Planner — Status & Roadmap

> Dashboard for Combat Planner — where the project stands and what's next. Decisions live in
> `specs/` (`specs/README.md`); this only tracks *where we are*. The spec was hardened in
> numbered **rounds** (audit / `/grill-me` passes) before the spec-driven-development migration;
> post-migration work tracks against `specs/changes/` units instead.

## Maintaining

Edit only when a **round** closes (same change as the spec): add one changelog row, refresh the Status line, add/clear an Open question, prune Next. **One line per change** — the *what/why* belongs in the owning spec doc, never here.

## Status

**v1 spec set complete, now spec-driven.** Requirements live in `specs/capabilities/` (12 files, stable IDs) + `specs/reference/`; stack decisions in `docs/adr/`; the original discipline docs are frozen in `docs/archive/` for provenance. 0 open spec questions; 1 open **product** question (distribution/audience — see below) that doesn't block the build. Doc map: `specs/README.md`.

**Build: M1 shipped; M2's first-touch rework (round 13) is code-complete and gate-green, about to commit** (see Build status).

## Build status

Tracks where the *code* stands against the Next phases (the spec above is build-ready; this is the implementation read-out).

**M1 — Store + persistence core: done.** Committed `c7e172a` on `main`; gate green (store seam ADR-002, Dexie persist ADR-003, migration transforms ADR-013).

**M2 — Combat screen vertical slice: round-13 rework code-complete, about to commit.**
- Built on the `main` working tree: shadcn-svelte vendored (17 primitives + `bits-ui`, ADR-008); `src/lib/icons.ts` (ADR-011 glyph map); the combat screen at `/combats/[id]` wired to the M1 store through an id-scoped controller seam (`src/lib/components/app/controller.ts`). Components (`src/lib/components/app/`): CombatHeader (back · undo/redo · round · escalation · ⋮ menu + Clear/Restart ConfirmDialog), CombatantRow (Collapsible compact↔expanded, persistent `⋮` menu, type color stripes, HP-status card background), InitCell (tap = roll / long-press = manual, no ± toggle), HealthBar (incl. reverse/alarm dead bar), ConditionIconList (+K overflow, removable × when expanded), ConditionPicker (12 toggles), NumpadSheet (digits + Deal Damage / Restore HP / Set Temp HP + read-only History), CombatantForm (add/edit), NumberField (native min/max), ConfirmDialog. `TypeBadge` and `RowActions` were removed in round 13 — folded into inline stripes and the persistent `⋮` menu respectively. Boot hydrates the store + seeds one demo combat (`src/lib/dev-seed.ts`, TODO M3). `npm run lint` + `npm run check` + `npm run build` + full unit suite pass.
- **Not yet done:** component tests (`specs/reference/acceptance-matrix.md` component-layer rows) not written; live-browser dogfood of round 13 not yet run; no M2 commit as of this doc-sync pass (commit follows immediately after).

### First-touch rework — round 13 (resolved)
The author's first hands-on touch (round 12, 2026-07-01) surfaced that requirements needed rework before M2 could lock. A second, more detailed first-touch report followed; round 13 (2026-07-02) implements all of it: escalation die restored as a stored value (round-wrap-only increment, decoupled from the round counter), `monster` → `enemy` rename (enum, CSS vars, icon-map key, i18n, `DATA_VERSION` 1→2 migration), persistent per-row `⋮` menu, native `min`/`max` on numeric inputs, init range −9..99 (no more ± toggle), color-stripe type indicator (icon dropped, `aria-label` compensates), HP-status card backgrounds, full-width Save buttons, and no-live-autosort in Setup (sorts only on Start). Spec docs (this set) are synced to match in the same pass. Treat M2 as locked once this commits; further changes go through the normal spec-then-code flow.

### Test caveat
The component-layer cases (`specs/reference/acceptance-matrix.md`) are still wanted — author them now that round 13 has settled the mechanics (escalation, type enum, sort-on-Start). The M1 pure-domain unit tests were updated in round 13 alongside the escalation/type/range changes and remain the valid baseline (`derive.spec.ts`, `transitions.spec.ts`, `clamp.spec.ts`, `migrations.spec.ts`).

### Open test-plan gaps (carried over from the archived Test Plan §8, unresolved)
Flagged during the spec-driven-development migration (2026-07-03); none block the build, but none are resolved either — pick these up whenever the store-seam/CI work they touch is next in scope.
- **No coverage number ratified.** The store-seam unit-coverage threshold is unset — pin a concrete % in `docs/adr/ADR-009.md` (currently only "near-total").
- **Viewport matrix unspecified.** `specs/capabilities/platform.md` PLT-2/PLT-3 define mobile/tablet/desktop behavior but no doc pins the Playwright project list / exact breakpoints.
- **Persistence round-trip ownership.** Whether "survives reload/update" ([[platform]] PLT-7) needs a dedicated interrupted-write/transaction-integrity harness test (beyond E2E) is unstated — flag for the store-seam build.
- **a11y depth.** WCAG-AA ([[platform]] PLT-5) is checked via per-component label assertions + manual focus review; whether an automated axe-style scan is in scope isn't decided.
- **Test-data fixtures / RNG seam.** Unit cases assume an injectable `d20` (ADR-002 store seam); the exact injection point isn't named anywhere — confirm during the store-seam build.

## Changelog

One line per round.

| Round | Date | Change |
|---|---|---|
| 1 | — | Initial spec set: PRD, Rules & Glossary, Data Model, UX & IA. |
| 2 | 2026-06-27 | Setup→Active lifecycle; temp-HP / heal model; 30/100 caps; (then) per-action undo toasts. |
| 3 | 2026-06-28 | `ally` type (visual-only); Overview hub created; round-99 wrap-only block + minor re-audit fixes. |
| 4 | 2026-06-28 | Undo toasts → per-combat **Undo/Redo history** (10-deep); full **control-surface map** (now `specs/reference/component-inventory.md` + `specs/capabilities/platform.md` PLT-2/PLT-3). |
| — | 2026-06-28 | **Architecture ADR** landed — SvelteKit / Dexie / PWA / Paraglide / etc. |
| 5 | 2026-06-29 | Per-combatant **HP change log** (now `specs/capabilities/hp-log.md`); separate from undo; rides export/import. |
| 6 | 2026-06-29 | Full audit → 8 fixes (Advance FAB, Import control, Max-HP undo step, Start snapshot + 4 minor); status split into this doc. |
| 7 | 2026-06-29 | Open Qs resolved — ADR-011 Lucide icons, ADR-012 color-tag palette, ADR-013 schema versioning. |
| 8 | 2026-06-29 | Consistency pass — dedup to one-fact-one-doc (limits → Rules §7, undo → Data §8, HP-log → Data §9, controls → UX §9); Overview Locked-scope cut + **Maintaining this set** added. |
| 9 | 2026-06-29 | **Component Inventory** doc added — component catalog + hierarchy + variant/prop matrix + component → primitive → glyph map; flags missing chrome glyphs back to ADR-011. |
| 10 | 2026-06-29 | **i18n Message Catalog** doc added (ADR-005) — English-source key tree + copy + ICU/interpolation; condition + a11y label strings; cap/clamp numbers pointed to Rules §7. |
| 11 | 2026-06-29 | **Test Plan** doc added (ADR-009) — unit/component/E2E layer split + case inventory + requirement→test acceptance matrix (PRD epics + UX F1–F5); numbers/transitions/flows pointed to their owner docs. |
| 12 | 2026-07-01 | **First-touch rework** — escalation override is now long-press (not tap), mirroring the init cell; the init cell locks (no tap-roll / long-press) once a combat is Active, manual edit only (add form too, for mid-combat latecomers). |
| 13 | 2026-07-02 | **First-touch rework II** — escalation die is a stored value (round-wrap-only +1, decoupled from the round counter, no more auto/override); `monster` → `enemy` rename everywhere (`DATA_VERSION` 1→2 migration); persistent per-row `⋮` menu replaces the expanded action row; native `min`/`max` on numeric inputs; initiative range −9..99, no more ± toggle; combatant type shown as color stripes (icon dropped, `aria-label` compensates — amends the "never color-alone" invariant); card background reflects HP status; full-width Save buttons; Setup no longer auto-sorts live (sorts on Start only). |

## Next

Spec is done. Remaining work is **build → dogfood → ship → v2**. Build a vertical slice to the table fast, validate the core bet (DM runs combat one-handed, dim room, faster than pen+paper) in a real fight, then layer the platform promises. Tooling/ADRs per `docs/adr/README.md`; tests per `specs/reference/acceptance-matrix.md`.

| Phase | Slice | Product value |
|---|---|---|
| **M1** | Store seam (ADR-002) + Dexie persist (ADR-003) + migration transforms (ADR-013), test-first. **← start here.** | Core state machine + durable data; nothing real without it. |
| **M2** | **Combat screen vertical slice** — Setup→Active, combatant row (compact/expanded), init tap/long-press, HP numpad, Advance, conditions. *(code-complete; paused at the first-touch rework gate — see Build status.)* | The heartbeat (95% of play). End of M2 = **dogfoodable**: one hardcoded combat, no polish/i18n/PWA. |
| **★ First-touch rework** | Author pokes the slice → report → fixes conversation → fold into spec + code, then commit M2. | Cheap correction *before* the live dogfood — catch requirement misses while the code is still warm. |
| **★ Dogfood gate** | Run 2–3 real fights; log friction. | **Riskiest-assumption test** — reorder everything below by what actually hurt at the table. |
| **M3** | Combats home — CRUD, drag reorder, first-launch, undo/redo wired. | Multi-encounter prep. |
| **M4** | PWA shell (ADR-004) — offline precache, install hint, update toast. | Delivers "installable offline"; real app on the phone, not a localhost tab. |
| **M5** | Settings + About + export/import (fail-safe, shared transforms) + i18n wiring (Paraglide ADR-005; strings already cataloged). | Backup/portability (flow F5) + 6 languages. |
| **M6** | a11y + theming polish (WCAG-AA, dark/light, focus, ≥44px) + full Test Plan pass + CI gate. | Ship quality; one-handed / dim-room promises verified. |
| **Ship v1** | Deploy static SPA on Vercel (ADR-007), PWA installable. | — |

M1 + M2 are the only phases gating first validation — prioritize ruthlessly to the dogfood gate.

### Pre-build gap
- **No visual design.** The UX behavior specced in `specs/capabilities/` is layout-intent only; shadcn / Lucide / palette ADRs (008/011/012) exist but no screens are designed. Needs a token + screen pass before or within M2.
- **Desktop layout.** Deferred at the M2 first-touch rework (2026-07-01) — mobile-first vertical slice only; revisit before M6 polish.

### v2 backlog (priority — from `docs/archive/Combat Planner PRD.md` §9)
1. **Monster / encounter library** (reusable stat blocks) — highest value; kills the rebuild-the-roster-every-fight friction. PRD-flagged strong v2.
2. **Saved party template** — lighter cut: save the PC party once, reuse. Candidate v1.5.
3. *Defer hard:* multi-device sync/cloud (breaks local-only/private invariant), rules automation (explicit non-goal), other game systems, live-session sharing.
