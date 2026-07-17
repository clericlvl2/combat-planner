# Verification: 023-condition-picker-pill-restyle

| AC | Verdict | Evidence |
|----|---------|----------|
| Selected pill = soft tinted fill (~15% primary), not solid `bg-primary` | PASS | `src/lib/components/app/ConditionPicker.svelte:52` — class changed from `data-[state=on]:bg-primary` to `data-[state=on]:bg-primary/15` |
| Selected pill text stays default foreground, not `text-primary-foreground` | PASS | `src/lib/components/app/ConditionPicker.svelte:52` — `data-[state=on]:text-foreground` replaces `data-[state=on]:text-primary-foreground` |
| Selected pill distinguished by both fill and border (primary-colored border) | PASS | `src/lib/components/app/ConditionPicker.svelte:52` — `data-[state=on]:border-primary` added alongside the tinted fill |
| Unselected pills unchanged (outline chip, text-only, no dot/icon) | PASS | `src/lib/components/app/ConditionPicker.svelte:44` — `ToggleGroup variant="outline"` untouched; no dot/icon markup added anywhere in the diff |
| ≥44px min touch height (`min-h-11`) kept | PASS | `src/lib/components/app/ConditionPicker.svelte:52` — `min-h-11` retained unchanged in the class string |
| Toggle/aria behavior unchanged (multi-select ToggleGroup, one click = one toggle, `a11y.condition.toggle` aria-label intact) | PASS | `src/lib/components/app/ConditionPicker.svelte:39-41,44,50-51` — `handle()` diffing logic, `type="multiple"`, and the `aria-label={m['a11y.condition.toggle'](...)}` binding are all untouched by the diff |
| Desktop `Dialog` and mobile `Drawer` render identical pill styling (shared `toggles` snippet) | PASS | `src/lib/components/app/ConditionPicker.svelte:43-59,64,74` — single `{#snippet toggles()}` block, invoked via `{@render toggles()}` from both the `Dialog` and `Drawer` branches; no divergent styling introduced |

## Scope check

In-scope only. Diff touches exactly `src/lib/components/app/ConditionPicker.svelte` (pill class string + header comment) plus the change-unit's own `change.md` status flip (`approved` → `verifying`, expected lifecycle metadata edit). No edits to `ConditionIconList`, `tokens.css`, `specs/design/*`, `messages/*.json`, or the Dialog/Drawer/title/swipe-handle structure — all consistent with the declared out-of-scope list.

## Other findings

None. The new border (`border-primary`) combines with the existing `variant="outline"` base border, so unselected vs. selected relies on both color and a genuine fill-opacity/border change (not color alone), consistent with PLT-5's intent even though PLT-5 itself wasn't independently audited here.
