# Verification: 003-ui-design-prototype

Pass: code-diff (working tree). Artifact: `specs/design/prototype.html` (new, 2260 lines).

| AC | Verdict | Evidence |
|----|---------|----------|
| Single self-contained HTML at `specs/design/prototype.html`, inline only (no external CSS/JS/font/image) | PASS | File exists (157 KB). Grep for `http(s)://`/`src=`/`@import`/`<script>`/`url(`/CDN/font hosts returned zero external requests; only `xmlns` SVG namespaces present |
| Renders all core screens: Combats home (populated + empty), Setup, Active, Numpad, Settings, About | PASS | h2 headings: "Combats home — populated list" (1103), "— empty state" (1217), "Combat — Setup" (1275), "Combat — Active" (1358), "Numpad sheet" (1438), "Settings" (1529), "About" (1602) |
| Renders all modals as overlays on parent: CombatFormDialog create+edit, CombatantFormDialog create+edit, ConfirmDialog, import fail-safe | PASS | h2: CombatFormDialog create (1656) + edit (1747), CombatantFormDialog create (1839) + edit (1936), ConfirmDialog (2033), Import fail-safe (2114); each sits over a dimmed parent `.screen` (opacity 0.4/0.5, e.g. 1665, 1848, 2042, 2123) |
| Each screen in both mobile and desktop frame (PLT-2, PLT-3) | PASS | Every screen section has `frame--mobile` + `frame--desktop` cells (e.g. 1109/1161). Counts: 30 mobile, 33 desktop frames. PLT-3: mobile shows burger NavSidebar, desktop inline AppHeader nav via CSS 291-310 |
| Each screen in both dark and light themes | PASS | Each section renders `theme-dark` + `theme-light` (e.g. 1109/1134/1161/1188); `.theme-dark`/`.theme-light` palette scopes defined at 84/125 |
| Combat — Active: HealthBar across all 4 bands, active-turn highlight, RoundCounter + EscalationDie, condition icons + overflow | PASS | 1368-1371: `fill--full`/`fill--wounded`/`fill--bloodied`/`fill--dead` + band-label words; `is-active` row with `active-dot` aria-label "Active turn"; chrome hpills R/3 + Esc/+2 (1365); `cond` icons + `cond-overflow` "+2" (1369) |
| Combatant rows show TypeStripe PC/enemy/ally each paired with text/icon label (no color-alone, PLT-5) | PASS | `type--pc`/`type--enemy`/`type--ally` each accompanied by `type-label` PC/Enemy/Ally text (1368-1371); type-label used 45×, all three type classes present |
| 8 color-tag swatches (ADR-012) on Combats-home rows, distinguishable without color | PASS | 8 distinct tags red/orange/amber/green/teal/blue/violet/neutral, each carrying an initial letter (R/O/A/G/T/B/V/N) + `combat-row__tagname` word (1118-1125) |
| Every semantic fg/bg pair meets WCAG-AA in both themes, recorded in a contrast note block (PLT-5) | PASS | Contrast note section (2197) with table: text pairs 16.4:1/16.1:1, muted 7.6:1/6.5:1 (>=4.5), type >=6.3/>=3.8, health >=3.7/>=3.6, tags >=6.3/>=3.2 (>=3 for non-text); dark+light columns; states AA thresholds |
| Direction: utility / calm neutral, dark-primary; color reserved for meaning | PASS | `:root` neutral chrome scales shared by both themes (comment 13-14, 53); palette scoped, semantic color only for type/health/tags; header comment at 244 |
| `npm run gate` stays green | PASS | Ran full gate: EXIT=0, 25 test files / 123 tests passed, build + PWA succeeded |

## Scope check
in-scope-only. Working tree touches only: `specs/design/prototype.html` (new, the product), `specs/changes/003-ui-design-prototype/tasks.md` (new meta), and `change.md` (status `approved`→`verifying`, normal lifecycle bump). No edits to `src/`, `specs/capabilities/*`, `specs/reference/*` (incl. component-inventory.md), `specs/adr/*`, or `src/routes/layout.css` — all correctly deferred to units B/C/D/E per the out-of-scope list. No new dependencies.

## Other findings
none. Prototype is consistent with referenced capability ACs; no regression or contradiction of unrelated capabilities observed (artifact is a static doc, cannot affect runtime behavior — gate confirms no source breakage).
