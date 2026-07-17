# Tasks: 023-condition-picker-pill-restyle

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

## Phase 1 — Soft tinted-fill selected pill (CND-3)

**Owns:** `src/lib/components/app/ConditionPicker.svelte`, `src/lib/components/app/ConditionPicker.svelte.spec.ts`
**Parallel-safe with:** none (only phase)

- [ ] In the shared `{#snippet toggles()}`, change each `ToggleGroupItem`'s selected-state
      classes from `data-[state=on]:bg-primary data-[state=on]:text-primary-foreground` to a
      soft tinted fill: ≈15% `--primary` tint (e.g. `data-[state=on]:bg-primary/15`) + a
      primary-colored border (e.g. `data-[state=on]:border-primary`) + default foreground text
      (drop `text-primary-foreground` so selected text stays `--text` / `text-foreground`).
- [ ] Keep unselected pills unchanged: outline chip on surface, text-only, `!rounded-full`,
      `min-h-11` (≥44px touch height, PLT-5), `px-3` — no dot/icon.
- [ ] Selection must be conveyed by both fill and border (not color alone, PLT-5); confirm the
      selected border is distinguishable from the unselected outline variant.
- [ ] Preserve toggle/aria behavior: `type="multiple"` `ToggleGroup`, `onValueChange={handle}`,
      per-pill `a11y.condition.toggle` aria-label — do not touch `handle`, props, or the
      Dialog/Drawer split; both render the same shared `toggles` snippet (single source).
- [ ] Do not touch any other component, `tokens.css`, `specs/design/*`, or `messages/*.json`.
- [ ] Review `ConditionPicker.svelte.spec.ts`: it asserts selection via `data-state` /
      `aria-pressed` attributes, not the old Tailwind classes, so it should still pass as-is.
      Only if an assertion references the removed `bg-primary` / `text-primary-foreground`
      classes, update it to the new selected-state expectation; otherwise leave it unchanged.

**Gate:** `npm run gate` must pass before this phase is reported done.
