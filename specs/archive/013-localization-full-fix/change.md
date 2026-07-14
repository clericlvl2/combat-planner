---
status: archived
backlog: —
---

# Change: localization-full-fix

## Why

An extensive i18n audit found the app's localization is broken in ways that violate the "6
bundled languages" promise (SET-1, ADR-005):

1. **All 5 non-English locales are ~95% untranslated English-copy stubs.** Each of `de/ru/es/fr/
   ja.json` (176 keys) has only **9 keys actually translated**; the other 167 are byte-identical
   to `en.json`. Every file self-flags `"_translation_status": "STUB — … do not ship as-is."`.
   Switching language today changes almost nothing — SET-1's "changes all visible strings" is
   effectively false for 5 of 6 locales.
2. **Each non-en locale is missing 5 keys** that exist in `en.json` and render live UI, so those
   controls silently fall back to English even after a full translation pass.
3. **Two hardcoded `"Close"` screen-reader strings** in shadcn vendor primitives never localize,
   regardless of selected locale — violates PLT-5 (every control has a semantic label; the label
   must honor the chosen language).
4. **Catalog drift:** `specs/reference/i18n-catalog.md` is missing rows for 7 shipped keys and
   documents 2 keys with the wrong ICU plural notation vs the actual messages.

## What changes

By capability-spec ID (add rows as needed):

| ID | Change |
|----|--------|
| `SET-1` | amend: the 6 bundled locales must ship real native translations, not English stubs — all `de/ru/es/fr/ja` message values translated; `_translation_status` STUB flag dropped from each file. |
| `SET-1` | new: the 5 keys currently missing from non-en locales (`nav.open`, `nav.primary`, `conditions.addShort`, `forms.note.addShort`, `numpad.history.count`) exist and are translated in all 6 locales. |
| `PLT-5` | amend: the two hardcoded `"Close"` sr-only strings (`dialog-content.svelte`, `sheet-content.svelte`) route through a new Paraglide message key so the label localizes with the chosen locale. |
| (ref) `i18n-catalog.md` | catalog synced to actual `messages/en.json`: add rows for the 7 missing keys + the 1 new Close key; correct the 2 ICU-notation mismatches. |

## Acceptance criteria

- [ ] `SET-1` — For every non-English locale (`de/ru/es/fr/ja.json`), no user-facing value is
  byte-identical to its `en.json` counterpart **except** values that are legitimately the same
  across languages: the intentionally-identical `settings.language.*` endonyms (per catalog note);
  the fixed brand name `about.appName` ("Combat Planner", kept identical across all locales); pure
  ICU-parameter passthrough values with no literal text to translate (e.g. `a11y.typeBadge` =
  `"{type}"`, `conditions.overflow` = `"+{n}"`); genuine cross-language cognates where the accurate
  translation matches the English spelling (e.g. `es` `conditions.vulnerable` = "Vulnerable"); and
  example/placeholder proper-noun strings (e.g. `forms.field.name.placeholder`). Every other key's
  value must be changed to native-language text — a diff of each non-en file vs `en.json` shows the
  bulk (~160+ keys) translated, with only the enumerated legitimate cases left identical.
- [ ] `SET-1` — None of the 6 `messages/*.json` files contains a `_translation_status` key.
- [ ] `SET-1` — All 6 locale files contain the exact same key set (same count, same keys),
  including the previously-missing `nav.open`, `nav.primary`, `conditions.addShort`,
  `forms.note.addShort`, `numpad.history.count`, each with a native-language value in the 5
  non-en files.
- [ ] `SET-1` — ICU placeholders/params are preserved across every locale for every key: no
  locale adds, drops, or renames a `{param}` or plural branch relative to `en.json` (arg sets
  match per key).
- [ ] `PLT-5` — A new Paraglide message key backs the dialog/sheet close control; both
  `src/lib/components/ui/dialog/dialog-content.svelte` and
  `src/lib/components/ui/sheet/sheet-content.svelte` render that key via a message function
  instead of the literal string `"Close"`; the key exists and is translated in all 6 locales.
- [ ] `PLT-5` — `grep` for the literal `>Close<` (the removed sr-only text) in
  `dialog-content.svelte` and `sheet-content.svelte` returns nothing.
- [ ] `i18n-catalog.md` — Rows exist for `combat.notFound.title`, `combat.notFound.back`,
  `appError.title`, `appError.body`, `appError.reload`, `appError.goToCombats`,
  `numpad.history.count`, and the new close key; and the `toasts.importAll.success` /
  `a11y.condition.overflow` rows match the actual `en.json` ICU notation.
- [ ] `src/lib/paraglide/*` is regenerated (not hand-edited) after the `messages/*.json` edits;
  `npm run gate` passes (lint, check, test:unit --run, build).

## Out of scope

- The ~26 message keys defined but currently unreferenced in `src/**` (e.g. `combats.import`,
  `settings.data.exportAll`, `toasts.update.*`, `a11y.undo`, `conditions.overflow`). They are
  pre-provisioned for not-yet-built capabilities (import/export IMP, PWA update/install toasts,
  standalone undo/redo, condition-overflow chip) — leave them in place, translated, but do not
  wire them to any UI.
- `DialogFooter`'s guarded hardcoded `"Close"` (`dialog-footer.svelte`, default
  `showCloseButton = false`, no caller enables it) — not touched; only the two always-rendered
  sr-only strings are in scope.
- No new locales, no locale-switcher UI changes, no changes to `baseLocale`/Paraglide config.
- No edits by hand to `src/lib/paraglide/*` (generated).
- Native-speaker review of the machine-authored translations — translations are authored to
  best-effort quality with ICU/param fidelity guaranteed, but human linguistic review is a
  separate follow-up, not part of this unit.
