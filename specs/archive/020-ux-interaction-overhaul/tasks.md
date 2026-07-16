# Tasks: 020-ux-interaction-overhaul

Generated from `change.md`. Each phase lists its owned files (no other phase touches them) and its
parallel-safety. **Phases execute sequentially** (shared working tree + concurrent `vite build`
race) — the `Parallel-safe with` line is informational: it records logical file-set disjointness,
not a licence to run concurrently. Run phases in the listed order; P2 (i18n keys) must precede the
phases that consume those keys (P6, P7).

Capability-spec text/AC edits (e.g. SET-1's requirement rewording) are **not** done here — those
owner-doc updates belong to the close-out doc-sync step. This file only touches `src/**`,
`messages/*.json`, and `specs/design/*` + `specs/reference/component-inventory.md` (design-source).

---

## Phase 1 — Design token + shared desktop container (PLT-2, design-tokens)

**Owns:** `specs/design/tokens.css`, `src/routes/layout.css`, `src/lib/components/app/AppShell.svelte`
**Parallel-safe with:** none (sequential; logically disjoint from all other phases' files)

- [ ] Add `--content-max: 1024px` to `specs/design/tokens.css` (raw token, alongside the other
      component dims).
- [ ] Wire `--content-max` through `src/routes/layout.css` `@theme` (expose it so a Tailwind /
      utility class can consume it), and define the reusable centered max-width container primitive
      (class or utility) that caps content at `1024px` and centers it with gutters on wider screens.
- [ ] Apply the shared container to routed body content in `AppShell.svelte` (`<main>` wrapper) so
      card columns / list content no longer span the full viewport on a >1024px screen. Settings /
      About keep their own narrower inner columns nested inside it. (Header inner-content alignment
      is completed in Phase 4; combat-screen page container in Phase 4.)
- [ ] Covers AC: `--content-max` token exists + wired through `@theme` + shared container caps
      routed content at 1024px centered (card columns no longer full-viewport).

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 2 — i18n source keys for modal placeholders (i18n; feeds CLS-2c, CBT-3d)

**Owns:** `messages/en.json`, `messages/de.json`, `messages/es.json`, `messages/fr.json`, `messages/ja.json`, `messages/ru.json`
**Parallel-safe with:** none (sequential; only phase touching `messages/*`)

- [ ] Add source keys (English source copy + 6-locale key parity) for the combat create/edit
      placeholders: combat **title** placeholder and **description** placeholder (CLS-2c).
- [ ] Add source keys for the combatant form placeholders: **name-per-type** placeholders
      (PC = "Hero Name", Enemy = "Enemy", Ally = "Ally") and the **note** free-text placeholder
      (CBT-3c/d). Include any other free-text placeholder the combatant form still hardcodes.
- [ ] Regenerate Paraglide (via `npm run prepare` / build — the Vite plugin compiles it); never
      hand-edit `src/lib/paraglide/*`.
- [ ] Covers AC (key-presence half): the new placeholder keys are present in `messages/en.json`
      (regenerated) with full 6-locale parity. Component wiring is verified in Phase 6 / Phase 7.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 3 — SET-1 localisation: instant apply + English first-run default

**Owns:** `vite.config.ts`, `src/routes/settings/+page.svelte`, `src/routes/+layout.svelte`
**Parallel-safe with:** none (sequential; logically disjoint from all other phases' files)

- [ ] First-run default = **always English**: drop `preferredLanguage` from the Paraglide
      `strategy` array in `vite.config.ts` (leave `['localStorage', 'baseLocale']`; `baseLocale` is
      `en`), and correct the now-stale "locale auto-detected from the browser" comment there.
- [ ] Instant apply (no reload): make the running language switch re-render all visible strings
      without `location.reload()` / F5 — the settings path already calls `setLocale(..., { reload:
      false })`; add the reactive wiring so `m[...]()` call-sites re-run on locale change (e.g. a
      keyed re-render keyed on the active locale in `+layout.svelte`, or equivalent reactive seam),
      keeping `store.updateSettings({ language })` persistence intact.
- [ ] Covers AC: changing language in Settings updates all strings without a reload; first launch
      with no stored preference resolves to English regardless of browser locale.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 4 — Shared desktop nav + header control/nav sectioning + combat-header un-clip (PLT-3, PLT-2)

**Owns:** `src/lib/components/app/DesktopNav.svelte` (new, + optional `DesktopNav.svelte.spec.ts`), `src/lib/components/app/AppHeader.svelte`, `src/lib/components/app/CombatHeader.svelte`, `src/routes/combats/[id]/+page.svelte`
**Parallel-safe with:** none (sequential; visual surface = the app/combat headers, kept in one phase)

- [ ] Extract the duplicated desktop `.nav-desktop` icon row (Combats / Settings / About, with
      `is-current` marking) from `AppHeader.svelte` and `CombatHeader.svelte` into a single shared
      `DesktopNav.svelte`; consume it from both. (Removes the unit-019 follow-up duplication.)
- [ ] Restructure every screen header so page-control buttons (New combat, Setup add/start,
      Active advance, overflow ⋮) render **before** the nav icon group in DOM/visual order, and the
      nav group is a **visually distinct section** (own grouping/divider), not interleaved with the
      controls — in `AppHeader.svelte` (render the `headerAction` snippet before the nav) and
      `CombatHeader.svelte`.
- [ ] Give the header inner content the same 1024px shared container (from Phase 1) so header
      content aligns with the body and is not clipped on its sides on desktop.
- [ ] Combat-screen header un-clip (PLT-2): fix `combats/[id]/+page.svelte`'s wrapper
      (`max-w-md lg:max-w-3xl`) so the combat header shares the same max-width/gutter container as
      other screens and its content is fully visible on desktop (not cut on left/right edges).
- [ ] Covers AC: single shared nav component consumed by both headers (no duplicated `.nav-desktop`);
      controls-before-nav with a distinct nav section across all headers; combats-list **New
      combat** control renders before the nav group; combat-screen header fully visible + shares the
      max-width/gutter container.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 5 — Combats-list interactions (CLS-1 / CLS-5 / CLS-6 / CLS-9)

**Owns:** `src/lib/components/app/CombatRow.svelte`, `src/lib/components/app/CombatList.svelte`, `src/lib/components/app/SearchField.svelte`, `src/routes/combats/+page.svelte`
**Parallel-safe with:** none (sequential; visual surface = the combats-list row, kept in one phase)

- [ ] CLS-1: move the hover highlight from the inner name-button to the **whole card** (hovering
      anywhere over a combat row highlights the whole card on desktop).
- [ ] CLS-5: make the **whole card** clickable/tappable to open the combat (call `onOpen`),
      **except** the grip handle and the `⋮` menu, which must not navigate.
- [ ] CLS-6: restrict drag-to-reorder initiation to the `GripVertical` handle only — wire
      `svelte-dnd-action`'s drag-handle in `CombatList.svelte` + mark the handle in `CombatRow.svelte`;
      the grab/drag cursor affordance appears on the handle only, not the whole card.
- [ ] CLS-9: extend the filter in `combats/+page.svelte` to match **title OR description**
      (case-insensitive), thread the active query down through `CombatList` → `CombatRow`, and
      **highlight** the matched substring in the rendered title/description. (`SearchField.svelte`
      only if its markup needs adjustment.)
- [ ] Covers AC: whole-card hover; click-anywhere-navigates-except-grip-and-⋮; drag-only-from-grip;
      search matches title-or-description with matched-substring highlight.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 6 — Create-combat modal (CLS-2a / CLS-2b / CLS-2c)

**Owns:** `src/lib/components/app/CombatFormDialog.svelte`, `src/lib/components/app/ColorSwatchPicker.svelte`
**Parallel-safe with:** none (sequential; consumes Phase 2 keys)

- [ ] CLS-2a: ensure the **Cancel** button renders **inside** the dialog panel footer (not outside
      the modal frame) in `CombatFormDialog.svelte`.
- [ ] CLS-2b: make the color-tag swatch tiles behave as buttons with a **normal hover affordance**
      **and** a clear **persistent selected indicator** distinct from hover (distinguishable from
      both unselected and merely-hovered tiles) in `ColorSwatchPicker.svelte`; a click sets the tag
      and moves the selected indicator.
- [ ] CLS-2c: replace the hardcoded English `placeholder="e.g. Goblin Ambush"` /
      `placeholder="Optional notes"` in `CombatFormDialog.svelte` with the Paraglide message keys
      added in Phase 2.
- [ ] Covers AC: Cancel inside dialog panel; swatch hover + persistent-selected indicator;
      title/description placeholders resolve from Paraglide keys (not hardcoded literals).

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 7 — Add/edit-combatant modal (CBT-3a / b / c / d + mobile)

**Owns:** `src/lib/components/app/CombatantForm.svelte`
**Parallel-safe with:** none (sequential; consumes Phase 2 keys)

- [ ] CBT-3a: ensure the **Cancel** button renders **inside** the dialog panel footer, not outside
      the modal frame.
- [ ] CBT-3b: initialize the numeric fields (Max HP, Init bonus, AC, PD, MD) with their default
      values as **real pre-filled editable values** (10 / 0 / 10 / 10 / 10) on open-with-no-data,
      not faint placeholder hints; drop the placeholder-only defaulting for these fields.
- [ ] CBT-3c: make the **Name placeholder type-specific** ("Hero Name" for PC, "Enemy" for Enemy,
      "Ally" for Ally, from the Phase 2 keys); if the name is left empty on save, store the type
      placeholder as the combatant's **real `name`** (substitute it in the form's `submit()` before
      `onSubmit`, so the created/edited combatant's `name` equals that placeholder — no
      empty-name block).
- [ ] CBT-3 (mobile): stack the **AC / PD / MD** fields vertically (one per row) on mobile instead
      of the 3-across grid (responsive grid-cols).
- [ ] CBT-3d: replace the remaining hardcoded name/note free-text placeholders with the Phase 2
      Paraglide keys.
- [ ] Covers AC: Cancel inside footer; real pre-filled 10/0/10/10/10 values; type-specific name
      placeholder + empty-name-stores-placeholder; mobile AC/PD/MD vertical stack; free-text
      placeholders from Paraglide keys.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 8 — Combatant card + HP + init interactions (CBT-2 / HP-4 / HP-6 / INI-2)

**Owns:** `src/lib/components/app/CombatantRow.svelte`, `src/lib/components/app/HealthBar.svelte`, `src/lib/components/app/InitCell.svelte`, `src/lib/components/app/NumpadSheet.svelte`
**Parallel-safe with:** none (sequential; visual surface = the combatant card + numpad, kept in one phase)

- [ ] CBT-2: move the expand/collapse chevron out of the name row into the **trailing controls
      cluster next to the `⋮` overflow menu** in `CombatantRow.svelte` (chevron no longer adjacent
      to the name/title).
- [ ] HP-4: make **both** the current-HP number and the **health bar** tap/click targets that open
      the HP numpad (in addition to the existing HP cell) — wire the health bar to `onOpenNumpad`
      (wrap/trigger in `CombatantRow.svelte`, adjusting `HealthBar.svelte` if it must become
      interactive).
- [ ] HP-6: render the HP numpad as a **centered modal dialog on desktop (≥1024px)** and keep the
      **bottom drawer on mobile** in `NumpadSheet.svelte` (breakpoint-switched Dialog vs Drawer).
- [ ] INI-2: confine the init cell/pill **hover affordance to the inner control only** (remove the
      oversized outer hover box) and **shrink** the control to the prototype size in
      `InitCell.svelte`.
- [ ] Covers AC: chevron in trailing cluster next to ⋮; HP number OR health bar opens numpad;
      desktop numpad = modal / mobile = drawer; init hover confined to inner control + shrunk.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 9 — About colored line (SET-5)

**Owns:** `src/routes/about/+page.svelte`
**Parallel-safe with:** none (sequential; logically disjoint from all other phases' files)

- [ ] Remove the stray accent border/line on the About privacy box (`border-l-[3px]
      border-l-type-pc` on the `.about` note container) — no leftover accent border-tint.
- [ ] Covers AC: the stray colored line/border on the About-screen box is removed.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 10 — Design-source reconciliation (design-source)

**Owns:** `specs/design/prototype.html`, `specs/design/card-prototype.html`, `specs/reference/component-inventory.md`
**Parallel-safe with:** none (sequential; runs last so it reflects the shipped code from P1–P9)

- [ ] Remove the stale mobile `.jump-turn` floating-pill markup from `specs/design/prototype.html`
      (feature removed in archived unit 011 — unit-019 follow-up).
- [ ] Reflect across `prototype.html` / `card-prototype.html` / `component-inventory.md`, as each
      needs: the **1024px desktop container**, the header **control-then-nav sectioning**, the
      expand-chevron **trailing placement**, and the **desktop-numpad-as-modal** — so no
      design-source claim contradicts the shipped code after this unit.
- [ ] Covers AC: `.jump-turn` removed from `prototype.html`; design sources reflect the 1024px
      container, header control/nav sectioning, expand-chevron trailing placement, and
      desktop-numpad-as-modal.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

# Second dogfood batch (folded amendment)

Phases 1–10 above are already implemented and verified. The phases below plan **only** the
second dogfood batch of 13 fixes folded into `change.md`. **These phases execute strictly
sequentially** — they share one working tree and race on a concurrent `vite build`, so **none is
parallel-safe with any other phase (old or new)**; the `Parallel-safe with` line stays `none`
throughout and only records logical file-set disjointness. Run P11→P17 in order; the
design-source reconciliation (P17) runs **last** so it reflects the shipped code from P11–P16.
No new i18n keys are needed for this batch; `src/lib/paraglide/*` is generated — never hand-edit.

---

## Phase 11 — Narrow container to 768px + shared-container gutter (PLT-2, design-tokens)

**Owns:** `specs/design/tokens.css`, `src/routes/layout.css`
**Parallel-safe with:** none (sequential; shares no files with any other new/old phase)

- [ ] Change `--content-max` from `1024px` to **`768px`** in `specs/design/tokens.css` (the raw
      token consumed by the `.content-container` utility).
- [ ] Add **horizontal gutter padding** to the shared `@utility content-container` in
      `src/routes/layout.css` (e.g. `padding-inline`) so header and body content never touch the
      viewport left/right edges at cap width — this is the fix for the combat-screen header being
      flush-clipped on its sides. Keep the existing `max-width: var(--content-max)` +
      `margin-inline: auto` centering.
- [ ] Covers AC: `--content-max: 768px` token wired through `@theme`; shared container caps + centers
      content at 768px; horizontal gutter so header/body never touch the viewport edge (combat-screen
      header no longer flush-clipped).

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 12 — Color-tag selected indicator paints at runtime (CLS-2b)

**Owns:** `src/lib/components/app/ColorSwatchPicker.svelte`
**Parallel-safe with:** none (sequential)

- [ ] Re-fix the `data-[state=on]` selected outline/ring on the swatch `ToggleGroupItem` so the
      selected indicator **actually renders visibly at runtime** — a persistent, visible
      ring/outline on the chosen tile, distinct from hover and from unselected, not merely a class
      that fails to paint (diagnose why the current `data-[state=on]:outline …` chain does not
      paint — e.g. outline clipped by the tile/`ColorTagDot` overflow or offset, or the on-state
      not reaching the item — and make it visible). Keep the normal hover affordance.
- [ ] Covers AC: the currently-selected swatch tile carries a clear persistent selected indicator
      confirmed to render visibly at runtime (visible ring/outline), distinct from unselected and
      merely-hovered tiles.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 13 — Search-highlight square corners (CLS-9)

**Owns:** `src/lib/components/app/CombatRow.svelte`
**Parallel-safe with:** none (sequential)

- [ ] Drop the `rounded-sm` class from the search-match `<mark>` (both the title and the
      description highlight spans) so the highlight renders with **square corners**; keep the
      background/text-color styling.
- [ ] Covers AC: the search match highlight (`<mark>`) has square corners — no rounded-corner class.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 14 — Combatant-card init cell + unified HP target + trailing controls (INI-2, HP-4, CBT-2)

**Owns:** `src/lib/components/app/CombatantRow.svelte`, `src/lib/components/app/InitCell.svelte`, `src/lib/components/app/HealthBar.svelte`
**Parallel-safe with:** none (sequential; single visual surface = the combatant card, kept in one phase)

- [ ] INI-2 (`InitCell.svelte`): give the init cell/pill a **fixed width so 1- and 2-digit values
      render identically wide**, a **pointer cursor**, and **remove the `min-height`** (drop
      `min-h-11` from the trigger Button and set the pill/control to a fixed width; keep the inner
      hover scoping from Phase 8).
- [ ] HP-4 (`CombatantRow.svelte` Row 2, adjusting `HealthBar.svelte` if needed): unify the
      current-HP number and the health bar into **one** rounded interactive numpad target with **no
      gap** between them (merge the two separate `<button>`s / drop the `gap-3` between them) — one
      rounded hover/press area with a **pointer cursor** on desktop that opens the HP numpad.
- [ ] CBT-2 (`CombatantRow.svelte`): the expand/collapse chevron and the `⋮` overflow button
      render at the **same size**; **remove the container's internal gap rule** (the
      `gap-[var(--card-gap)]` inter-block gap on the card's flex-col column); the card `⋮` overflow
      trigger is a **≥44px touch target on mobile**.
- [ ] Covers AC: init cell fixed-width (1-/2-digit equal) + pointer cursor + no `min-height`;
      unified HP-number+health-bar single rounded pointer target with no gap; chevron and `⋮` equal
      size; card internal gap rule removed; card `⋮` ≥44px touch on mobile.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 15 — Add/edit-combatant modal AC/PD/MD row fits desktop panel (CBT-3e)

**Owns:** `src/lib/components/app/CombatantForm.svelte`
**Parallel-safe with:** none (sequential)

- [ ] Make the desktop **AC / PD / MD 3-across row fit within the dialog panel** with no
      horizontal overflow (e.g. `min-w-0` on the grid children / reconcile the grid gap with the
      `DialogContent` width) — the mobile stacked one-per-row layout stays unchanged.
- [ ] Covers AC: on desktop the AC/PD/MD 3-across row fits within the modal (no horizontal
      overflow); mobile stays stacked one-per-row.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 16 — Combat-screen mobile bottom safe-area + header touch targets (PLT)

**Owns:** `src/routes/combats/[id]/+page.svelte`, `src/lib/components/app/CombatHeader.svelte`
**Parallel-safe with:** none (sequential)

- [ ] Increase the combat-screen **mobile bottom padding** so it **exceeds 2× the FAB height plus
      the inter-FAB gaps** (the stacked Add/Start FABs are `size-14` = 56px at `bottom-4` /
      `bottom-24`; current `pb-28` = 112px is not enough) — content is never hidden behind the
      stacked FABs (`combats/[id]/+page.svelte` outer wrapper).
- [ ] Ensure the combat-screen **header overflow (`⋮`) and icon controls are ≥44px touch targets
      on mobile** in `CombatHeader.svelte`.
- [ ] Covers AC: combat-screen mobile bottom padding > 2×FAB height + inter-FAB gaps (content not
      hidden behind FABs); combat-header overflow/icon controls ≥44px touch targets on mobile.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 17 — Design-source reconciliation, batch 2 (design-source)

**Owns:** `specs/design/prototype.html`, `specs/design/card-prototype.html`, `specs/reference/component-inventory.md`
**Parallel-safe with:** none (sequential; runs LAST so it reflects the shipped code from P11–P16)

- [ ] Reflect the **768px** desktop container + horizontal gutter (supersedes the earlier 1024px
      claim reconciled in Phase 10) across `prototype.html` / `card-prototype.html` /
      `component-inventory.md` as each needs.
- [ ] Reflect the **unified HP tap target** (current-HP number + health bar as one rounded target,
      no gap) and the **init cell fixed-width / no-`min-height`** in the prototypes /
      `component-inventory.md` as needed — no design-source claim contradicts the shipped code after
      this unit.
- [ ] Covers AC: design sources reflect the 768px container + gutter, the unified HP tap target,
      and the init fixed-width/no-min-height.

**Gate:** `npm run gate` must pass before this phase is reported done.

---

# Third dogfood batch (folded amendment)

Phases 1–17 above are already implemented and verified. The two phases below plan **only** the
third round of dogfood fixes folded into `change.md`: (18) the add/edit-combatant modal relaid as
an inline label-left grid (CBT-3f + the `NumberField` inline variant), and (19) the combat-screen
header made a true full-bleed bar. **Both phases execute strictly sequentially** — they share one
working tree and race on a concurrent `vite build`, so **neither is parallel-safe with any other
phase (old or new)**; the `Parallel-safe with` line stays `none`. Their file sets are disjoint
from each other. Run P18 before P19.

---

## Phase 18 — Combatant modal inline label-left grid (CBT-3f, NumberField inline variant)

**Owns:** `src/lib/components/app/NumberField.svelte`, `src/lib/components/app/CombatantForm.svelte`
**Parallel-safe with:** none (sequential; the user-approved modal-layout surface, kept in one phase)

- [ ] `NumberField.svelte`: add an opt-in **`inline` prop (default `false`)** — the current
      stacked layout stays **UNCHANGED** when `inline` is false (the combat-header round/escalation
      popovers reuse this component and must keep the stacked label-above-stepper look). When
      `inline` is true, render the field as a `grid grid-cols-[6rem_1fr] items-center gap-x-3` row:
      the uppercase label in the fixed 6rem left column, the stepper shell in the right column
      filling the full remaining width (stepper `width:100%`, value input flexes to fill, the − / +
      buttons stay fixed-width tap squares), and the clamp-hint `<p>` spanning the full width below
      (`col-span-2` / grid-column `1 / -1`). Preserve all a11y (label `for`=id, spinbutton role,
      `aria-*`) and the existing clamp behavior.
- [ ] `CombatantForm.svelte`: relayout the whole form as an **inline label-left grid** so every
      field is one aligned row — Name, Type, Max HP, Init, AC, PD, MD, Note — each with an uppercase
      label in a fixed ~6rem left column and its control filling the remaining width. Pass `inline`
      to all NumberFields (Max HP, Init, AC, PD, MD, and the manual-initiative field). The Name text
      input, the Type toggle-group, and the Note textarea render in the same label-left grid rows
      (label col 1, control col 2; the Note textarea spans the control column). **REMOVE** the old
      `grid-cols-2` (Max HP/Init) and `grid-cols-1 sm:grid-cols-3 [&>*]:min-w-0` (AC/PD/MD)
      wrappers — there is no multi-column numeric grid anymore (this supersedes Phase 7's mobile
      AC/PD/MD stack and Phase 15's 3-across desktop-fit). Footer (Cancel/Add) unchanged in
      behavior; no bottom divider line needed.
- [ ] `src/lib/components/app/CombatantForm.svelte.spec.ts` is **NOT owned** by this phase. If the
      relayout breaks existing tests (they mostly assert values/labels via `getByLabelText`, which
      should still resolve), **STOP and report** rather than editing the test file.
- [ ] Covers AC: modal laid out as an inline label-left grid (uppercase label in a fixed ~6rem left
      column, control fills the rest; numeric steppers span the full control width; no multi-column
      AC/PD/MD grid); content + Cancel/Add footer fit a ~667px phone-height viewport without the
      footer overflowing; `NumberField.svelte` supports the opt-in inline variant with the default
      stacked layout unchanged (combat-header popovers keep the stacked look).

**Gate:** `npm run gate` must pass before this phase is reported done.

---

## Phase 19 — Combat-screen header full-bleed (PLT)

**Owns:** `src/lib/components/app/AppShell.svelte`, `src/routes/combats/[id]/+page.svelte`, `src/lib/components/app/CombatHeader.svelte`
**Parallel-safe with:** none (sequential; the combat-screen header/body layout surface, kept in one phase)

- [ ] `AppShell.svelte`: root cause — it wraps **all** routed children in
      `<div class="content-container …">`, whose `padding-inline` gutter insets the combat screen's
      own `CombatHeader` on mobile, leaking page background beside it. For the combat route
      (`routeHasOwnHeader` is already computed here), render the children **WITHOUT** the
      `.content-container` wrapper (the combat page manages its own width). Other routes keep the
      wrapper unchanged.
- [ ] `combats/[id]/+page.svelte`: since AppShell no longer caps the combat body, give the combat
      `<main>` (the combatant list) its own `.content-container` so it stays capped at 768 +
      centered on desktop. Keep the existing `pb-56 lg:pb-8` mobile safe-area.
- [ ] `CombatHeader.svelte`: the `<header>` is already full-bleed with an inner `.content-container`
      for its content (keep it). Also wrap/cap the round-&-escalation sub-bar (currently `mx-3 …`)
      so it aligns with the capped body on desktop instead of going full-bleed. Header background
      must span the full viewport width with content centered inside.
- [ ] Covers AC: combat-screen header renders as a full-bleed bar (background spans the full
      viewport width, content centered/capped inside), no double-gutter and no page-bg leak beside
      the header at any viewport width; non-combat screens (combats list, settings, about) are
      unaffected.

**Gate:** `npm run gate` must pass before this phase is reported done.
