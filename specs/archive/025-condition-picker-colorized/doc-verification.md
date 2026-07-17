# Doc verification: 025-condition-picker-colorized

Scope: doc diff only (`specs/capabilities/conditions.md`, `specs/CHANGELOG.md`), checked against
working-tree code (`ConditionPicker.svelte`, `ConditionIconList.svelte`, `labels.ts`).

| Item | Verdict | Evidence |
|------|---------|----------|
| CND-3 doc: pill carries per-condition `--tc` from accent map matching card `--combat-*` hue | PASS | `src/lib/components/app/ConditionPicker.svelte` `style="--tc: {conditionAccent[c]}"`; `src/lib/components/app/labels.ts` `conditionAccent` map values are `var(--combat-*)` identical to `conditionColor` map's hues (e.g. `charmed` → `--combat-violet` in both) |
| CND-3 doc: unselected = tinted fill over surface + tinted border + `--tc` text, 12px rounded, no dot/icon | PASS | `ConditionPicker.svelte` toggle class: `!rounded-[12px]`, `bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))]`, `border-[color-mix(in_srgb,var(--tc)_28%,var(--border))]`, `text-[var(--tc)]`; item content is `{conditionLabel[c]()}` only, no icon/dot markup |
| CND-3 doc: selected = deeper same-hue fill, solid `--tc` border, 1px `--tc` ring, mixed-`--tc` text, applied on both `data-[state=on]:` and `aria-pressed:` | PASS | same class string: `data-[state=on]:bg-...18%...`, `data-[state=on]:border-[var(--tc)]`, `data-[state=on]:ring-1 data-[state=on]:ring-[var(--tc)]`, `data-[state=on]:text-[color-mix(...55%...)]` mirrored identically on `aria-pressed:` variants |
| CND-3 doc: font-weight constant across states (no reflow) | PASS | single `font-medium` in the shared class string, no per-state font-weight override |
| CND-3 doc: picker lists conditions alphabetically by localized label, reactive to language | PASS | `ConditionPicker.svelte`: `const sorted = $derived(sortConditions([...CONDITIONS]))`; `labels.ts` `sortConditions` sorts via `conditionLabel[x]().localeCompare(...)`, a `$derived` recomputes on any dependency (i18n `m` fn) change |
| CND-3 doc: `ConditionIconList` renders conditions alphabetically, chip visual style unchanged | PASS | `ConditionIconList.svelte`: `const sorted = $derived(sortConditions(conditions))`; badge class unchanged (`Badge variant="outline"` + `conditionColor[c]`, same as pre-025 shape) |
| Doc replaces unit-023 "soft `--primary` tint" description, not left contradictory alongside it | PASS | `specs/capabilities/conditions.md` diff shows the old bullet fully replaced (deleted `-` lines) by the new `--tc`-based description; no leftover reference to `--primary` tint in the current CND-3 text |
| CND-1 / CND-2 untouched | PASS | `git diff` on `conditions.md` shows only the CND-3 bullet block replaced/appended; no hunk touches CND-1 or CND-2 sections |
| Exactly one CHANGELOG row added, correct format | PASS | `specs/CHANGELOG.md` diff adds exactly one new table row `| 025-condition-picker-colorized | 2026-07-17 | ... (CND-3). |`, matching the existing `| unit-slug | date | description (IDs). |` row format used by 022/023/024 |

## Other findings

- Stale code comment (not part of the reviewed doc diff, but contradicts current behavior):
  `src/lib/components/app/ConditionPicker.svelte` top-of-file comment still reads "selected =
  soft ~15% primary tinted fill + primary border, default text (CND-3)" — describing unit 023's
  now-replaced style, not the unit 025 per-condition `--tc` recipe actually implemented below it.
  This is a code-comment/doc-comment drift, not a `conditions.md`/`CHANGELOG.md` diff issue, so it
  doesn't fail any of the checked items above, but should be fixed for future readers.
