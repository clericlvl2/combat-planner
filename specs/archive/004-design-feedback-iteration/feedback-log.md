# Feedback log — unit 004 (design-feedback-iteration)

Per-round record of the design-feedback rounds against `specs/design/prototype.html`. The prototype
is *end-state only*; this log is the durable source for the unit-004 **close-out reconcile** (docs)
and for **code** in units **D** (006 combats-list) / **E** (007 combat). Rounds are **prototype-only**
unless an item pins PLT-2/3/5. Precedence: explicit prior decisions > shipped M2 code > stale
docs/prototype.

**Legend.** *Class:* `(1)` look · `(2)` contradicts shipped code (redesign; code → D/E) · `(3)`
mechanics/data (rejected) · `(—)` n/a. *Done:* ✓ applied · ✗ not. *Reconcile→* (owner to fix at
close-out): `inv` = `component-inventory.md` · `PLT-2/3/5` · `LIF`/`CND`/`CLS`/`SET`/`IMP` = capability files ·
`bl` = `backlog.md` · `D`/`E` = code unit 006/007.

---

## Round index

| R | Date | Scope | Items | Gate |
|:-:|------|-------|:-----:|:----:|
| 1 | 2026-07-07 | Combats Home screen | 8 | ✓ |
| 2 | 2026-07-07 | Remove all import/export | 4 | ✓ |
| 3 | 2026-07-07 | Combat screen redesign (card + Setup/Active chrome) | 15 | ✓ |
| 4 | 2026-07-08 | Combatant card restyle + fidelity fixes (sandbox-only, locked) | 14 | ✓ |
| 5 | 2026-07-08 | Combat-Active desktop + Combatant dialog fixes (post-lock) | 13 | ✓ |
| 6 | 2026-07-08/09 | Numpad sheet redesign + fidelity pass vs shipped `NumpadSheet.svelte` | 9 | ✓ |

## Reconcile ledger (rolling — close-out reads THIS, not every round)

Every doc/code change the rounds owe, keyed by owner. Update as rounds land / items close.

| Reconcile→ | Change owed | Rounds | Status |
|------------|-------------|:------:|:------:|
| `inv` | **add:** icon nav (AppHeader) · header-"+" create (desktop) + FAB (mobile) · search field · ColorTagDot title-initial · 1-col desktop list · EmptyState CTA per breakpoint · **(R3, superseded by R4)** combatant card (bordered stacked: name+expand-chevron+overflow, 24px HP+healthbar, AC/PD/MD+Init pill, full-name cond chips, note line) · Setup 2-FAB (Add + hold-to-start Start) · Active `round-esc-bar` sub-bar · advance-chevron FAB · desktop single-col card · **(R4)** card restyle: unified chip recipe, 19px HP, `--font-sm` internals, `.hp-block`-decoupled healthbar, top-right temp-HP badge, shipped-fidelity condition-chip colours (oklab/transparent), CSS-drawn chevron, 32×32 icon buttons · **(R5)** desktop `.cbt-card` padding bump (`--space-4`), tonal-circle header-advance/header-jump icon buttons, equal-width toggle-group segments, numfield Decrease/value/Increase order (incl. added AC/PD/MD decrease buttons), `.input` font bump, CombatantForm add-mode chrome swapped to header-add/header-start pattern · **(R6)** Numpad sheet rebuilt to match shipped `NumpadSheet.svelte`: entry-display/digit sizing (40px, `--font-lg`/`--font-md`), commit-actions ordered above digit-pad, entry-display border added (was missing), tonal button recipe (`--danger-tint`/`--restore-tint`/`--temp-tint`, 18% color-mix) for all 3 commit actions incl. Deal Damage (first pass wrongly used a solid fill, corrected against code screenshot), ghost Clear(`×`)/Backspace(`‹`) digit-pad buttons, "History" label, colour-coded history chip + signed diff (matches shipped `actionBadgeClass`/delta pattern) while keeping the prototype's own old→new arrow format in the right column (unaccented, no bold). **confirm:** CombatRow tagname absent. **drop:** ImportControl · Import fail-safe dialog · Settings export/import rows. | R1, R2, R3, R4, R5, R6 | ✅ done |
| `PLT-2` | responsive: combat screen desktop = extrapolated (centered single-col card; chrome mirrors mobile + round-esc sub-bar) | R3 | ✅ done |
| `PLT-3` | desktop nav = icon buttons; create control per breakpoint (header "+" desktop / FAB mobile) · **(R3)** combat chrome: Setup header = back+title+⋮ w/ Add + Start FABs; Active header = back+title+⋮ + round-esc sub-bar | R1, R3 | ✅ done |
| `PLT-5` | colour-name aria-label-only (note only — matches shipped) | R1 | ✅ done |
| `LIF` | Start combat = hold-to-start gesture (press-and-hold Start FAB) — **must add keyboard/tap a11y fallback** in E | R3 | pending |
| `CND` | conditions render as filled full-name text chips (no icons, no 2-letter codes); **(R4)** colour recipe = `color-mix(in oklab, var(--combat-X) N%, transparent)` on `.chip` base | R3, R4 | pending |
| `HP` | **(R6)** Numpad sheet entry-display/digit sizing (40px height, `--font-lg`/`--font-md`, bordered), commit-actions ordered above digit-pad, tonal button recipe for Deal Damage/Restore HP/Set Temp HP (matches shipped `NumpadSheet.svelte` Button variants), ghost Clear/Backspace glyphs (`×`/`‹`) | R6 | pending |
| `LOG` | **(R6)** History section renamed from "HP changes"; entries now render a colour-coded action chip + signed diff (left col, matches shipped `actionBadgeClass`) alongside the prototype's own old→new arrow format (right col, kept as a deliberate divergence from shipped cur/max text, now unaccented/non-bold) | R6 | pending |
| `CLS` | +search AC (new behaviour) · CLS-8 pointer + CLS-1 "export/share pending" → drop/defer | R1, R2 | pending |
| `SET` | Settings Data group: drop export/import, keep Reset all | R2 | pending |
| `IMP` | import-export capability descoped → v2 | R2 | pending |
| `bl` | export/import unbundled from M5 + new backlog row B-019 (`v2`) | R2 | ✅ done |
| code `D` | search filter · ColorTagDot title prop · icon nav · header "+" + desktop-FAB removal · 1-col list · empty-state CTA per breakpoint | R1 | pending |
| code `E` | **(R3)** full combat-screen redesign: stacked combatant card (chevron expand + overflow menu; 24px HP + 4-band healthbar + tempHP; Init pill set/unset; full-name cond chips; note line) · Setup Add-FAB + hold-to-start Start-FAB (+ a11y fallback) · Active round-esc sub-bar + advance-chevron FAB · desktop single-col · healthbar now shown in Setup · **(R4, supersedes R3 card style)** locked card restyle from `card-prototype.html`: unified `.chip` recipe, 19px HP, `.hp-block`+`--badge-width` temp-HP badge, `--font-sm` internals, CSS-drawn chevron, 32×32 icon buttons, shipped-fidelity condition-chip + light-theme token colours, collapsed card shows a set note's read-only line (divergence from shipped — E must render the note outside the Collapsible) · **(R5)** desktop card padding token, tonal-circle Advance/Jump header icons, CombatantForm dialog: equal-width type toggle, Decrease/value/Increase numfield order (AC/PD/MD gained decrease), bumped input font, add-mode chrome parity with Setup | R3, R4, R5 | pending |

---

## Round 1 — 2026-07-07

**Scope:** Combats Home screen · **Gate:** ✓ green

**Feedback (verbatim):**

```
Prototype Combats Home Screen

List/rows
- Add search (name+desc)
- Tag-dot letter = combat title's first letter (not color name); dot bg still = picked color
- Remove "RED"/"ORANGE" text row under title
- Remove sort

Mobile
- Empty-state: drop centered "+ New Combat" button, FAB alone stays

Desktop
- Populated list: 2-col grid -> 1 column
- Header nav (Combats/Settings/About) -> icons, applies globally (every screen's header) — your answer
- Add "+" icon to header; replaces FAB on desktop everywhere the create-FAB exists — your answer (Combat-Active advance-turn FAB untouched, different action)
```

**Items:**

| # | Item | Class | Decision | Done | Frames | Reconcile→ |
|:-:|------|:-----:|----------|:----:|--------|------------|
| 1 | Search (name+desc) | (2) | static input now — new behaviour, accepted scope-expansion (real filter → D) | ✓ | populated ×4 | `CLS` `D` |
| 2 | Dot letter = title initial | (2) | apply; aria-label-only colour (shipped dot has no letter) | ✓ | all rows: populated ×4 (8) + bg rows in 6 overlays | `inv` `PLT-5` `D` |
| 3 | Remove "Red/Orange" tagname text | (1) | apply; dropped dead CSS rule | ✓ | populated ×4 | `inv` |
| 4 | Remove sort | (—) | no-op — none existed | ✓ | — | — |
| 5 | Mobile empty-state: drop CTA, keep FAB | (1) | apply; desktop keeps CTA | ✓ | empty mobile ×2 | `inv` `PLT-3` `D` |
| 6 | Desktop list 2-col → 1-col | (1) | de-grid | ✓ | populated desktop ×2 | `inv` `PLT-3` `D` |
| 7 | Header nav → icons, global | (2) | proceed ("your answer") | ✓ | all primary-nav headers: Combats ×8, Settings, About + 6 overlays | `inv` `PLT-3` `D` |
| 8 | Header "+" create; replace desktop FAB | (2) | proceed ("your answer") | ✓ | 16 Combats headers; 4 desktop FABs hidden; mobile FAB + advance FAB untouched | `inv` `PLT-3` `D` |

**Decisions:** search → add static input · colour a11y → aria-label-only (title-initial = row
disambiguator, not a colour signifier) · items 7 + 8 → proceed both.

**Prototype realization (hand-off to D):** create = `.icon-btn.create-desktop` (mobile-hidden) +
`.frame--desktop .fab[aria-label="New combat"]{display:none}` → desktop header button / mobile FAB;
Combat—Active advance-FAB (`aria-label="Advance turn"`) untouched · nav = `.nav-desktop` icon-btns
(⚔ / ⚙ / ⓘ, each `aria-label` + `title`; `.is-current` → `--surface-2`), mobile burger unchanged ·
search = static `.search-bar` (magnifier + placeholder) as first child of the populated `.screen` ·
empty CTA = `.btn--primary.empty-cta` (mobile-hidden) · dot = `.tag-dot` renders the title initial,
bg = colour tag (swatch-*picker* `.swatch` letters keep colour-initials — different control).

---

## Round 2 — 2026-07-07

**Scope:** Remove all import/export UI (app-wide descope) · **Gate:** ✓ green

**Feedback (verbatim):**

```
sort arrow in header (or what is it) is still on prototype. remove it
→ (clarified) remove it from proto completely. i want combats (and app data in general)
  import export milestone to be moved as far as possible
```

**Items:**

| # | Item | Class | Decision | Done | Frames | Reconcile→ |
|:-:|------|:-----:|----------|:----:|--------|------------|
| 1 | "Sort arrow" in header | (—) | it was the ImportControl ↑ (no sort exists) → remove | ✓ | 14 Combats headers | `inv` `CLS` |
| 2 | Settings › Data export/import rows | (2) | remove; keep Reset all (SET-3) | ✓ | 4 Settings frames | `inv` `SET` |
| 3 | Import fail-safe dialog section | (2) | delete entirely (was lines 2158–2237) | ✓ | 4 frames | `inv` `IMP` |
| 4 | Import/export milestone | (—) roadmap | defer past v1 → v2 | ✓ | `backlog.md` | `bl` (done) |

**Verify:** `grep -niE 'import|export'` over the prototype → none. Mobile Combats header is now just
burger + title (create = FAB).

---

## Round 3 — 2026-07-07

**Scope:** Combat screen redesign — combatant card + Setup/Active chrome (from Figma) · **Gate:** ✓ green

**Feedback (verbatim):**

```
[Figma — new combat screen + combat card layout]
"i have a figma design w new combat screen and combat card layout, what we should do?"
File MLMEn9iHBmeOCWorzjMPV2 "Init-tracker" — nodes: 2-1325 combat-setup · 2-2737
setup-holding-start · 2-41 combat-active · 2-884 combatant-card.
Q&A decisions: Start = hold-to-start FAB · keep type stripe · conditions = coloured/muted
text chips, full name, no icons · desktop = extrapolate (mobile card + combats-home desktop
header) · drop the Figma font (no Azeret Mono).
```

**Items:**

| # | Item | Class | Decision | Done | Frames | Reconcile→ |
|:-:|------|:-----:|----------|:----:|--------|------------|
| 1 | `.cbt-row` dense row → bordered stacked card | (2) | full card redesign; Figma px → existing tokens | ✓ | 8 combat + 12 overlay bg | `inv` `E` |
| 2 | Keep type stripe (leading edge) | (—) | confirm — keep (`role=img`+aria) | ✓ | all cards | — |
| 3 | Row 1: name + expand chevron ⌄ + overflow ⋮ | (2) | new expand + per-card menu affordances | ✓ | all cards | `inv` `E` |
| 4 | Row 2: 24px HP cur/max + 4-band healthbar | (2) | keep shipped bands + tempHP pill; Figma flat-grey bar = placeholder, not adopted | ✓ | all cards | `inv` `E` |
| 5 | Row 3: AC/PD/MD + Init pill (`Init N` / `Init –`) | (2) | bordered pill; unset `Init –` on first setup card | ✓ | all cards | `inv` `E` |
| 6 | Conditions → filled full-name text chips | (2) | replace 2-letter codes; muted surface, no icon | ✓ | cards w/ conditions | `inv` `CND` `E` |
| 7 | Note line (`Note: …`) | (2) | render when present | ✓ | card w/ note | `inv` `E` |
| 8 | Setup: drop header "Start combat" btn + `.start-bar` | (2) | header = back + title + ⋮ | ✓ | setup ×4 | `inv` `PLT-3` `E` |
| 9 | Setup: Add FAB (btm-right) + Start FAB (btm-centre **(R3, superseded by R4)**) | (2)+(3) | hold-to-start = new gesture; static visual only; **needs a11y tap fallback**; Start-FAB btm-centre later superseded — repositioned in `prototype.html` to a right-edge vertical stack above the Add FAB (see R4 item 14) | ✓ | setup ×4 | `inv` `LIF` `PLT-3` `E` |
| 10 | Active: header pills → `.round-esc-bar` sub-bar | (2) | bordered sub-bar below chrome | ✓ | active ×4 | `inv` `PLT-3` `E` |
| 11 | Active: advance FAB glyph ▶ → › | (1) | keep `aria-label="Advance turn"` | ✓ | active ×4 | `E` |
| 12 | Keep jump-to-turn | (—) | confirm — unchanged | ✓ | active ×4 | — |
| 13 | Desktop (Figma is mobile-only) | (2) | extrapolate: same card, centred single-col; chrome mirrors mobile | ✓ | 4 desktop combat | `inv` `PLT-2` `E` |
| 14 | Holding-start intermediate state | (—) | SKIP — new state beyond unit-003 prototype scope | ✗ | — | — |
| 15 | Adopt Figma font (Azeret Mono) | (3) | reject — keep current prototype font | ✗ | — | — |

**Decisions:** hold-to-start Start FAB (press-and-hold; E must add keyboard/tap fallback + LIF reconcile) · keep type stripe · conditions = filled full-name muted chips, no icons · desktop extrapolated from mobile card + combats-home desktop header · font unchanged (Azeret Mono rejected) · holding-start frame skipped (out of unit-003 scope).

**Prototype realization (hand-off to E):** card = `.cbt-card` (+ `__body/__head/__hp/__stats`); `.chevron-btn` expand · `.hp-big` (24px tabular) + existing `.healthbar`/`.fill--*` 4 bands (+ tempHP pill) · `.init-pill` (`Init N` / `Init –`) · `.cond-chip` (muted surface, full name) · `.cbt-note`. Bloodied/dead card tint = `color-mix()` on `--health-*`; `is-active` ring kept. Setup: `.fab` add (bottom-right) + `.fab--start` (bottom-centre **(R3, superseded by R4 → right-edge vertical stack above the Add FAB)**, static hold-to-start). Active: `.round-esc-bar` (+ `__item/__label/__val`) as first `.screen` child; advance FAB glyph `›`. Desktop: existing centred container (`max-width` 760 setup / 820 active, `margin:0 auto`). All reuse existing tokens; no new font, no external requests (grep clean).

**Deviations / open gaps (fold into close-out):**
- **Overlay chrome not updated** — the 12 dimmed overlay backgrounds (Numpad ×4, CombatantForm add ×4 / edit ×4) got the new card, but their *chrome* still shows the old Setup "Start combat" button / Active round-esc header pills. Prototype-internal inconsistency → cleanup pass (R4 or pre-close) before the prototype is "converged". **Resolved in R5** (items 7/10/11 + the CombatantForm-add-mode chrome swap) — all 12 overlay backgrounds now carry live Setup/Active header + `.round-esc-bar` markup, no stale pills remain.
- **Section captions + HTML comments** in the combat sections still describe the old UI (persistent Start button, Add-Combatant bar, "no FAB", header round/esc) → prose reconcile owed (prototype-internal). **Resolved in R5** — verified at close-out audit: every section-header HTML comment (Combat Setup/Active, Numpad sheet, CombatantForm add/edit) now describes the current chrome (FAB stack, `[Add][Start]`/`[Advance][Jump][More]` icon buttons, `.round-esc-bar`); no stale-UI prose found.
- **Dead CSS retained** — `.cbt-row*`, `.init-cell`, `.hp-cell`, `.cond`, `.type-label`, `.band-label` now unused; cleanup owed. **Resolved** — verified at close-out audit: none of these classes exist in the file's CSS or markup anymore (`.cbt-row` survives only as a comment referencing the pre-R3 layout it superseded); no cleanup remains.
- **Setup cards now show a full HealthBar** (shipped Setup rows had none) — confirm intended at E; flows from "same card on all 8 frames".

---

## Round 4 — 2026-07-08

**Scope:** Combatant card — sandbox-only restyle + fidelity fixes (new file `specs/design/card-prototype.html`, isolated from `prototype.html` (one exception: the Setup `.fab--start` reposition — item 14 below) per plan `.claude/plans/2026-07-08-r4-card-prototype-and-combat-restyle.md`) · **Gate:** ✓ green throughout, verified every round.

**Feedback (paraphrased across ~8 sub-rounds — full verbatim history in session transcript, superseded by this consolidated record):**

R3's card ported layout but mis-scaled styling (24px HP next to 12px internals, 18px padding, dense-row CSS residue). Locked decision: keep the R3 card *composition* (stacked name+chevron+overflow / big-HP+bar / defs+init-pill / condition chips / note), restyle only — one unified system for margins, spacing, text sizes, radii, chip recipe. Built in isolation in `card-prototype.html` (16 states × 2 themes + desktop wide-card + 5-state note subsection), iterated to convergence, then locked.

**Items:**

| # | Item | Class | Decision | Done | Frames | Reconcile→ |
|:-:|------|:-----:|----------|:----:|--------|------------|
| 1 | Collapse/expand gating | (2) | AC/PD/MD, Init, full cond list always visible; collapsed hides chip `×` + "+Condition"/"+Note" triggers (matches shipped `removable={open}`/`{#if open}`) but keeps a set note's read-only line visible — the one deliberate divergence from shipped (see item 8), which mounts the note only when open | ✓ | all states | `inv` `E` |
| 2 | Unified restyle scale | (1) | card border 1px, radius 12px (kept), padding 14px, inter-row gap `--space-2`(8px, via token not literal), name `--font-md`/600 (kept), HP ~19px tabular/600, defs/init/chips/note bumped `--font-xs`→`--font-sm` | ✓ | all states | `inv` `E` |
| 3 | Chip recipe | (1) | one shared `.chip` base (height 24px, pad 0 10px, `--font-sm`, `border-radius:999px` fully round) for init-pill/cond-chip/tag-trigger; round shape is a deliberate literal override (user pref), not a token | ✓ | all states | `inv` `E` |
| 4 | Condition chip real names + colour | (2) | renamed to real 13th Age names (Hindered/Staggered/Charmed etc.); 11 `.cond--*` classes on `--combat-*` tokens; colour-mix fixed twice — target `--surface-2`→`--surface`, then space+target `in srgb solid`→`in oklab transparent` (true alpha blend, matches shipped Tailwind output) | ✓ | states w/ conditions | `inv` `CND` `E` |
| 5 | Light-theme token drift | (2) | `--combat-orange/amber/green/teal/blue` and `--health-full/wounded/bloodied` corrected to shipped `src/routes/layout.css` `-500` hex values (were invented custom shades) | ✓ | all light-theme states | `inv` `E` |
| 6 | Temp-HP badge | (2) | moved from separate `+N` field to inline top-right corner badge nested in `.hp-big` (`position:relative`+absolute child), width stored as `--badge-width` CSS var, offset `right: calc(-1 * var(--badge-width) - 4px)` — no reserved padding gutter | ✓ | temp-HP states | `inv` `E` |
| 7 | Health bar sizing | (2) | `flex:1 1 auto` (stretches to card end); start position decoupled via new fixed-width `.hp-block` wrapper (96px) around HP+badge, so bar start never shifts with HP digit count | ✓ | all states | `inv` `E` |
| 8 | Note editor states | (2) | 5-state split: collapsed no-note / collapsed w-note (read-only note line **shown** — deliberate divergence from shipped, which hides it) / expanded no-textarea+chip / expanded w-textarea-no-chip / expanded w-filled-textarea-no-chip; `.cbt-note` italic | ✓ | new Note-states subsection | `inv` `E` |
| 9 | Chevron icon | (1) | replaced two Unicode glyphs (font-dependent off-centre ink) with one CSS-drawn rotating corner (`rotate(45deg)→rotate(225deg)`), matches shipped single `rotate-180` semantic | ✓ | all states | `inv` `E` |
| 10 | Icon buttons | (1) | 38px → 32×32 | ✓ | all states | `inv` `E` |
| 11 | Card bg tint on health band | (1) | removed (health-bar fill colour change stays as the signal) | ✓ | bloodied/dead states | `inv` `E` |
| 12 | Init pill light-theme bg | (1) | white bg, `.theme-light .chip.init-pill` only | ✓ | light-theme states | `inv` `E` |
| 13 | 3-digit max-HP + desktop wide-card | (—) | added stress-test state + 720px desktop section (3 representative states × 2 themes) | ✓ | new states | `inv` `E` |
| 14 | Setup `.fab--start` reposition (`prototype.html`) | (1) | moved from bottom-centre to a right-edge vertical stack above the Add FAB (`right:var(--space-4)`; `bottom:calc(var(--space-4) + 56px + var(--space-4))`; `transform:none`) — supersedes R3 item 9's btm-centre; the round's only `prototype.html` edit | ✓ | Combat-Setup ×4 | `inv` `PLT-3` `E` |

**Decisions:** restyle-only, composition unchanged (locked at plan start) · chip shape (round, `999px`) is user's explicit aesthetic call, independent of shipped-code fidelity · card **locked** 2026-07-08 — approved to port into `prototype.html` (Step B).

**Prototype realization (hand-off to E, and to Step B port):** all rules live in `specs/design/card-prototype.html` — `.cbt-card` (`--card-pad:14px --card-gap:var(--space-2) --card-border:1px --hp-size:19px`), `.chip`/`.cond-chip.cond--*`/`.tag-trigger`, `.hp-block`+`.hp-big`+`.hp-temp-badge` (`--badge-width` var), `.healthbar` (`flex:1 1 auto`), `.chevron-btn::after`, `.icon-btn` (32×32), `.cbt-note` (italic). No new tokens, no external requests (grep clean every round). Sandbox kept checked in as the living card spec (plan Step C).

---

## Round 5 — 2026-07-08

**Scope:** Post-lock fidelity fixes — Combat-Active desktop spacing/header, Combatant dialog fields, CombatantForm add-mode chrome (`specs/design/prototype.html` only, per plan `.claude/plans/2026-07-08-r5-combat-active-and-form-fixes.md`) · **Gate:** ✓ green after every task.

**Feedback (verbatim):**

```
1. Combat — Active desktop dark desktop light for some reason looks badly: card paddings is too
small, header icons are wrong. checkout this
2. add combatant modal for dekstop and mobile are styled poorly:
- pc enemy ally is too wide
- all number counter components should be like this
MINUS SIGN | NUMBER | PLUS SIGN
-form fields with text (note, name) -> font too small
3. CombatantForm — "+ Combatant" (add)
- still old header
```

**Items:**

| # | Item | Class | Decision | Done | Frames | Reconcile→ |
|:-:|------|:-----:|----------|:----:|--------|------------|
| 1 | Combat-Active desktop card padding + header icon parity | (1) | `.frame--desktop .cbt-card{--card-pad:var(--space-4)}` (14px→16px, token not literal); tonal-circle treatment (`color-mix(in oklab, var(--text) 12%, transparent)` bg, `border-radius:999px`) extended from `header-add`/`header-start` to `header-advance`/`header-jump`; plain `More` icon-btn left un-circled | ✓ | Combat-Active desktop ×2 (dark/light) | `inv` `E` |
| 2 | Type toggle-group too wide/uneven | (1) | `.toggle-group` → `display:flex; width:100%`, spans `flex:1 1 0; text-align:center` — equal-width PC/Enemy/Ally segments | ✓ | CombatantForm add+edit ×8 | `inv` `E` |
| 3 | Numfield order + missing decrease buttons | (2) | all numfields reordered to Decrease→value→Increase; AC/PD/MD previously had Increase-only, added matching Decrease buttons (`aria-label="Decrease AC/PD/MD"`) — 44 numfield instances corrected total | ✓ | CombatantForm add+edit ×8 | `inv` `E` |
| 4 | Numfield right separator lost | (1) | root cause: reordering (item 3) made Decrease the first child, but `.num-step` only had `border-left` — first-child's border sat flush on the numfield's own outer border, rendering as no internal divider; added `.numfield .num-step:first-child{border-left:none;border-right:1px solid var(--border-strong)}` | ✓ | every numfield, all frames | `inv` `E` |
| 5 | Desktop AC/PD/MD crammed into one 5-col row | (1) | desktop Add+Edit dialogs had Max HP/Init Bonus/AC/PD/MD in one `field-row`; mobile was already split into 2 rows — split desktop to match (row 1: Max HP+Init Bonus; row 2: AC+PD+MD) | ✓ | CombatantForm add+edit desktop ×4 | `inv` `E` |
| 6 | Numfield value not centered | (1) | `.numfield .num-val` had no `justify-content` (left-aligned in its flex space) → added `justify-content:center` | ✓ | every numfield, all frames | `inv` `E` |
| 7 | CombatantForm-edit stale header chrome | (2) | background chrome still showed pre-R3 `hpill` Round/Escalation text pills; replaced with live Combat-Active `header-advance`/`header-jump` icon-button markup (same breakpoint-agnostic pattern, CSS already toggles FAB-vs-header per breakpoint) | ✓ | CombatantForm edit ×4 (mobile+desktop, dark+light) | `inv` `E` |
| 8 | Dialog buttons narrow/right-aligned | (1) | `.dialog-actions` → `justify-content:center`; new `.dialog-actions .btn{flex:1 1 0}` for equal-width buttons filling the row (base `.btn` untouched, shared by digit-pad/commit-actions) | ✓ | every dialog (CombatantForm add/edit, ConfirmDialog, etc.) | `inv` `E` |
| 9 | Combats-home "+" not circled | (1) | extended the existing tonal-circle rule (`header-add`/`header-start`/`header-advance`/`header-jump`) to also cover `.create-desktop`, identical declarations, no new CSS | ✓ | Combats-home desktop headers | `inv` `D` |
| 10 | Whole-file header audit — stale hpill in Numpad sheet | (2) | dispatched read-only audit subagent across every `frame--desktop` chrome in the file first; confirmed Numpad sheet was the only remaining stale `.hpill` Round/Escalation chrome (CombatantForm-edit's copy was already fixed in item 7) — replaced with the same `header-advance`/`header-jump` pattern | ✓ | Numpad sheet ×4 (mobile+desktop, dark+light) | `inv` `E` |
| 11 | Numpad sheet + CombatantForm-edit missing `.round-esc-bar` | (2) | both sections' dimmed Active-context background screen showed a card with no Round/Escalation data anywhere (header nor sub-bar) — inserted the canonical `.round-esc-bar` markup as first child of `.screen`, copied verbatim from Combat-Active | ✓ | Numpad sheet ×4 + CombatantForm-edit ×4 | `inv` `E` |
| 12 | Combat-Active desktop: dead Advance-turn FAB markup | (1) | desktop variants still emitted a mobile-only `<button class="fab" aria-label="Advance turn">`, CSS-hidden on desktop (`.frame--desktop .fab[aria-label="Advance turn"]{display:none}`) but stale/redundant since `header-advance` already covers the action there — removed from the 2 desktop instances only, mobile instances (which need both `.jump-turn` and `.fab`) untouched; the now-dead `.frame--desktop .fab[aria-label="Advance turn"]{display:none}` rule it left behind removed in close-out audit | ✓ | Combat-Active desktop ×2 (dark/light) | `inv` `E` |
| 13 | ConfirmDialog desktop chrome — audit false positive | (—) | audit flagged desktop chrome as using `create-desktop` instead of `nav-desktop`; re-checked directly and desktop variants already correctly use the `nav-desktop` icon group (matches CombatFormDialog pattern) — `create-desktop` only appears in the *mobile* variant, CSS-hidden there same as elsewhere in the file. No change needed. | ✗ (non-issue) | — | — |

**Decisions:** desktop card padding bumped one token step (`--space-4`), not two — 24px judged disproportionate against the card's internal `--card-gap`/`--hp-size` scale · numfield fix folds in a scope gap the R3/R4 rounds left (AC/PD/MD never had a decrease control at all, not just a wrong order) · CombatantForm add-mode chrome swap folded into item 1's `Frames` note below rather than a separate numbered item, since it's a straight copy of the already-decided Setup-screen chrome pattern (R3 item 8, R4 header work), not a new decision · items 4–9 are a same-day follow-up batch (two dispatched fixes after the initial 3-item round landed) — kept in this round rather than opening Round 6, since they're direct continuations of the same feedback pass, not new decisions.

**Prototype realization:** `.frame--desktop .cbt-card{--card-pad:var(--space-4)}` · `.header-add,.header-start,.header-advance,.header-jump,.create-desktop{border-radius:999px;background:color-mix(in oklab,var(--text) 12%,transparent);color:var(--text)}` · `.toggle-group{display:flex;width:100%}` + `span{flex:1 1 0;text-align:center}` · every numfield = `<button Decrease><span num-val><button Increase>`, `.num-step:first-child` swaps border side, `.num-val` centers text · `.input{font-size:var(--font-md)}` · CombatantForm add-mode's 4 background chrome bars use the live Setup-screen `header-add`/`header-start` markup; CombatantForm-edit's 4 use the live Active `header-advance`/`header-jump` markup — both replacing stale pre-R3 text-pill/hpill chrome · `.dialog-actions{justify-content:center}` + `.dialog-actions .btn{flex:1 1 0}`.

---

## Round 6 — 2026-07-08/09

**Scope:** Numpad sheet redesign + fidelity pass — sizing, colour, iconography, and history-log format, checked directly against the shipped `src/lib/components/app/NumpadSheet.svelte` (`specs/design/prototype.html` only). **Gate:** ✓ green after every dispatch.

**Feedback (verbatim, across the round):**

```
lets redesign numpad sheet
i like our version from code [screenshot]
but i want number field smaller
number buttons smaller
submit buttons under input field
can we make that? what we should change in proto

[after clarifying the "code" reference was src/, not prototype.html:]
its not prototype numpad, its written from-code before prorotype

check also colors and text labels, rn they are very bleak, i want like in code for all
(buttons bg, borders etc)
for history i like text from code and hp old -> hp new changes in right col from proto
also change expand chevron like in card

also look at calculator history left col again, copy it
chip | value -> diff

this is styles for submit buttons [pasted computed CSS dump]
this is styles for chips [pasted computed CSS dump]
right col should be unaccented
in chip | value -> value should not be bold
can you copy it?

1. i dont know why but submit buttons are still ugly in terms of contrast of btn bg color and
btn text color. whats the problem?
2. calculator number input should have border like in calc

[screenshots: code vs proto side-by-side]
```

**Items:**

| # | Item | Class | Decision | Done | Frames | Reconcile→ |
|:-:|------|:-----:|----------|:----:|--------|------------|
| 1 | Entry-display/digit size + commit-actions order | (1) | `.entry-display` 40px height (was unset/font-only at 32px), `font-size:var(--font-lg)`; `.digit` 40px height (was 52px), `font-size:var(--font-md)` (was 20px literal); DOM reorder to `entry-display → commit-actions → digit-pad` (was `entry-display → digit-pad → commit-actions`) | ✓ | Numpad sheet ×4 | `HP` |
| 2 | Field/digit background + entry-display border | (1) | `.entry-display`/`.digit` bg → `var(--surface)` (blends into the sheet, matches code's flush field look); root cause found later in the round — `.entry-display` had no `border` at all, added `border:1px solid var(--border-strong)` to match code's bordered field | ✓ | Numpad sheet ×4 | `HP` |
| 3 | Backspace/Clear glyphs | (1) | Backspace `&#9003;` → `&#8249;` (reuses the Back-button chevron entity); Clear `C` → `&#215;` (reuses the cond-chip `×` entity); both buttons split into a distinct `.digit--ghost` (borderless/transparent) class, separate from the bordered 0–9 digit buttons | ✓ | Numpad sheet ×4 | `HP` |
| 4 | "HP changes" → "History" | (1) | label text swap only | ✓ | Numpad sheet ×4 | `LOG` |
| 5 | Commit-action colour + weight — 2 passes | (2) | Pass 1: `btn--danger-solid` (Deal Damage, solid fill), `btn--restore-tint`/`btn--temp-tint` (Restore/SetTemp, 12%→18% color-mix tonal) + `font-weight:700` on all 3. Pass 2 (code-vs-proto screenshot compare): Deal Damage's solid fill was inconsistent against its two tonal siblings — replaced with new `btn--danger-tint` (same tonal recipe, `color-mix(in oklab, var(--health-dead) 18%, transparent)`), matching shipped `NumpadSheet.svelte` Button variants exactly. `.btn--danger-solid` rule itself untouched (still used by Delete-confirm dialogs elsewhere) | ✓ | Numpad sheet ×4 | `HP` |
| 6 | History left column — chip + signed diff | (2) | replaced plain `Damage` text with a colour-coded outline chip (`.hp-log-chip--damage/--heal/--temp`, reusing `--health-dead`/`--health-full`/`--combat-blue`) + a signed diff value (`&minus;9`), matching shipped `actionBadgeClass`/delta pattern; right column's old→new arrow format (`27 → 18`) kept as-is per explicit instruction (prototype's own convention, not adopted from code) | ✓ | Numpad sheet ×4 | `LOG` |
| 7 | History chip/diff refinement to match real computed styles | (1) | user pasted the real Badge's computed CSS: border-color `color-mix(in oklab, var(--combat-blue) 30%, transparent)` and `font-weight: var(--font-weight-medium)` (500) — adjusted `.hp-log-chip--*` border-mix `45%`→`30%` and added `font-weight:500` to `.hp-log-chip` to match | ✓ | Numpad sheet ×4 | `LOG` |
| 8 | Diff value + right column unaccented | (1) | diff value (`.hp-log__diff`) changed from `<b>` to `<span>` (drops bold, keeps colour-coding); right column's `<b>27 → 18</b>` changed to plain `<span>27 → 18</span>` (drops both the bold and the `--text` accent colour, now inherits the row's own muted colour) — dead `.hp-log__entry b{color:var(--text)}` rule removed (grep-confirmed unused after the change) | ✓ | Numpad sheet ×4 | `LOG` |
| 9 | Chevron icon consistency | (1) | history-log collapse toggle's hardcoded `&#9662;` glyph replaced with the card's `.chevron-btn`/`.is-open` CSS-drawn rotating-corner treatment (reused existing CSS, no new rule) | ✓ | Numpad sheet ×4 | `HP` |

**Decisions:** "copy from code" in this round meant the shipped `src/lib/components/app/NumpadSheet.svelte`, not another prototype section — required one clarifying exchange mid-round after an initial (wrong) assumption that the reference screenshot was the prototype's own numpad · history right-column format is a deliberate, explicit prototype-only divergence from shipped code (arrow transition vs. shipped's plain cur/max text) — kept on request, logged under `LOG` as a divergence to note at close-out, not a bug · item 5's first-pass solid Deal Damage button was caught as an inconsistency only via direct code-vs-prototype screenshot comparison, not from the CSS alone — the cascade/specificity was internally correct both times; the "ugly" complaint was a visual-consistency issue between sibling buttons, not a contrast-ratio defect · items validated against real computed CSS the user pasted directly from the shipped component (item 7), not guessed.

**Prototype realization:** `.entry-display{height:40px;background:var(--surface);border:1px solid var(--border-strong);font-size:var(--font-lg)}` · `.digit{height:40px;background:var(--surface);font-size:var(--font-md)}` + `.digit--ghost{background:transparent;border-color:transparent}` · commit-actions DOM moved above digit-pad · `.btn--danger-tint`/`.btn--restore-tint`/`.btn--temp-tint{color-mix(in oklab, var(--X) 18%, transparent)}` + `.commit-actions .btn{font-weight:700}` · `.hp-log__head span` text "History" · `.hp-log-chip{font-weight:500}` + `--damage/--heal/--temp{border-color:color-mix(in srgb, var(--X) 30%, var(--border))}` · `.hp-log__diff` + right-column both plain `<span>`, no `<b>` remaining in `.hp-log__entry`.

---

## Adding a round

Append a `## Round N — YYYY-MM-DD` block in the same shape:

1. `**Scope:** … · **Gate:** ✓/✗`
2. `**Feedback (verbatim):**` + a fenced quote of the user's message (unedited).
3. `**Items:**` table — fixed columns: `# | Item | Class | Decision | Done | Frames | Reconcile→`.
4. `**Decisions:**` — one line, only for non-obvious calls (e.g. Q&A outcomes).
5. `**Prototype realization:**` — CSS/markup hand-off for units D/E, only when it helps them.

Then update the two rolling tables at the top: add the **Round index** row, and fold each item's
`Reconcile→` targets into the **Reconcile ledger** (new row or extend an existing owner's, bump the
Rounds cell). Flip a ledger row to ✅ done the moment its owner file is actually reconciled.

**Guard (once, at close-out):** final reconcile → independent doc-pass verify (fresh read-only
agent: docs vs the converged prototype **and** shipped code) → `/spec-verify` → `/spec-close`.
