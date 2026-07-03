# Changelog

Append-only changelog for Combat Planner spec-driven development. `/spec-close` adds one row
per closed change unit.

## Change units

| Unit | Date | Change |
|---|---|---|
| 001-m2-component-tests-and-dogfood | 2026-07-03 | 7 new `vitest-browser-svelte` component test files for M2 UI components (CombatantRow, CombatantForm, HealthBar, NumpadSheet, ConditionPicker, InitCell, CombatHeader); DM dogfood attestation recorded, referencing pre-existing first-touch play sessions already folded into the M2 rework (`dfc8582` + `82da34a`); B-001/B-002 flipped to `done`. |

## Spec era (rounds 1–13)

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
