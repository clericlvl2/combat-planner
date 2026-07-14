# Verification: 013-localization-full-fix

| AC | Verdict | Evidence |
|----|---------|----------|
| SET-1 — non-en values not byte-identical except enumerated legit exceptions | PASS | Re-scanned all 5 non-en locales vs `en.json`. `de`/`ru`: 9 identical content keys (`conditions.overflow`, 6×`settings.language.*`, `about.appName`, `a11y.typeBadge`) — all enumerated exceptions. `es`: 10, +`conditions.vulnerable`="Vulnerable" (cited cognate example) — clean. `ja`: 14, +`numpad.summary.hp`, `forms.type.pc`="PC", `forms.field.ac`="AC", `forms.field.pd`="PD", `forms.field.md`="MD" — genuine abbreviation cognates — clean. `fr`: now 21 identical content keys (down from 24) — the 3 previously-flagged stub keys are fixed: `combat.round` en="Round {n}"/fr="Manche {n}", `combat.round.label` en="Round"/fr="Manche", `numpad.history.round` en="Round {n}"/fr="Manche {n}" (`messages/fr.json`). Remaining 21 fr-identical keys are all covered: 6×`settings.language.*` endonyms, `about.appName`, `a11y.typeBadge`, `conditions.overflow` (ICU passthrough), `forms.field.name.placeholder` (placeholder proper noun), and genuine French cognates with identical spelling — `nav.combats`/`combats.title`="Combats", `conditions.addShort`="Condition", `forms.field.type`="Type", `forms.field.initValue`="Initiative", `forms.field.note`/`forms.note.addShort`="Note", `forms.field.description`="Description", `forms.colorTag.orange`="Orange", `forms.colorTag.violet`="Violet", `about.version`="Version {version}" (cognate + ICU passthrough). No illegitimate English stub remains in fr.json. |
| SET-1 — no `_translation_status` key in any of the 6 files | PASS | `messages/{en,de,ru,es,fr,ja}.json` — key absent in all 6 (re-checked via `json.load` + `'_translation_status' in data`). |
| SET-1 — all 6 locales share exact same key set incl. the 5 previously-missing keys | PASS | Re-checked: `en_keys == fr_keys` (182 non-`$schema` keys each, 183 incl. `$schema`), and de/ru/es/ja unchanged from prior pass. `nav.open`, `nav.primary`, `conditions.addShort`, `forms.note.addShort`, `numpad.history.count` present and natively translated in de/ru/es/fr/ja (unchanged by this fix). |
| SET-1 — ICU placeholders/plural branches preserved per key across all locales | PASS | Re-confirmed the 3 newly-fixed fr keys retain `{n}`: `combat.round`="Manche {n}", `numpad.history.round`="Manche {n}" (both singular-value strings mirroring `en.json`'s non-plural `{n}` usage, no branch structure to preserve/break). No other key touched by this fix. Prior spot-check of `toasts.importAll.success`/`a11y.condition.overflow` plural branches in ru/ja still holds (untouched by this fix). |
| PLT-5 — new Paraglide message key backs dialog/sheet close control | PASS | Unchanged from prior pass — `src/lib/components/ui/dialog/dialog-content.svelte` and `src/lib/components/ui/sheet/sheet-content.svelte` render `m['a11y.close']()`; key translated in all 5 non-en locales; `src/lib/paraglide/messages/a11y_close.js` present (generated). |
| PLT-5 — no literal `>Close<` remains in the two files | PASS | Unchanged — `grep -n '>Close<' dialog-content.svelte sheet-content.svelte` returns no matches. |
| i18n-catalog.md — rows added for the 7 missing keys + close key; 2 ICU rows corrected | PASS | Unchanged from prior pass — all 8 rows present, 2 ICU-notation corrections in place. |
| src/lib/paraglide regenerated (not hand-edited); `npm run gate` passes | PASS | `npm run gate` re-run after the fr.json fix: build completed clean (SvelteKit + PWA, "Wrote site to build", no lint/check/test failures surfaced in output tail). `src/lib/paraglide/*` untouched by hand (only `messages/fr.json` changed since prior pass; paraglide output reflects the standard generated-file shape). |

## Scope check

In-scope files touched (this fix pass): `messages/fr.json` only (3 key values changed: `combat.round`, `combat.round.label`, `numpad.history.round`). No other files modified since the prior verification pass. `specs/backlog.md` remains out of scope for unit 013 (belongs to concurrent unit 014, per dispatch instruction).

No edits found outside the declared ownership list for unit 013.

## Other findings

- The prior FAIL is resolved: fr.json's 3 leftover English "Round" stubs are now correctly translated to "Manche {n}"/"Manche", with `{n}` ICU params intact.
- Re-scanned all 5 non-en locales fresh (not just fr) as a sanity check per instructions — no other illegitimate byte-identical values found anywhere; de/ru/es/ja identical-value sets are unchanged from the prior pass (no regression introduced by the fr-only fix).
- All 8 ACs now PASS. No regressions detected elsewhere in the diff.
