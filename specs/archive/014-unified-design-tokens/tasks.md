# Tasks: 014-unified-design-tokens

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Natural ordering constraint: `specs/design/tokens.css` (Phase 1) must exist before any `@import`
consumer can drop its inline values. After Phase 1, the app-side rewire (Phase 2) and the
design-prototype rewire (Phase 3) touch disjoint files and run in parallel. The card component
(Phase 4) references tokens brought into app scope by Phase 2's `layout.css` `@import`, so it runs
after Phase 2.

Design-truth binding: the prototypes are the source of truth for token VALUES. This unit is
relocation + rewire only — copy every hex / scale / dim value verbatim, invent nothing. WCAG-AA
must be recomputed from the actual hex (do not trust any copied ratio table).

## Phase 1 — Create shared token SSOT

**Owns:** `specs/design/tokens.css`
**Parallel-safe with:** none (blocks Phases 2–4)

- [ ] Create `specs/design/tokens.css` as the single source of truth for every raw design token,
      values copied verbatim from `specs/design/prototype.html` + `specs/design/card-prototype.html`.
- [ ] `:root` block: theme-independent tokens — `--space-1..6`, `--font-xs..xl`, radius scale
      (`--radius`, `--radius-sm`, `--radius-lg`), `--touch-min`, and the component dims
      (`--card-pad: 14px`, `--card-gap: var(--space-2)`, `--card-border: 1px`, `--hp-size: 19px`,
      `--badge-width: 16px`).
- [ ] `[data-theme="dark"]` block: dark palette — neutral chrome, 3 type colors, 4 health bands,
      8 combat swatches, `--on-semantic` — verbatim from the prototype `.theme-dark` scope.
- [ ] `[data-theme="light"]` block: light palette — same key set, verbatim from `.theme-light`.
- [ ] Reconcile `--radius-md` / `--radius-xl`: add them to `tokens.css` as prototype-backed tokens
      (so no app-invented token remains absent from the SSOT), per the change's reconciliation note.
- [ ] Recompute WCAG 2.1 AA for text + status colors in BOTH `[data-theme]` blocks from the actual
      hex now living in this file; confirm all pairs pass (do not copy any existing ratio table).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — App palette / theme-mechanism / spacing rewire

**Owns:** `src/routes/layout.css`, `src/lib/theme.ts`, `src/lib/db/types.ts`
**Verify-only (edit only if the variant remap breaks them):** `src/lib/components/app/NumpadSheet.svelte`,
`src/lib/components/app/ConfirmDialog.svelte`, and the `dark:`-using shadcn primitives under
`src/lib/components/ui/` (button, badge, input, textarea, select, toggle, dropdown-menu)
**Parallel-safe with:** Phase 3 (disjoint files)

This is the theme-mechanism swap and must land as one unit — `layout.css` keying on `[data-theme]`
while `theme.ts` still toggles `.dark` would leave the app (and gate) broken between phases.

- [ ] `src/routes/layout.css`: `@import "./../../specs/design/tokens.css"` (resolve the correct
      relative path); delete the inline raw palette + non-color scale literals now owned by
      `tokens.css`. Keep the shadcn semantic aliases and the `@theme inline` bridge.
- [ ] Rekey the palette blocks: the `:root` light palette → `[data-theme="light"]`, the `.dark`
      block → `[data-theme="dark"]`; no `.dark`-class palette block and no
      `.theme-light`/`.theme-dark` classes remain.
- [ ] Remap `@custom-variant dark (&:is(.dark *))` → `[data-theme="dark"]` so every existing `dark:`
      utility still resolves.
- [ ] Wire spacing through Tailwind `--spacing-*` so `p-4` / `gap-2` resolve to the `--space-*`
      values from `tokens.css`.
- [ ] Reconcile `--radius-md` / `--radius-xl` in the `@theme inline` bridge against the now
      prototype-backed tokens from Phase 1 (no app-invented radius token remains).
- [ ] `src/lib/theme.ts`: replace `applyIsDark(bool)` + `classList.toggle('dark', …)` with a set of
      `document.documentElement.dataset.theme` to the resolved `'dark'`/`'light'`; `theme === 'system'`
      still resolves via `prefers-color-scheme` then sets the attribute; the `theme-color` meta still
      updates on every theme change.
- [ ] `src/lib/db/types.ts`: confirm the `Theme` type (`'system' | 'dark' | 'light'`) needs no
      widening — the change is mechanism-only, no new theme surfaced. Leave unchanged unless a
      concrete compile need proves otherwise.
- [ ] Verify: dark theme renders identically to before — spot-check the `dark:` consumers listed
      above render unchanged under `[data-theme="dark"]`; all 8 swatches, 3 type colors, 4 health
      bands compute to the same hex in both themes as before this change.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Design-prototype `@import` rewire

**Owns:** `specs/design/prototype.html`, `specs/design/card-prototype.html`
**Parallel-safe with:** Phase 2 (disjoint files); Phase 4 (disjoint files)

- [ ] `specs/design/prototype.html`: `@import "tokens.css"` (relative to the file); drop the inline
      `:root` non-color scales and the `.theme-dark` / `.theme-light` raw palette blocks now owned by
      `tokens.css`; move theme scoping to `[data-theme="dark"]` / `[data-theme="light"]`. Keep the
      frame-canvas-only vars (`--mobile-w/-h`, `--desktop-w/-h`) inline — they are not shared tokens.
- [ ] `specs/design/card-prototype.html`: `@import "tokens.css"`; drop the inline `:root` scales, the
      `.theme-dark` / `.theme-light` palette blocks, AND the inline component dims (`--card-pad`,
      `--card-gap`, `--card-border`, `--hp-size`, `--badge-width`) now owned by `tokens.css`; move
      theme scoping to `[data-theme]`.
- [ ] Confirm no raw color hex or shared-token scale literal remains inline in either file.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — Card component dim wiring

**Owns:** `src/lib/components/app/CombatantRow.svelte`
**Parallel-safe with:** Phase 3 (disjoint files); runs AFTER Phase 2 (needs `tokens.css` in app scope
via `layout.css`'s `@import`)

- [ ] Replace the card's literal-px dims with the shared tokens now available app-wide: card padding
      → `var(--card-pad)`, the big-HP block sizing → `var(--hp-size)`, temp-HP badge width →
      `var(--badge-width)`, card border → `var(--card-border)`, inter-row gap → `var(--card-gap)`,
      per the card-prototype mapping. Do not change the rendered result — token values equal the
      current literals.
- [ ] Verify the card renders identically to before in both themes (no visual regression); touch no
      files outside this component.

**Gate:** `npm run gate` must pass before this phase is reported done.
