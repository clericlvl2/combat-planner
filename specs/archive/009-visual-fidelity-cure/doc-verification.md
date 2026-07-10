# Doc Verification: 009-visual-fidelity-cure

| Check | Verdict | Evidence |
|----|---------|----------|
| CHANGELOG row exists, correct table, correct column format | PASS | `specs/CHANGELOG.md:18` — new row in the "## Change units" table, `\| Unit \| Date \| Change \|` format matches all sibling rows (001–008) |
| CHANGELOG summary accurate vs. change.md/verification.md, no unshipped/contradicted claims | PASS | Row lists: theme-at-root (`verification.md` row 1), typography scale (row 3), shadow aliases (row 4), card recipe (row 5), desktop header roundels + label/value bar (row 6), primary Start FAB (row 7), NumpadSheet AA fix + collapsible History (row 8), untitled placeholder + `SearchField` (rows 9–10), doc-source hex fix (row 11) — every clause maps 1:1 to a PASS row in `verification.md`; "Affected: SET, PLT-3, PLT-5, CBT, TRE, HP, CLS (new CLS-9), LIF" matches change.md's "What changes" ID column; no game-mechanics claim made (consistent with verification.md's "No game-mechanics/data change" PASS) |
| `specs/capabilities/combats-list.md` already reflects shipped CLS-9/placeholder work | PASS | `combats-list.md:83` `## CLS-9 — Search` section exists, describing the `SearchField` real-time title filter; `combats-list.md:78-79` (CLS-1) already documents the untitled-combat placeholder-title behavior — both match what `verification.md` confirms shipped in `src/routes/combats/+page.svelte` and `SearchField.svelte` |
| `specs/reference/component-inventory.md` reflects shipped `SearchField` | PASS | `component-inventory.md:31-32` lists `SearchField (real-time title filter, view-local only — shipped unit F (009); first child of the populated list, hidden on the empty-state screen — CLS-9)`; also present in the bespoke-component table (line 213) — matches shipped `src/lib/components/app/SearchField.svelte` and its non-empty-only render gate |
| `specs/reference/i18n-catalog.md` reflects new key | PASS | `i18n-catalog.md:52` `combats.search.placeholder \| Search combats…` row present, matching `messages/en.json:18` and `SearchField.svelte:20-21` usage |
| `specs/capabilities/platform.md` — no doc-syncer edit claimed; check nothing stale left for PLT-3/PLT-5 | PASS (spot check) | change.md declares PLT-3/PLT-5 as "amend" targets but doc-syncer made no capability edits, reporting inline sync during implementation; verification.md's PASS rows for desktop-roundel and NumpadSheet-AA ACs don't cite `platform.md` diffs, meaning those spec bodies were presumably already correct from unit 006/007 baseline — not independently re-read line-by-line here since out of the doc-syncer's touched-file scope, but no contradiction found in the searches performed (no stale "Advance FAB is the only desktop control" or similar wording surfaced during search) |

## Scope check

Doc-syncer's edit is exactly the one new CHANGELOG row — no other file was touched by the
doc-sync step (all capability/reference edits for this unit were made inline during
implementation, per the doc-syncer's own report, and independently confirmed present in
`combats-list.md`, `component-inventory.md`, `i18n-catalog.md`). In scope.

## Other findings

- Minor label inconsistency (not a doc-sync defect): `component-inventory.md:31` calls this unit
  "unit F (009)" while `CHANGELOG.md` and `change.md` never use an "F" letter — units 003–007
  were lettered A–E as "the 5-unit design chain" and 009 is an unlettered follow-up "cure" unit.
  This naming drifted from a stale letter-chain assumption baked in during unit 006/007-era doc
  edits, predates this change unit's diff, and is cosmetic only (the CLS-9 cross-reference and
  shipped-status are correct) — flagging for awareness, not a doc-sync failure of unit 009.
- No stale/contradictory content found in the four capability/reference files checked.
