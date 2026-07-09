# Verification: 005-design-tokens

Diff checked: working tree vs HEAD (`a98e223`). Prototype baseline: `specs/design/prototype.html`
at HEAD (committed at `a98e223`, `.theme-light`/`.theme-dark`/`:root` blocks).

| AC | Verdict | Evidence |
|----|---------|----------|
| STUB block fully replaced by real token set covering neutral chrome, type colors, health bands, 8 tag swatches, typography, spacing, radius, elevation — both themes | PASS | `src/routes/layout.css` diff: old shadcn `oklch(...)` STUB block, `--radius: 0.625rem` and prototype-mismatched health/tag hexes (`#10b981`, `#ef4444`, ...) removed; new `:root`/`.dark` blocks add `--font-xs..xl`, `--space-1..6`, `--shadow-sm/md`, full neutral-chrome set (`--bg/--surface/--surface-2/--surface-3/--text*/--border*/--primary*/--ring`), `--type-pc/enemy/ally`, `--health-full/wounded/bloodied/dead`, 8 `--combat-*` swatches, `--on-semantic`, for both `:root` (light) and `.dark`. |
| Token values equal `specs/design/prototype.html` (preview↔code agree) | PASS | Token-by-token diff of `layout.css:34-96` (light) and `:97-131` (dark) against `prototype.html:84-163` (`.theme-dark`/`.theme-light`) — every neutral-chrome, type, health-band, and combat-tag hex is identical in both themes (e.g. `--health-full` light `#0c8d62` = prototype.html:148; dark `#34d399` = prototype.html:107). `--radius`, `--font-*`, `--space-*` match `prototype.html:53-78` `:root`. `--shadow-sm: 0 4px 12px rgba(0,0,0,0.3)` and `--shadow-md: 0 6px 16px rgba(0,0,0,0.4)` match the literal `box-shadow` values used at `prototype.html:900` and `:419` respectively (prototype has no named shadow custom-properties, only inline literals — values match verbatim). |
| Every semantic foreground/background pair meets WCAG-AA contrast in both themes (PLT-5) | PASS | Recomputed WCAG relative-luminance contrast ratios directly from `layout.css` hex values (not the prototype's own table): light theme — type stripes on `--surface`: pc 3.77, enemy 4.83, ally 5.17 (≥3:1 non-text ✓); health bands on `--surface-3`: full 3.45, wounded 3.63, bloodied 3.65, dead 5.32 (≥3:1 ✓); combat-tag `--on-semantic` (`#ffffff`) letter on tag fill: worst case blue 4.65 (≥4.5:1 text ✓), others 4.72–5.06. Dark theme — type stripes: pc 8.99, enemy 6.25, ally 6.80 (✓); health bands: full 7.20, wounded 8.29, bloodied 6.12, dead 3.68 (≥3:1 ✓); tag letters (`#0b0d10` on fill): worst case neutral 7.03–red 7.03, all ≥7 (✓). Neutral text: light `--text`/`--bg` 16.14:1, `--text-muted`/`--surface` 6.47:1; dark `--text`/`--bg` 16.44:1, `--text-muted`/`--surface` 7.61:1 (all ≥4.5:1 ✓). |
| No `layout.css` comment still marks tokens as STUB / provisional | PASS | `search_in_files_by_regex` for `STUB\|stub\|provisional\|tuned during` against `layout.css` → 0 matches. Old comment "Values here are a STUB — tuned for WCAG-AA during the UI build (M-phase)" replaced with "Source of truth: specs/design/prototype.html ... Values below are copied verbatim from the approved prototype — see PLT-5" (`layout.css:10-12`). |
| `npm run gate` stays green | PASS | Ran `npm run gate` (lint + check + test:unit --run + build) — exit code 0, biome reported `0 ERRORS 0 WARNINGS`, build completed (`✓ built`, PWA precache generated, `Wrote site to "build"`). |

## Scope check

In-scope only. `git diff --stat HEAD` shows one code file touched:
`src/routes/layout.css` (188 changed lines) — the unit's sole owned file. The other four changed
paths are non-code spec bookkeeping: `specs/changes/005-design-tokens/change.md`,
`specs/changes/005-design-tokens/tasks.md`, `specs/changes/005-design-tokens/verification.md`
(this unit's own artifacts) and `specs/changes/007-combat-screen/change.md` (per the dispatch's
provenance note, pre-existing unrelated work not authored by this unit, outside its diff). No
Svelte components/routes were restyled and no new dependency was added, matching the declared
out-of-scope list.

## Other findings

- `--radius-xl` changed from a derived value (`calc(var(--radius) + 4px)` = 14px) to a literal
  `18px`, and `--radius-lg` moved from `var(--radius)` (10px) to a literal `14px`. Neither value
  is named as `--radius-xl`/`--radius-lg` inside the prototype's own `:root` (prototype only
  declares `--radius`, `--radius-sm: 6px`, `--radius-lg: 14px`) — `--radius-lg: 14px` does match
  the prototype exactly; `--radius-xl: 18px` has no prototype-declared counterpart to check
  against (not a contradiction, just an unverified addition — flagging for awareness, not a
  failure since AC2 only requires agreement on values the prototype actually shows).
- No regressions spotted: all shadcn alias tokens (`--background`, `--card`, `--muted`, etc.) are
  now correctly re-derived from the new neutral-chrome primitives in both themes, and
  `--color-on-semantic` was added to the `@theme inline` Tailwind-exposure block alongside the
  new `--on-semantic` primitive, keeping the Tailwind utility surface consistent with the new
  token set.
