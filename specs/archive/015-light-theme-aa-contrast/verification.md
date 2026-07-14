# Verification: 015-light-theme-aa-contrast

| AC | Verdict | Evidence |
|----|---------|----------|
| `--text-faint` dark ≥4.5:1 vs `--surface`/`--surface-2` | PASS | `specs/design/tokens.css:57` `#808b98`; recomputed: vs `#171b21` = 4.991, vs `#1f242c` = 4.502 |
| `--text-faint` light ≥4.5:1 vs `--surface`/`--surface-2` | PASS | `specs/design/tokens.css:98` `#666f7d`; recomputed: vs `#ffffff` = 5.079, vs `#f0f2f5` = 4.528 |
| Light `--health-wounded`/`--health-bloodied` ≥4.5:1 vs both surfaces | PASS | `specs/design/tokens.css:112-113` `#996206`/`#b84f05`; wounded: 5.117/4.562, bloodied: 5.050/4.503 |
| Light `--combat-blue/orange/green/neutral/teal` ≥4.5:1 vs both surfaces | PASS | `specs/design/tokens.css:117,119,121-123` `#607086`/`#b35210`/`#0b7e53`/`#0e7c70`/`#0a76a6`; all ratios recomputed 4.502–5.093 (see table below) |
| Hue family preserved per changed value; 8 light swatches mutually distinguishable | PASS | recomputed HSL hue deltas ≤1.1° for every changed token (text-faint-light 215.5→216.5, combat-neutral 215.4→214.7, others <0.3°); final 8-swatch hue set: neutral 214.7, red 0.0, orange 24.3, amber 37.6, green 157.6, teal 173.5, blue 198.5, violet 258.3 — well separated |
| No other token value in tokens.css changed | PASS | `git diff -- specs/design/tokens.css` shows exactly the 9 listed lines changed (dark `--text-faint`, light `--text-faint`, light `--health-wounded`/`--health-bloodied`, light `--combat-neutral`/`--combat-orange`/`--combat-green`/`--combat-teal`/`--combat-blue`); `--combat-red`/`--combat-amber`/`--combat-violet`, dark health bands, dark swatches, type colors, neutral chrome, spacing/type/radius/dims all byte-identical in diff |
| No inline hex reintroduced into prototype.html/card-prototype.html/layout.css | PASS | `git diff -- specs/design/prototype.html specs/design/card-prototype.html src/routes/layout.css` is empty — none of these files touched in this diff |
| `specs/capabilities/platform.md` PLT-5 B-028 paragraph removed, unqualified AA claim restored | N/A (explicitly deferred to doc-syncer) | `platform.md:104-109` still contains the "Known exception... deferred to backlog B-028" paragraph, unchanged — per dispatch instructions this is intentionally out of scope for this code pass and is not scored FAIL |
| `npm run gate` passes | PASS | full gate run: lint (0 errors/warnings, 5447 files), build succeeded (`✓ built in 5.64s`, PWA precache generated, `Wrote site to "build"`) |

### Recomputed ratios (WCAG 2.1, relative luminance)

| Token | Hex | vs #ffffff | vs #f0f2f5 |
|-------|-----|-----------|-----------|
| health-wounded (light) | #996206 | 5.117 | 4.562 |
| health-bloodied (light) | #b84f05 | 5.050 | 4.503 |
| combat-blue (light) | #0a76a6 | 5.054 | 4.507 |
| combat-orange (light) | #b35210 | 5.083 | 4.533 |
| combat-green (light) | #0b7e53 | 5.093 | 4.541 |
| combat-neutral (light) | #607086 | 5.049 | 4.502 |
| combat-teal (light) | #0e7c70 | 5.078 | 4.528 |
| text-faint (light) | #666f7d | 5.079 | 4.528 |

| Token | Hex | vs #171b21 | vs #1f242c |
|-------|-----|-----------|-----------|
| text-faint (dark) | #808b98 | 4.991 | 4.502 |

All margins are tight but every pair clears ≥4.5:1 with room (min observed 4.502, on `combat-neutral` vs `--surface-2` and `text-faint` dark vs `--surface-2`).

## Scope check

In-scope only. `git status --short` for this working tree shows only `specs/design/tokens.css` (M), `specs/backlog.md` (M, B-028 status flip `idea`→`in-unit` with unit pointer — expected bookkeeping), and untracked `specs/changes/` (this unit's own artifacts). No `.svelte` files, no `layout.css`, no prototype HTML files, no `theme.ts` touched. `--combat-red`, `--combat-amber`, `--combat-violet`, all dark-theme health bands and swatches, type colors, neutral chrome, and spacing/type/radius/dims tokens are byte-identical in the diff (confirmed via `git diff -- specs/design/tokens.css` — only the 9 declared lines changed).

## Other findings

None. `specs/capabilities/platform.md` PLT-5 text was correctly left untouched per explicit dispatch instruction (doc-syncer's job at `/spec-close`) — not a defect in this pass.
