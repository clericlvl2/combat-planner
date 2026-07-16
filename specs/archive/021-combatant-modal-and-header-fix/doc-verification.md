# Doc Verification: 021-combatant-modal-and-header-fix

| Doc area | Verdict | Evidence |
|----------|---------|----------|
| combatants.md CBT-1 (dot not stripe) | PASS | "only its display color (a leading color dot on the combatant card...)" matches CombatantRow.svelte dot + verification.md row 29 |
| combatants.md CBT-2 (leading dot, decorative, before name) | PASS | text matches CombatantRow markup (`size-2 rounded-full` dot immediately before name span) |
| combatants.md CBT-3 (Dialog/Drawer split, field order, pills, red-ring validation) | PASS | matches CombatantForm.svelte MediaQuery split, formBody snippet, grid order maxhp/ac→pd/md→initbonus/init→Note, type pill styling (`--tc` var, dot, ring), destructive-ring-only NumberField (verification.md rows 14,16,17,20,23) |
| combatants.md CBT-4 (field order, manual Initiative unconditional) | PASS | text explicitly states amendment against prior Setup-gated behavior; matches removed `combatActive` prop/guard (verification.md rows 18,31) |
| initiative.md INI-3 (manual field always present on add) | PASS | doc states "amended... it now also appears when adding during Setup," matching removed guard in CombatantForm.svelte |
| combats-list.md CLS-2 (Dialog/Drawer split, single stretched swatch row, silent cap-block) | PASS | matches CombatFormDialog.svelte MediaQuery split, removed `capBlocked`/cap-error `<p>` (verification.md row 26), ColorSwatchPicker `w-full`/`h-9 flex-1` (verification.md row 28) |
| combats-list.md CLS-1 (CombatRow radius) | PASS | "row card's corner radius matches the combatant card's radius" — matches `rounded-card` change (verification.md row 12) |
| conditions.md CND (picker Drawer on mobile) | PASS | "picker renders as a centered Dialog... and a bottom Drawer on mobile" — matches verification.md row 14 (ConditionPicker same Dialog/Drawer split, inline title) |
| platform.md PLT-2 (12px gutter, flush chevron) | PASS | "gutter is 12px (the `--space-3` token)"; "back-link's leading chevron sits flush to the content edge" — matches AppHeader/CombatHeader diffs (verification.md rows 5,6,7) |
| platform.md (FAB no-touch-focus-ring) | PASS | "FAB buttons suppress their focus-visible ring below the 1024px breakpoint" — matches `max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent` (verification.md row 30) |
| platform.md (drawer swipe handle) | PASS | "mobile bottom-drawers... render a working swipe-to-close drag handle" — matches `DrawerPrimitive.Handle` (verification.md row 15) |
| platform.md (button cursor-pointer) | PASS | "interactive buttons show a pointer cursor on hover app-wide" — matches Button base tv string (verification.md row 13) |
| platform.md PLT-5 (type dot decorative/aria-hidden, no compensating label) | PASS | doc explicitly amends the prior stripe+aria-label compensation, stating the dot is now decorative with "no text alternative," treated as acceptable since type is cosmetic not status. This CORRECTLY matches shipped code: CombatantRow.svelte dot carries `aria-hidden="true"` and `a11y.typeBadge` key was deleted from all 6 locale files (confirmed in messages/*.json diff) — no compensating label exists in code, and the doc does not claim one does. |
| component-inventory.md (Drawer/Dialog table, CombatantForm/CombatRow/type-dot entries, new "Mobile form Drawer/Dialog split" section) | PASS | Dialog/Drawer primitive table rows updated to list CombatFormDialog/CombatantForm/ConditionPicker under both Dialog(desktop) and Drawer(mobile); TypeStripe entries replaced with type-dot description; new section documents MediaQuery pattern + Handle — all consistent with diff/verification.md |
| i18n-catalog.md (3 keys removed: errors.clamp, errors.combatCap, a11y.typeBadge) | PASS | all three rows removed from the tables and explanatory notes added citing unit 021 — matches messages/*.json diff removing exactly these 3 keys from all 6 locales |
| CHANGELOG.md (single 021 row, old narrower row replaced not duplicated) | PASS | diff shows the old two-line 021 entry (narrow scope: modal height cap + header wide-container only) removed and replaced with one new, wider-scope 021 row reflecting the full app-wide sweep; `git diff` shows no duplicate 021 rows remain |

## Scope check

Doc edits confined to `specs/capabilities/combatants.md`, `initiative.md`, `combats-list.md`,
`conditions.md`, `platform.md`, `specs/reference/component-inventory.md`,
`specs/reference/i18n-catalog.md`, and `specs/CHANGELOG.md` — all within the doc-syncer's expected
ownership for this unit. No edits found outside `specs/capabilities/**`, `specs/reference/**`, or
the CHANGELOG.

## Other findings

None. The PLT-5 rewrite is the most consequential doc change (drops a compensating-label claim)
and it accurately reflects a real accessibility regression already called out and accepted in the
code-pass verification.md (row 29) rather than silently smoothing it over — the doc explicitly
frames it as an intentional amendment with a stated rationale (type is cosmetic, not a status
signal), not a contradiction. No stale claims, no unmatched code facts found.

## Verdict

PASS — 16/16 doc-area checks pass with concrete diff evidence; scope respected (capabilities +
reference + CHANGELOG only).
