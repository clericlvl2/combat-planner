# Doc-pass verification: 019-ui-fidelity-grand-revision

Diff basis: `git diff HEAD` restricted to `specs/capabilities/combatants.md`,
`specs/capabilities/combats-list.md`, `specs/capabilities/platform.md`,
`specs/reference/i18n-catalog.md`, `specs/CHANGELOG.md`. Cross-checked against `change.md`,
the code-pass `verification.md`, and `messages/en.json`.

| Item | Verdict | Evidence |
|------|---------|----------|
| CBT-2: "type color stripe(s)" -> "type color stripe" (singular) | PASS | `specs/capabilities/combatants.md` diff: `type color stripe` (was `stripe(s)`); matches code-pass finding `typeStripeCount` now `{pc:1, enemy:1, ally:1}` (CBT-1, `labels.ts`) -- no combatant type ever renders >1 stripe now, so singular wording is accurate. |
| CBT-2/CBT-3: new AC "add form's submit button reads Add, edit reads Save" | PASS | `combatants.md` new bullet under CBT-2 (submit button prose) + new AC line; matches code-pass `CBT-3: add-mode "Add", edit-mode "Save"` PASS row (`CombatantForm.svelte:223-225` ternary, `forms.action.add`="Add" in `messages/en.json`). |
| CLS-1: new empty-state prose + AC (icon + description + "New combat" CTA) | PASS | `combats-list.md` new prose sentence + new AC bullet; matches code-pass `CLS-1: empty-state icon + description + "+ New combat" CTA` PASS (`src/routes/combats/+page.svelte:22,77-81` passes `icon`+`description`). Doc says "New combat" CTA (not "+ New combat" literal string) -- accurate: the "+" is a rendered icon glyph, not part of the i18n string (`combats.empty.cta` = "New combat" verbatim in `messages/en.json`), so the doc doesn't misstate the string value. |
| CLS-2: new prose + AC for "New combat" title / "Create" primary / edit "Save" | PASS | `combats-list.md` CLS-2 section rewritten; matches `messages/en.json` `forms.combat.create.title`="New combat", `forms.action.create`="Create", `forms.action.save`="Save" (unchanged); code-pass confirms `CombatFormDialog.svelte:135-138` ternary. |
| CLS-2: new AC "cap-error banner clears on any field edit" | PASS | `combats-list.md` new prose + AC bullet; matches code-pass row citing `CombatFormDialog.svelte:61-67` new `$effect` watching title/description/colorTag. |
| PLT-2: new prose + AC "desktop nav reachable from open combat screen" | PASS | `platform.md` new paragraph + AC bullet; matches code-pass `PLT-2: desktop nav reachable from open combat screen; inventory reconciled` PASS (`CombatHeader.svelte:57-71,114-131` new nav row). The new platform.md paragraph explicitly defers card-shape ownership to `component-inventory.md` and doesn't restate a layout claim already made above it -- no contradiction with the existing "single centered column, no split-pane" PLT-2 sentence. |
| i18n-catalog.md: `combats.empty.description` (new) | PASS | catalog value "Create your first encounter to start tracking initiative and HP." exactly matches `messages/en.json` `combats.empty.description`. |
| i18n-catalog.md: `combats.empty.cta` "Create your first combat" -> "New combat" | PASS | matches `messages/en.json` (`"New combat"`). |
| i18n-catalog.md: `forms.combat.create.title` "Create combat" -> "New combat" | PASS | matches `messages/en.json`. |
| i18n-catalog.md: `forms.action.create` (new, "Create") | PASS | matches `messages/en.json`. |
| i18n-catalog.md: `forms.action.add` (new, "Add") | PASS | matches `messages/en.json`. |
| i18n-catalog.md: `settings.data.resetAll.caveat` (new) | PASS | catalog "Delete every combat (keeps language & theme)" exactly matches `messages/en.json`. |
| i18n-catalog.md: `dialogs.resetAll.body` rewrite | PASS | catalog "This permanently deletes every combat on this device. Language and theme settings are kept." exactly matches `messages/en.json`. |
| CHANGELOG.md: 019 row well-formed, matches table format | PASS | Row appended at correct position (after 018, before "Spec era" section break), same `\| id \| date \| prose \|` pipe-table shape as the other 18 rows, single-line, no broken pipes/markdown. Content summarizes CBT-1/2/3/5, CLS-1/2, SET-3, PLT-2, LIF-2, and design-token/icon additions consistent with `change.md`'s "What changes" table and the code-pass verification. |
| No overreach -- no doc states behavior that didn't ship | PASS | Every new/changed sentence in the four capability/reference files traces to a code-pass PASS row with a concrete file:line citation (see mapping above). No pixel-level values (font sizes, radii, gaps) were added to `combatants.md`/`combats-list.md`/`platform.md` prose -- those stay in `component-inventory.md`/`tokens.css` per the existing doc-ownership split; this diff only touched behavior-level capability prose + the i18n catalog + changelog, consistent with the constitution's "one fact, one owner" rule. |
| No contradiction with other capabilities | PASS | CBT-2 singular-stripe wording is consistent with CBT-1 (same file); CLS-1/CLS-2 empty-state and create-modal wording don't conflict with CLS-3 (edit mode explicitly carved out as "Save", unchanged); PLT-2 new desktop-nav paragraph is additive and doesn't restate/conflict with the card-layout claim in the same section. |

## Scope check

In-scope-only. Only the five named files were edited by the doc-syncer per the diff
(`specs/capabilities/combatants.md`, `specs/capabilities/combats-list.md`,
`specs/capabilities/platform.md`, `specs/reference/i18n-catalog.md`, `specs/CHANGELOG.md`). No
edits found in this diff to `component-inventory.md`, `limits.md`, or any other capability file
that would fall outside this doc-pass's assigned scope (those are code-pass/design-source
concerns already covered separately by the code-pass `verification.md`, which confirms
`component-inventory.md` was reconciled by the implementer, not the doc-syncer).

## Other findings

- None. All five files' edits are narrowly behavior-descriptive, trace cleanly to shipped code
  via the already-passed code-pass verification, and the i18n-catalog values are byte-for-byte
  consistent with `messages/en.json`.

## Overall verdict

**PASS** -- all checked doc-pass items have concrete evidence; i18n-catalog matches shipped
en.json exactly; CHANGELOG row well-formed; no overreach or contradiction found.
