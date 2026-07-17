# Doc Verification: 023-condition-picker-pill-restyle

| Item | Verdict | Evidence |
|------|---------|----------|
| CND-3 amendment describes soft ~15% primary tinted fill | PASS | `specs/capabilities/conditions.md` new bullet "soft tinted fill (~15% `--primary` over the surface)" matches `ConditionPicker.svelte:52` `data-[state=on]:bg-primary/15` |
| CND-3 amendment describes primary-colored border | PASS | conditions.md "plus a primary-colored border" matches `data-[state=on]:border-primary` |
| CND-3 amendment describes default foreground text (not inverted) | PASS | conditions.md "default foreground text — not a solid `--primary` fill with inverted text" matches `data-[state=on]:text-foreground` (replacing prior `text-primary-foreground`) |
| CND-3 amendment: unselected pills stay plain outline, text-only, no dot/icon | PASS | conditions.md new bullet's first sentence matches unchanged `variant="outline"` + no icon/dot markup in component |
| CND-3 amendment cites PLT-5 (distinguishable by more than color) | PASS | conditions.md "staying distinguishable by more than color alone ... PLT-5" — accurate: fill+border combo, not color-only, matches component |
| CHANGELOG row accurately summarizes the change | PASS | `specs/CHANGELOG.md` new 023 row: "soft ~15% `--primary` tinted fill + primary border + default foreground text, replacing the prior heavy solid `bg-primary`/`text-primary-foreground` fill" — matches diff exactly |
| CHANGELOG row: unselected pills, Dialog/Drawer split, min-h-11, toggle/aria unchanged | PASS | CHANGELOG explicitly states these are unchanged; confirmed unchanged in component diff |
| No overclaiming (e.g. new tokens, icons, severity) | PASS | Neither doc mentions tokens/icons/severity; change.md explicitly rejected these and code confirms none added |
| No other capability file edited | PASS | `git diff --stat` shows only `specs/capabilities/conditions.md` and `specs/CHANGELOG.md` touched among docs |
| Doc changes match actual code diff scope (ConditionPicker.svelte only) | PASS | `git status --short` shows only `src/lib/components/app/ConditionPicker.svelte` + the change-unit's own files modified in src/specs |

## Scope check
In-scope only. Only `specs/capabilities/conditions.md` (CND-3 amendment bullet) and `specs/CHANGELOG.md` (new row) were touched by the doc pass; both correspond 1:1 to the single shipped code change in `ConditionPicker.svelte`. No other capability or reference file edited.

## Other findings
None. Doc wording is precise and non-contradictory; no unrelated capability claims found.
