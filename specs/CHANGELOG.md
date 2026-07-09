# Changelog

Append-only changelog for Combat Planner spec-driven development. `/spec-close` adds one row
per closed change unit.

## Change units

| Unit | Date | Change |
|---|---|---|
| 001-m2-component-tests-and-dogfood | 2026-07-03 | 7 new `vitest-browser-svelte` component test files for M2 UI components (CombatantRow, CombatantForm, HealthBar, NumpadSheet, ConditionPicker, InitCell, CombatHeader); DM dogfood attestation recorded, referencing pre-existing first-touch play sessions already folded into the M2 rework (`dfc8582` + `82da34a`); B-001/B-002 flipped to `done`. |
| 002-combats-home | 2026-07-04 | M3 Combats home shipped (CLS-1..7): list render with color-tag rows, create with 100-cap block, edit (new `editCombat` domain fn + `CombatStore.editCombat`), confirm-gated cascade delete (no undo), tap-to-open navigation, drag reorder persisting `listOrder`, and first-launch routing branch. Row `⋮` menu ships Edit + Delete only; Export/share stays deferred to CLS-8/M5. |
| 003-ui-design-prototype | 2026-07-06 | Unit A of the 5-unit design chain: delivered `specs/design/prototype.html`, a single self-contained (inline-only) design prototype covering all core screens + modals × mobile/desktop frames × dark/light themes, with a WCAG-AA contrast note; demonstrates PLT-2/PLT-3/PLT-5. No capability/reference spec edits (reconciliation deferred to unit B); gate stays green. |
| 004-design-feedback-iteration | 2026-07-09 | Unit B of the 5-unit design chain: `specs/design/prototype.html` iterated through review rounds R1–R6 to a locked, converged design (Combats-home search/icon-nav/1-col desktop, combat-card restyle via new `specs/design/card-prototype.html`, Setup two-FAB + Active `round-esc-bar` chrome, Numpad-sheet redesign); `specs/reference/component-inventory.md` and `specs/capabilities/platform.md` (PLT-2/3/5) reconciled both to shipped M2 code (closing the first-touch doc-sync miss) and to the converged prototype target; passed an independent doc-pass verify. |
| 005-design-tokens | 2026-07-09 | Unit C of the 5-unit design chain: `src/routes/layout.css`'s STUB token block replaced with the real, WCAG-AA token set (dark + light) — neutral chrome, type colors, health bands, 8 ADR-012 color-tag swatches, typography, spacing, radius, elevation — token values verified verbatim-equal to the approved `specs/design/prototype.html`; every semantic fg/bg pair meets WCAG-AA in both themes (PLT-5 satisfied). No capability/reference wording change needed — PLT-5 already stated the requirement generically. |
| 006-combats-list-screen | 2026-07-09 | Unit D of the 5-unit design chain: restyled CombatList/CombatRow/ColorTagDot/CombatRowMenu/EmptyState (CLS-1, CLS-6), CombatFormDialog (CLS-2/3), and ConfirmDialog (CLS-4) to the approved template; new AppShell/AppHeader/NavSidebar chrome with per-breakpoint nav (swipe-right sidebar mobile, burger tablet, inline icon-nav desktop) and a desktop header create-button / mobile FAB split, incl. the `header-action.svelte.ts` seam (PLT-2/3); restyled Settings (as three inline `<section>` groups, not dedicated sub-components) and About routes, with Settings gaining its first real language/theme/reset-all UI wiring (SET-1/2/3) — accepted as in-scope since the pre-change route was a bare stub with no prior behavior to hold identical, though it ships with no test file yet (flagged as a gap in `specs/reference/acceptance-matrix.md`). `specs/reference/component-inventory.md` corrected: the pre-written Settings/About sub-component names (SettingsGroup/LanguageSwitcher/ThemeSwitcher/DataActions/AboutPage) didn't ship as separate components, and the SearchBar note's "real filtering is unit D" promise didn't ship either. |

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
