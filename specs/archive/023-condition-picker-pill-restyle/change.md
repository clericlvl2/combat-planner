---
status: archived
backlog: —
---

# Change: condition-picker-pill-restyle

## Why

The Add-condition picker pills read as visually heavy/ugly during dogfood — the current
selected state is a full solid primary fill (dark bg + light text) that dominates the modal.
Explored 6 mockups (`scratchpad/condition-modal-variants.html`); chose the "soft tinted-fill"
direction: plain text-only chips whose selected state is a light accent-tinted fill with a
colored border, keeping selected clearly distinct but calmer. No severity/dot/icon concept is
added — conditions stay pure visual labels (CND-1).

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `CND-3` | amend: the 12 picker toggle pills use a soft tinted-fill selected state (light ~15% `--primary` tint + primary border + default text color) instead of the solid `bg-primary` / `text-primary-foreground` fill; unselected outline pills and the Dialog/Drawer split are unchanged |

## Acceptance criteria

- [ ] In `ConditionPicker.svelte`, a selected (`data-[state=on]`) pill renders a **soft tinted
      fill** (≈15% `--primary` over the pill surface, e.g. `bg-primary/15` or equivalent
      color-mix) — **not** the current `bg-primary` solid fill.
- [ ] A selected pill's **text stays the default foreground color** (`--text` / `text-foreground`),
      not `text-primary-foreground`.
- [ ] A selected pill is distinguished by **both fill and border** (a primary-colored border),
      so selection never relies on color alone against the unselected outline (PLT-5).
- [ ] Unselected pills are unchanged: outline chip on surface, text-only, no dot/icon.
- [ ] Each pill keeps a **≥44px min touch height** (`min-h-11`) (PLT-5).
- [ ] Toggle/aria behavior is unchanged — still a multi-select `ToggleGroup`, one click = one
      membership toggle, per-pill `a11y.condition.toggle` aria-label intact (CND-2).
- [ ] Desktop `Dialog` and mobile `Drawer` render **identical** pill styling (shared `toggles`
      snippet — single source).

## Out of scope

- Condition set, membership/add-remove logic, uniqueness or the 0–12 cap (CND-1, CND-2).
- `ConditionIconList` (compact-row icons + "+K" overflow) — only the expanded picker pills change.
- The Dialog/Drawer split, modal titles, and swipe-to-close handle (unit 021) — untouched.
- No new design tokens and no edits to `specs/design/*` or `tokens.css`; reuse existing
  `--primary`/surface via Tailwind opacity or `color-mix`.
- No `messages/*.json` / i18n changes.
- No severity, dot, or icon feature (explicitly rejected — CND-1 keeps pure labels).
- Any component other than `ConditionPicker.svelte`.
