---
status: archived
backlog: —
---

# Change: ux-interaction-overhaul

## Why

Second grand pass, this time on **interaction + layout behavior** (unit 019 was visual fidelity).
Dogfooding on desktop and mobile surfaced a batch of real bugs and UX gaps: language changes need
a manual F5 to apply; the app goes full-bleed / ultra-wide on large monitors and the combat-screen
header is clipped on its sides; combat cards aren't clickable to open and drag from anywhere;
both modals render their Cancel button *outside* the dialog panel; the desktop HP numpad opens as a
bottom drawer instead of a modal; and several smaller card/nav/form interaction issues. Also folds
the three follow-ups left open by unit 019 (hardcoded modal placeholders, stale `.jump-turn`
prototype markup, duplicated desktop-nav markup).

Settled decisions (from the drafting interview):
- **First-run default language = always English** (drop browser-autodetect). This **amends SET-1**.
- **Desktop content max-width = 768px** (narrowed from an initial 1024px after dogfooding — 1024
  left the combat-screen header clipped with no side gutter and columns too wide); content centers
  with gutters on wider screens. New `--content-max` design token, **plus horizontal gutter
  padding on the shared container** so header/body never touch the viewport edge at cap width.
- **Color-tag swatch tiles are buttons** — they keep a normal hover affordance **and** a clear,
  persistent selected indicator (it is a form field; the current choice must stay visible).

A **second dogfood batch of 13 fixes** is folded into this unit (not spun off as a new unit): max-width
narrowed to 768 + header gutter; color-tag *selected* indicator that renders live; search-highlight
square corners; init-cell fixed width (1- and 2-digit equal) + pointer cursor + no min-height;
unified HP-number+health-bar tap target; AC/PD/MD 3-across desktop must fit the modal; three-dots
and expand-chevron equal size; combatant-card internal gap removed; 44px touch targets for the
card and combat-header overflow menus on mobile; and a larger mobile bottom safe-area below the
stacked FABs. The corresponding rows/ACs are folded into the sections below.

A third round of dogfood fixes is also folded in: (a) the **add/edit-combatant modal is relaid as
an inline label-left grid** — every field (Name, Type, Max HP, Init, AC, PD, MD, Note) is one row
with an uppercase label in a fixed ~6rem left column and its control filling the remaining width;
numeric steppers span the full control width. This **supersedes the earlier AC/PD/MD 3-across
desktop / stacked-mobile treatment** (that grid is removed) and makes the modal short enough to
fit a phone viewport without vertical overflow (the Add button was falling off-screen). (b) the
**combat-screen header is a true full-bleed bar** — its background spans the full viewport width
with content centered/capped inside, so the shared 768px content-container's side gutter no longer
insets the header and leaks page background beside it on mobile.

## What changes

By capability-spec ID (and design-source / token targets):

| ID | Change |
|----|--------|
| `SET-1` | amend: (a) switching language applies **instantly, no reload** — the running code currently requires a manual F5; fix the code to satisfy the already-stated SET-1 AC. (b) first-run default language becomes **always English**, dropping browser-locale autodetect; SET-1 text + AC updated. |
| `PLT-2` | amend: introduce an app-wide desktop **content max-width of 768px** (`--content-max` token), centered with gutters; header and card columns stop going full-bleed / ultra-wide on large monitors. Add **horizontal gutter padding** to the shared container so header/body content never touch the viewport left/right edges at cap width (fixes the combat-screen header being flush-clipped). |
| `PLT-3` | amend: (a) combat-screen header no longer clipped on its sides on desktop — it respects the same max-width/gutter container as every other screen. (b) header layout restructure across **all** screens: page-control buttons (New combat, combat controls, etc.) are grouped **before** the nav icon buttons and the nav group is a **visually distinct section** from the controls. (c) desktop nav is realized by a **single shared nav component** (removes the `CombatHeader` ↔ `AppHeader` duplicate `.nav-desktop` markup — unit 019 follow-up). |
| `CLS-1` | amend: on desktop, hovering a combat row highlights the **whole card**. |
| `CLS-5` | amend: the whole combat card is clickable/tappable to open the combat, **except** the drag handle and the `⋮` menu (the code currently doesn't open from a full-card tap); CLS-5 AC extended to name the drag-handle exclusion alongside the existing `⋮` exclusion. |
| `CLS-6` | amend: drag-to-reorder is initiated **only** from the `lucide` grip-vertical handle — the grab cursor and drag affordance appear on the handle only, not the whole card. |
| `CLS-9` | amend: search also matches the combat **description** (not only title), and **highlights** the matched substring in the rendered results. The highlight `<mark>` has **square corners** (no rounded-corner styling on the match highlight). |
| `CLS-2` | amend: (a) the create-combat modal **Cancel button renders inside** the dialog panel footer (currently rendered outside the modal — bug). (b) color-tag swatch tiles behave as **buttons — normal hover affordance kept** — **and** the **selected** tile carries a clear persistent selected indicator distinct from hover (it is a form field — the choice must stay visible) — the selected indicator must **actually render visibly at runtime** (a persistent, visible ring/outline on the chosen tile, not merely a class that fails to paint); a click sets the color tag. (c) title/description placeholders become **paraglide i18n keys**, not hardcoded English literals (unit 019 follow-up). |
| `CBT-2` | amend: on the combatant card, the **expand/collapse chevron moves to sit next to the `⋮` menu** (trailing controls cluster), not adjacent to the name/title. The **expand/collapse chevron and the `⋮` overflow button render at the same size**; the combatant-card container's **internal gap rule is removed**; on mobile the card `⋮` overflow trigger is a **≥44px touch target**. |
| `HP-4` | amend: the **current-HP number and the health bar form a single unified interactive target** (no gap between them) that opens the HP numpad — one **rounded** hover/press area with a **pointer cursor** on desktop (supersedes treating them as two separate targets). |
| `HP-6` | amend: on **desktop the HP numpad opens as a centered modal dialog**, not a bottom drawer (mobile keeps the drawer) — realizes the placement already stated in `component-inventory.md`; fix the code. |
| `INI-2` | amend: the init cell/pill **hover affordance is scoped to the inner control only** (remove the oversized outer hover area) and the control is **shrunk** to the prototype size. The init cell/pill has a **fixed width so 1-digit and 2-digit values render the same width**, a **pointer cursor**, and **no `min-height`**. |
| `CBT-3` | amend: (a) the add/edit-combatant modal **Cancel button renders inside** the dialog panel footer (currently outside — bug). (b) numeric counter fields show their **default values as real pre-filled editable values** (e.g. Max HP 10, Init 0, AC/PD/MD 10), not as faint placeholder text. (c) the **Name placeholder is type-specific** — "Hero Name" for PC, "Enemy" for Enemy, "Ally" for Ally (was "Namius Name"); if the name is left empty on save, the type placeholder becomes the combatant's **real stored name**. (d) title/description/note placeholders become paraglide i18n keys, not hardcoded literals (unit 019 follow-up). (e) superseded by (f) — the AC/PD/MD 3-across row is removed in favor of the inline label-left grid. (f) the whole modal is relaid as an **inline label-left grid**: each field is one row — an uppercase label in a fixed ~6rem left column, its control filling the rest of the width; numeric steppers span the full control width. This **replaces** the prior AC/PD/MD multi-column grid entirely. |
| `CBT-3` (mobile) | superseded — the inline label-left grid (CBT-3f) applies at every breakpoint; there is no separate mobile AC/PD/MD stacking rule anymore. |
| `SET-5` | amend: remove the stray colored line/border on one of the About-screen boxes. |
| design-tokens | new: add `--content-max: 768px` to `specs/design/tokens.css`, wired through `layout.css @theme`; consumed by the shared desktop container. |
| design-source | reconcile: remove the stale mobile `.jump-turn` floating-pill markup from `specs/design/prototype.html` (feature removed in archived unit 011 — unit 019 follow-up left it); reflect the header control/nav sectioning, expand-chevron placement, 768px container, and desktop-numpad-modal in `prototype.html` / `card-prototype.html` / `component-inventory.md` as needed. Reflect the **768px** container + gutter, the **unified HP tap target**, and the **init fixed-width / no-min-height** in the prototypes / component-inventory as needed. |
| PLT (mobile) | new: (a) the combat-screen **mobile bottom padding exceeds 2× the FAB height + inter-FAB gaps** so content is never hidden behind the stacked FABs. (b) the combat-screen **header overflow (`⋮`) / icon controls are ≥44px touch targets** on mobile. (c) the combat-screen header is a **full-bleed bar** — its background spans the full viewport width with content centered/capped inside; the shared 768px content-container's horizontal gutter must NOT inset the combat header (no page background leaking beside the header on mobile). |
| NumberField | new: add an opt-in **inline** layout variant to `NumberField.svelte` (label in a fixed left column, stepper filling the rest) consumed by the combatant modal; the default stacked layout is unchanged so the combat-header round/escalation popovers keep their current look. |
| i18n | new: add source keys (all 6 locales, paraglide regenerated) for the modal placeholders (combat title/description, combatant name-per-type/note) introduced above; never hand-edit `src/lib/paraglide/*`. |

## Acceptance criteria

Each bullet is independently verifiable by a fresh read-only agent from the diff.

**Localisation (SET-1)**
- [ ] Changing the language in Settings updates all visible strings **without a page reload** (no `location.reload()` / F5 required); verifiable from the reactive wiring in the settings/language code path.
- [ ] First launch with no stored language preference resolves to **English** regardless of browser locale; SET-1's requirement text + AC no longer describe browser-locale autodetection as the first-run default.

**Desktop layout (PLT-2 / PLT-3)**
- [ ] A `--content-max: 768px` token exists in `tokens.css`, is wired through `layout.css @theme`, and a shared desktop container caps content width at 768px and centers it (header + card columns no longer span the full viewport on a >768px screen).
- [ ] The combat-screen header content is fully visible on desktop — not clipped/cut on its left or right edges — and shares the same max-width/gutter container as the other screens.
- [ ] The shared container has horizontal gutter padding so header and body content never touch the viewport's left/right edges at cap width (the combat-screen header in particular is no longer flush against the edge).

**Header structure (PLT-3)**
- [ ] Across every app screen header, page-control buttons render **before** the nav icon-button group in DOM/visual order, and the nav group is separated as a visually distinct section (e.g. its own grouping/divider), not interleaved with the controls.
- [ ] On the combats-list header specifically, the **New combat** control renders before the nav icon group.
- [ ] The desktop nav icon row is rendered from a **single shared component** consumed by both the app header and the combat header (no duplicated `.nav-desktop` markup across two components).

**Combats list (CLS-1 / CLS-5 / CLS-6 / CLS-9)**
- [ ] On desktop, hovering anywhere over a combat row applies a whole-card hover highlight.
- [ ] Clicking/tapping anywhere on a combat card navigates to that combat, **except** taps on the drag handle or the `⋮` menu, which do not navigate.
- [ ] Drag-to-reorder starts **only** from the grip-vertical handle; the grab/drag cursor affordance is present on the handle and not on the rest of the card.
- [ ] Typing a query filters rows whose **title or description** contains it (case-insensitive), and the matched substring is visually highlighted in the rendered row.
- [ ] The search match highlight (`<mark>`) has square corners — no rounded-corner class on the highlight.

**Create-combat modal (CLS-2)**
- [ ] The Cancel button renders **inside** the dialog panel (within its footer), not outside the modal frame.
- [ ] Color-tag swatch tiles have a normal button hover affordance, **and** the currently-selected tile carries a clear persistent selected indicator distinct from the hover state (distinguishable from both unselected and merely-hovered tiles); clicking a tile sets the combat's color tag and moves that indicator. The selected indicator is confirmed to render visibly at runtime (a persistent visible ring/outline on the chosen tile), not only present as a class.
- [ ] The title and description placeholders resolve from paraglide message keys (present in `messages/en.json`, regenerated — not hardcoded string literals in the component).

**Combatant card + HP (CBT-2 / HP-4 / HP-6 / INI-2)**
- [ ] The expand/collapse chevron is positioned in the trailing controls cluster next to the `⋮` menu, not beside the name.
- [ ] The current-HP number and the health bar are a **single unified interactive target** (no gap between them) that opens the HP numpad, with one rounded hover/press area and a pointer cursor on desktop.
- [ ] On desktop (≥1024px) the HP numpad renders as a centered modal dialog; on mobile it renders as the bottom drawer.
- [ ] The init cell/pill hover highlight is confined to the inner control (no oversized surrounding hover box); the control has a **fixed width so 1-digit and 2-digit values render identically wide**, a **pointer cursor**, and **no `min-height`**.
- [ ] The expand/collapse chevron and the `⋮` overflow button render at the same size.
- [ ] The combatant-card container's internal gap rule is removed (no inter-block gap spacing that rule previously applied).
- [ ] On mobile, the combatant-card `⋮` overflow trigger is a ≥44px touch target.

**Add/edit-combatant modal (CBT-3)**
- [ ] The Cancel button renders **inside** the dialog panel footer, not outside the modal frame.
- [ ] Max HP, Initiative bonus, AC, PD, and MD fields show their default values as **real pre-filled editable values** (not placeholder-styled hints); on open with no data, the fields read 10 / 0 / 10 / 10 / 10 respectively as actual values.
- [ ] The Name field placeholder is "Hero Name" for PC, "Enemy" for Enemy, "Ally" for Ally; saving with an empty name stores the type placeholder as the combatant's actual name (the created/edited combatant's `name` equals that placeholder).
- [ ] The modal is laid out as an inline label-left grid: every field (Name, Type, Max HP, Init, AC, PD, MD, Note) is one row with an uppercase label in a fixed ~6rem left column and its control filling the remaining width; numeric steppers span the full control width. There is no multi-column AC/PD/MD grid.
- [ ] The relaid modal is short enough that its content plus the Cancel/Add footer fit a phone-height viewport (~667px) without the footer overflowing off-screen.
- [ ] The name/note/other free-text placeholders resolve from paraglide message keys, not hardcoded literals.

**NumberField inline variant (NumberField)**
- [ ] `NumberField.svelte` supports an opt-in inline layout (label in a fixed left column, stepper filling the remaining width); the default (non-inline) layout is unchanged, so the combat-header round/escalation popovers keep the stacked label-above-stepper look.

**About (SET-5)**
- [ ] The stray colored line/border on the About-screen box is removed (no leftover accent border-tint on that container).

**Combat screen (mobile) (PLT)**
- [ ] The combat-screen mobile bottom padding is greater than 2× the FAB height plus the inter-FAB gaps, so combat content is never hidden behind the stacked FABs.
- [ ] The combat-screen header overflow (`⋮`) and icon controls are ≥44px touch targets on mobile.
- [ ] The combat-screen header renders as a full-bleed bar: its background spans the full viewport width, content is centered/capped inside, and no page background is visible in a gutter beside the header at any viewport width (the shared content-container gutter does not inset the combat header).

**Design-source (design-source)**
- [ ] The stale mobile `.jump-turn` floating-pill markup is removed from `prototype.html`.
- [ ] `prototype.html` / `card-prototype.html` / `component-inventory.md` reflect: the 768px desktop container, header control-then-nav sectioning, the expand-chevron trailing placement, and the desktop-numpad-as-modal — no design-source claim contradicts the shipped code after this unit. Also reflect the 768px container + gutter, the unified HP tap target, and the init fixed-width/no-min-height.

**Whole unit**
- [ ] `npm run gate` passes (lint, check, test:unit --run, build).

## Out of scope

- Any store / domain / migration change beyond what the SET-1 default-language and empty-name-save
  behaviors strictly require (`constants.ts` default-language constant and the add-combatant
  name-fallback are in scope; numeric ranges, caps, Dexie schema/upgrades are **not**). No new
  persisted fields.
- New product features beyond the interaction/layout/bug fixes listed above (no new combatant
  fields, no new search operators beyond title+description, no new nav destinations).
- Theme/color-token values (unit 019 already did the WCAG-AA pass) — this unit changes layout and
  interaction, not palette.
- The `NavSidebar` open-overlay width — still no prototype design-truth for it; left as-is (carried
  over from unit 019's out-of-scope).
- Tablet-breakpoint burger-menu behavior (PLT-3) beyond inheriting the shared max-width container —
  no tablet redesign.
- Human-quality translations of the new i18n placeholder keys — this unit guarantees the English
  source copy and 6-locale key parity only, per the project localization flow.
