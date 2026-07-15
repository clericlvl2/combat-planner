# Verification: 019-ui-fidelity-grand-revision

Diff basis: working tree vs HEAD (`git status` / `git diff HEAD`).

| AC | Verdict | Evidence |
|----|---------|----------|
| CBT-1: `typeStripeCount` all 1, comment fixed, inventory "pc=2" removed | PASS | `src/lib/components/app/labels.ts:26-30` (`pc: 1`), comment updated; `specs/reference/component-inventory.md:124` ("stripe count pc=enemy=ally=1"); `CombatantRow.svelte:3` header comment also updated |
| CBT-2: name 15px/600/lh1.2 explicit classes | PASS | `CombatantRow.svelte:135` `class="truncate text-base leading-[1.2] font-semibold"`; `text-base`→`--font-md`(15px) via `src/routes/layout.css:69` |
| CBT-2: def-stats 13px, values normal weight | PASS | `CombatantRow.svelte:196` `text-sm` (13px, `--font-sm`); `statClass` changed to `'text-foreground tabular-nums'` (no `font-semibold`), `CombatantRow.svelte:110-111` |
| CBT-2: temp-HP badge 10px/600 | PASS | `CombatantRow.svelte:182` `text-[10px] ... font-semibold` |
| CBT-2: `+Condition`/`+Note` normal weight, `--border` token, gap 6px; chip gaps consistent | PASS | `CombatantRow.svelte:102-104` `tagTriggerClass` drops `font-medium`, uses `border-border`, `gap-[5px]`; Row 4 wrapper `gap-1.5` (6px), `CombatantRow.svelte:210` |
| CBT-2/INI-2: init-pill light-theme white override, value weight/size | PASS | `InitCell.svelte:82,91,105-111` — `:global([data-theme='light'] .chip.init-pill){background:#fff}`, value now `<b class="text-foreground">` inside `.chip.init-pill` class |
| CLS-2: create-mode title "New combat", primary "Create", edit keeps "Save" | PASS | `messages/en.json` `forms.combat.create.title`→"New combat", new `forms.action.create`="Create"; `CombatFormDialog.svelte:135-138` ternary `combat ? save : create`; spec updated `CombatFormDialog.svelte.spec.ts` |
| CLS-2: placeholders "e.g. Goblin Ambush" / "Optional notes" | PASS | `CombatFormDialog.svelte:104,114` |
| CLS-2: cap-error banner clears on any field edit | PASS | `CombatFormDialog.svelte:61-67` new `$effect` watching title/description/colorTag sets `capBlocked = false`; old title-only `oninput` handler removed (`CombatFormDialog.svelte:104-108`) |
| CLS-2: modal styling (backdrop 50%, 400px, radius-lg, border-strong, field gap 5px, input radius-sm/15px, cancel outline, btn radius 6px/weight 600, height 44px) | PASS | `dialog-overlay.svelte:15` `bg-black/50`; `CombatFormDialog.svelte:85-87` `sm:max-w-[400px] rounded-lg border-[var(--border-strong)]`; field wrappers `gap-[5px]`; inputs `h-11 rounded-sm ... text-[15px]`; Cancel `variant="outline"`; primary `rounded-sm font-semibold`, `h-11` retained throughout |
| CLS-2: color-swatch 30px square tiles, letter, neutral-outline selected | PASS | `ColorSwatchPicker.svelte:27-38` new `colorTagLetter` map; `size-[30px] ... rounded-md ... data-[state=on]:outline ... outline-foreground`; `ColorTagDot.svelte` renders `letter` prop |
| CLS-1: empty-state icon + description + "+ New combat" CTA | PASS | `src/routes/combats/+page.svelte:22,77-81` passes `icon={EmptyIcon}` + `description`; `messages/en.json` `combats.empty.description` new, `combats.empty.cta`→"New combat" (rendered with leading "+" via `<Add/>{cta}` in the button, matching "+ New combat") |
| CLS-1: row title 15px/600, `--border` token border, gap 8px, dot radius 7px, search icon 16px | PASS | `CombatRow.svelte:41,49` `border border-[var(--border)]`, title `text-base font-semibold`; `+page.svelte:89` list wrapper `gap-2` (8px); `ColorTagDot.svelte:45` `rounded-[7px]`; SearchField icon — see below |
| CBT-3: add-mode "Add", edit-mode "Save" | PASS | `CombatantForm.svelte:223-225` ternary; new `forms.action.add`="Add" in `messages/en.json`; spec updated |
| CBT-5: NumberField value-cell 13px, no tint bleed | PASS | `NumberField.svelte:119` `text-[13px]`; input `dark:bg-transparent` added to suppress `bg-input/30` shadcn default tint |
| HP-4: numpad CommitActions ≥44px + bold/xs | PASS | `NumpadSheet.svelte:128,136,144` each button gains `h-11 text-xs font-bold` |
| HP-4: HP-summary color hierarchy retained + prototype updated | PASS | code: `NumpadSheet.svelte` `healthTextColor` (pre-existing, unchanged — out of scope per "no domain change"); prototype: `specs/design/prototype.html` new `.hp-cur`/`.hp-cur--{full,wounded,bloodied,dead}` rules + sample markup `<b class="hp-cur hp-cur--wounded">18</b>` |
| HP-4: HealthBar temp-HP segment illustrated in prototype | PASS | `specs/design/card-prototype.html` — `.fill--temp` rule added; multiple card samples now render a second `.healthbar__fill.fill--temp` segment sized to leave headroom for temp HP |
| TRE-3: sub-bar `--radius`(10px) + `--space-2` rhythm | PASS | `CombatHeader.svelte:222` `rounded-[var(--radius)]` (was `rounded-lg`=14px); `mx-3 mt-3` unchanged (`--space-3`=12px is the outer margin — the AC's "first card" spacing is inside `main`, `+page.svelte:161` `pt-2` when active, i.e. `--space-2`=8px) |
| LIF-2: desktop Start = icon-roundel with play glyph; mobile Start-FAB uses play glyph; icon exists | PASS | `CombatHeader.svelte:148-158` button converted to `variant="ghost" size="icon"` circular button with `<Start/>`; `src/routes/combats/[id]/+page.svelte:38,208` FAB now renders `<Start/>` instead of `<Advance/>`; `src/lib/icons.ts:22,69` `Play` imported, `chromeIcon.start` added |
| SET-3: resetAll body copy + caveat + visible labels | PASS | `messages/en.json` `dialogs.resetAll.body` rewritten to state combats deleted / language+theme kept; new `settings.data.resetAll.caveat`; `settings/+page.svelte:99-108` reset row now shows visible label text + caveat line; language row already had a visible `<h2>` heading (unchanged, pre-existing) |
| SET-3/PLT-2 misc: settings gap 8px, group radius `--radius`, heading tracking 0.06em; About padding 24px, privacy border 3px, max-width 640px | PASS | `settings/+page.svelte:53` `gap-2`; sections `rounded-[var(--radius)]`; headings `tracking-wider`(0.06em, `layout.css:76-79`/`tokens.css:34`); `about/+page.svelte:16` `p-6`(24px), privacy `border-l-[3px]`; `max-w-[640px]` unchanged (already correct) |
| PLT-2: desktop nav reachable from open combat screen; inventory reconciled | PASS | `CombatHeader.svelte:57-71,114-131` new `.nav-desktop`-equivalent `<nav>` row with 3 links + `isCurrentNav`; `component-inventory.md:35-37,93-99` rewritten to describe the two-component split, no longer claims blanket "AppHeader... Applies globally" |
| PLT-5: prototype touch targets 44px except numpad CommitActions raised in code | PASS | `prototype.html` `.icon-btn` width/height → `var(--touch-min)` (was 38px); `.digit` height → `var(--touch-min)` (was 40px); numpad buttons fixed in code (`NumpadSheet.svelte` `h-11`), not reverse |
| design-tokens: `--radius-card`, `--tracking-*` wired, literals replaced | PASS | `tokens.css:16,33-35` new tokens; `layout.css:58,73-78` wired into `@theme`; `CombatantRow.svelte:120` `rounded-card` replaces `rounded-[12px]`; `CombatHeader.svelte:229,246` `tracking-wide` replaces `tracking-[0.04em]` |
| design-icons: play glyph added | PASS | `src/lib/icons.ts:22,69` |
| design-source: stale `header-jump` removed | PASS | `prototype.html` diff removes all `.header-jump` CSS rules and every `<button class="icon-btn header-jump">` sample markup instance |
| design-source: WCAG border-tint canonical (no AA-failing filled tint) | PASS | `prototype.html` `.btn--{danger,restore,temp}-tint` (filled `color-mix 18%` bg) replaced by `.btn--{danger,restore,temp}-outline` (transparent bg, 30% border) — matches shipped `NumpadSheet.svelte` outline-only recipe |
| Whole unit: `npm run gate` passes | PASS | ran `CHOKIDAR_USEPOLLING=true npm run gate` locally — lint/check/test:unit/build all completed with 0 errors, build wrote `build/` successfully |

## Scope check

In-scope-only, with one caveat: the change unit's own file-ownership table only names Svelte
components + design-source + `messages/*.json`, but the diff also touches
`src/lib/components/ui/dialog/dialog-overlay.svelte` (vendored shadcn primitive) and
`src/routes/layout.css`. Both are explicitly anticipated by the change.md body text ("Vendored
`src/lib/components/ui/*` ... except the minimal overrides needed" and the `design-tokens` row
naming `layout.css` directly), so these are in scope, not violations.

`specs/backlog.md` edit (B-021 status idea→in-unit) is standard change-unit bookkeeping, not a
scope violation.

No edits found to `constants.ts`, `factories.ts`, `derive.ts`, or Dexie schema/migrations — the
"out of scope" domain-layer boundary was respected.

## Other findings

- `src/lib/components/app/SearchField.svelte` diff (1 line, `search icon 16px`) and
  `src/lib/components/ui/dialog/dialog-overlay.svelte` were not individually itemized in the AC
  table's file-evidence column for every sub-bullet but were spot-checked and match the CLS-1 /
  CLS-2 claims respectively.
- `CombatHeader.svelte` navigation row duplicates markup structurally similar to `AppHeader`'s
  `.nav-desktop`, but does not reuse a shared component (no `AppHeader`-derived subcomponent
  extracted). This is a minor duplication smell, not an AC failure — the change.md doesn't
  require extraction, only that the row exists.
- No regressions spotted in touched files; `npm run gate` (lint+check+unit+build) is green.

## Overall verdict

**PASS** — every checked acceptance-criterion bullet has concrete diff evidence; out-of-scope
boundary respected; gate green.
