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

> Dashboard for the [[Combat Planner Overview|Combat Planner]] doc set — where the project stands and what's next. Decisions live in the spec docs; this only tracks *where we are*. The spec is hardened in numbered **rounds** (audit / `/grill-me` passes).

## Status

**v1 spec set complete — 10 docs, build-ready.** Spec has 0 open questions; 1 open **product** question (distribution/audience — see below) that doesn't block the build. Doc map: [[Combat Planner Overview]].

## Changelog

One line per round.

| Round | Date | Change |
|---|---|---|
| 1 | — | Initial spec set: PRD, Rules & Glossary, Data Model, UX & IA. |
| 2 | 2026-06-27 | Setup→Active lifecycle; temp-HP / heal model; 30/100 caps; (then) per-action undo toasts. |
| 3 | 2026-06-28 | `ally` type (visual-only); Overview hub created; round-99 wrap-only block + minor re-audit fixes. |
| 4 | 2026-06-28 | Undo toasts → per-combat **Undo/Redo history** (10-deep); full **control-surface map** ([[Combat Planner UX & IA]] §9). |
| — | 2026-06-28 | **Architecture ADR** landed — SvelteKit / Dexie / PWA / Paraglide / etc. |
| 5 | 2026-06-29 | Per-combatant **HP change log** ([[Combat Planner Data Model]] §9); separate from undo; rides export/import. |
| 6 | 2026-06-29 | Full audit → 8 fixes (Advance FAB, Import control, Max-HP undo step, Start snapshot + 4 minor); status split into this doc. |
| 7 | 2026-06-29 | Open Qs resolved — ADR-011 Lucide icons, ADR-012 color-tag palette, ADR-013 schema versioning. |
| 8 | 2026-06-29 | Consistency pass — dedup to one-fact-one-doc (limits → Rules §7, undo → Data §8, HP-log → Data §9, controls → UX §9); Overview Locked-scope cut + **Maintaining this set** added. |
| 9 | 2026-06-29 | **Component Inventory** doc added — component catalog + hierarchy + variant/prop matrix + component → primitive → glyph map; flags missing chrome glyphs back to ADR-011. |
| 10 | 2026-06-29 | **i18n Message Catalog** doc added (ADR-005) — English-source key tree + copy + ICU/interpolation; condition + a11y label strings; cap/clamp numbers pointed to Rules §7. |
| 11 | 2026-06-29 | **Test Plan** doc added (ADR-009) — unit/component/E2E layer split + case inventory + requirement→test acceptance matrix (PRD epics + UX F1–F5); numbers/transitions/flows pointed to their owner docs. |

## Open questions

- **Distribution / audience.** Is v1 a **personal tool** (the author's own table only) or **shared with other DMs**? Drives polish depth, onboarding / demo content (today a new DM lands on an empty combat), app naming ("Combat Planner" is generic), and whether multi-device sync ever re-enters scope. Reprioritizes M6 + the v2 backlog. Resolve at/after the dogfood gate.

## Next

Spec is done (10 docs). Remaining work is **build → dogfood → ship → v2**. Build a vertical slice to the table fast, validate the core bet (DM runs combat one-handed, dim room, faster than pen+paper) in a real fight, then layer the platform promises. Tooling/ADRs per [[Combat Planner Architecture]]; tests per [[Combat Planner Test Plan]].

| Phase | Slice | Product value |
|---|---|---|
| **M1** | Store seam (ADR-002) + Dexie persist (ADR-003) + migration transforms (ADR-013), test-first. **← start here.** | Core state machine + durable data; nothing real without it. |
| **M2** | **Combat screen vertical slice** — Setup→Active, combatant row (compact/expanded), init tap/long-press, HP numpad, Advance, conditions. | The heartbeat (95% of play). End of M2 = **dogfoodable**: one hardcoded combat, no polish/i18n/PWA. |
| **★ Dogfood gate** | Run 2–3 real fights; log friction. | **Riskiest-assumption test** — reorder everything below by what actually hurt at the table. |
| **M3** | Combats home — CRUD, drag reorder, first-launch, undo/redo wired. | Multi-encounter prep. |
| **M4** | PWA shell (ADR-004) — offline precache, install hint, update toast. | Delivers "installable offline"; real app on the phone, not a localhost tab. |
| **M5** | Settings + About + export/import (fail-safe, shared transforms) + i18n wiring (Paraglide ADR-005; strings already cataloged). | Backup/portability (flow F5) + 6 languages. |
| **M6** | a11y + theming polish (WCAG-AA, dark/light, focus, ≥44px) + full Test Plan pass + CI gate. | Ship quality; one-handed / dim-room promises verified. |
| **Ship v1** | Deploy static SPA on Vercel (ADR-007), PWA installable. | — |

M1 + M2 are the only phases gating first validation — prioritize ruthlessly to the dogfood gate.

### Pre-build gap
- **No visual design.** [[Combat Planner UX & IA]] is layout-intent only; shadcn / Lucide / palette ADRs (008/011/012) exist but no screens are designed. Needs a token + screen pass before or within M2.

### v2 backlog (priority — from [[Combat Planner PRD]] §9)
1. **Monster / encounter library** (reusable stat blocks) — highest value; kills the rebuild-the-roster-every-fight friction. PRD-flagged strong v2.
2. **Saved party template** — lighter cut: save the PC party once, reuse. Candidate v1.5.
3. *Defer hard:* multi-device sync/cloud (breaks local-only/private invariant), rules automation (explicit non-goal), other game systems, live-session sharing.

## Maintaining

Edit only when a **round** closes (same change as the spec): add one changelog row, refresh the Status line, add/clear an Open question, prune Next. **One line per change** — the *what/why* belongs in the owning spec doc, never here.
