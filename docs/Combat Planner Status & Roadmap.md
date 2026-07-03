---
aliases:
  - Combat Planner Status
  - Combat Planner Roadmap
  - Combat Planner Status & Roadmap
---

# Combat Planner — Status & Roadmap

> Dashboard for Combat Planner — where the project stands and what's next. Requirements live in
> `specs/` (`specs/README.md`); decisions live in `docs/adr/`; the task queue lives in
> `specs/backlog.md`.

## Maintaining

- **Changelog** — `/spec-close` appends one row to the Change units table per closed unit.
- **Milestones** — updated only when a milestone changes state.
- **Tasks** — never live here; track them in `specs/backlog.md`.

## Status

- Spec-driven since 2026-07-03.
- M1 done (`c7e172a`).
- M2 code-complete (`dfc8582` + `82da34a`); component tests + dogfood pending as B-001/B-002 →
  pilot unit 001.
- Next milestone: M3.

## Milestones

| Phase | Slice | Product value | Status |
|---|---|---|---|
| **M1** | Store seam (ADR-002) + Dexie persist (ADR-003) + migration transforms (ADR-013), test-first. | Core state machine + durable data; nothing real without it. | done |
| **M2** | Combat screen vertical slice — Setup→Active, combatant row (compact/expanded), init tap/long-press, HP numpad, Advance, conditions. | The heartbeat (95% of play). End of M2 = dogfoodable: one hardcoded combat, no polish/i18n/PWA. | code-complete |
| **★ Dogfood gate** | Run 2–3 real fights; log friction. | Riskiest-assumption test — reorder everything below by what actually hurt at the table. | pending |
| **M3** | Combats home — CRUD, drag reorder, first-launch, undo/redo wired. | Multi-encounter prep. | — |
| **M4** | PWA shell (ADR-004) — offline precache, install hint, update toast. | Delivers "installable offline"; real app on the phone, not a localhost tab. | — |
| **M5** | Settings + About + export/import (fail-safe, shared transforms) + i18n wiring (Paraglide ADR-005; strings already cataloged). | Backup/portability (flow F5) + 6 languages. | — |
| **M6** | a11y + theming polish (WCAG-AA, dark/light, focus, ≥44px) + full Test Plan pass + CI gate. | Ship quality; one-handed / dim-room promises verified. | — |
| **Ship v1** | Deploy static SPA on Vercel (ADR-007), PWA installable. | — | — |

## Changelog

### Spec era (rounds 1–13)

Frozen — the spec was hardened in numbered rounds (audit / `/grill-me` passes) before the
2026-07-03 spec-driven-development migration; kept verbatim for provenance.

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

### Change units

Rows added by `/spec-close`, one per closed change unit.

| Unit | Date | Change |
|---|---|---|
