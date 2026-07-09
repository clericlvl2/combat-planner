# Doc verification: 005-design-tokens

Scope: doc-syncer's edits only (working tree vs HEAD `a98e223`) — `specs/CHANGELOG.md`. Code diff
(`src/routes/layout.css`) already verified in `verification.md`; not re-checked here except where
needed to confirm a changelog claim.

| Check | Verdict | Evidence |
|----|---------|----------|
| CHANGELOG row for `005-design-tokens` exists, one row, right table, correct slug/date | PASS | `specs/CHANGELOG.md:14` — row `005-design-tokens \| 2026-07-09 \|` sits in the `## Change units` table (`CHANGELOG.md:6`), immediately after the `004-design-feedback-iteration` row and before `## Spec era`; single occurrence (`grep -c` on `005-design-tokens` in CHANGELOG.md → 1); date `2026-07-09` matches today. |
| Row summary is truthful: STUB→real WCAG-AA token layer in `src/routes/layout.css`, PLT-5 satisfied | PASS | Row claims "`src/routes/layout.css`'s STUB token block replaced with the real, WCAG-AA token set (dark + light) — neutral chrome, type colors, health bands, 8 ADR-012 color-tag swatches, typography, spacing, radius, elevation — token values verified verbatim-equal to the approved `specs/design/prototype.html`; every semantic fg/bg pair meets WCAG-AA in both themes (PLT-5 satisfied)." Matches `verification.md` PASS rows 1–3 (STUB replaced with full token set covering exactly those categories; token-by-token match to prototype.html; recomputed WCAG-AA contrast passes both themes) and `layout.css:6-13` (new comment block naming `specs/design/prototype.html` as source of truth, replacing the removed STUB comment). No overreach: row does not claim component/route restyling (out of scope, correctly not mentioned). |
| Claim "No capability/reference wording change needed — PLT-5 already stated the requirement generically" is correct | PASS | `git diff HEAD -- specs/capabilities specs/reference` is empty — no capability/reference file touched by this unit. Read `specs/capabilities/platform.md:81-93` (PLT-5 section): wording is generic ("Practical WCAG 2.1 AA: contrast in both themes, ≥44px touch targets... visible focus, semantic labels, scalable text... Every status conveyed by color... also has a non-color signal... Both themes meet AA contrast for text and status colors") with zero mention of STUB, provisional, TBD, or placeholder language that a real-token landing would need to remove. Claim holds. |
| No capability/reference file edited in a way that duplicates token hex values / violates one-fact-one-owner | PASS | `git diff --stat` (working tree vs HEAD) touches only `specs/CHANGELOG.md`, `specs/changes/005-design-tokens/{change.md,verification.md,tasks.md}`, `specs/changes/007-combat-screen/change.md` (unrelated unit, pre-existing per verification.md provenance note), and `src/routes/layout.css`. No `specs/capabilities/*` or `specs/reference/*` file appears in the diff at all, so none could contain a duplicated hex value — the CHANGELOG row itself also names no hex value, only category labels (neutral chrome, type colors, health bands, 8 swatches, etc.), consistent with one-fact-one-owner (values live solely in `layout.css` / `prototype.html`). |

## Scope check

In-scope only. The doc-syncer's sole substantive edit is the one new `specs/CHANGELOG.md` row.
No capability or reference file was touched. `specs/changes/007-combat-screen/change.md` shows as
modified in the working tree but is unrelated to this unit (a different, independently in-flight
change unit) and is correctly outside this doc-pass's concern.

## Other findings

None. The CHANGELOG row is accurate, singular, correctly placed, and does not overreach into
claims (e.g. screen-wiring, new deps) that the change explicitly puts out of scope.
