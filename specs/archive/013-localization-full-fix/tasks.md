# Tasks: 013-localization-full-fix

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

**Pinned decision — new close key.** The dialog/sheet sr-only close label routes through the
Paraglide key **`a11y.close`** (English value `"Close"`), sitting in the existing `a11y.*`
accessible-label namespace. Every locale file and both vendor components MUST reference this exact
key name. Referenced in code as `m['a11y.close']()` (import `{ m } from '$lib/i18n'`).

**Pinned decision — the 5 currently-missing keys** (must exist + be translated in all 6 locales):
`nav.open` (en `"Open navigation"`), `nav.primary` (en `"Primary navigation"`),
`conditions.addShort` (en `"Condition"`), `forms.note.addShort` (en `"Note"`),
`numpad.history.count` (en `"{n} records"` — preserve the `{n}` param).

**Endonym exception.** `settings.language.en|de|es|fr|ja|ru` are intentionally byte-identical
across all locales (English / Deutsch / Español / Français / 日本語 / Русский). Do NOT translate
them. Per the SET-1 AC, these are the *only* values allowed to match `en.json`; every other value
(including proper nouns like `about.appName`) must become native-language text.

## Phase 1 — English base + close key

**Owns:** `messages/en.json`
**Parallel-safe with:** none (must land first — it is the canonical key set every other locale
mirrors and the source of the new `a11y.close` key)

- [ ] Add `"a11y.close": "Close"` to `messages/en.json`.
- [ ] Remove the `_translation_status` key from `messages/en.json`.
- [ ] Do not touch any other value (English source stays as-is).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — German locale (de)

**Owns:** `messages/de.json`
**Parallel-safe with:** Phases 3, 4, 5, 6 (each locale file is independent). Runs after Phase 1.

- [ ] Translate every user-facing value to German (~167 English-copy values), leaving the
  `settings.language.*` endonyms byte-identical to `en.json`.
- [ ] Add the 5 missing keys (`nav.open`, `nav.primary`, `conditions.addShort`,
  `forms.note.addShort`, `numpad.history.count`), translated, matching `en.json`'s key set.
- [ ] Add `"a11y.close"` translated to German.
- [ ] Remove the `_translation_status` key.
- [ ] Preserve every ICU placeholder / plural branch exactly (`{param}` names and plural
  structure identical to `en.json` per key — add/drop/rename nothing).
- [ ] Ensure the final key set equals `en.json`'s (same count, same keys).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Russian locale (ru)

**Owns:** `messages/ru.json`
**Parallel-safe with:** Phases 2, 4, 5, 6. Runs after Phase 1.

- [ ] Translate every user-facing value to Russian; keep `settings.language.*` endonyms identical.
- [ ] Add the 5 missing keys (translated) + `"a11y.close"` (translated); remove
  `_translation_status`.
- [ ] Preserve all ICU placeholders / plural branches exactly; final key set equals `en.json`'s.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — Spanish locale (es)

**Owns:** `messages/es.json`
**Parallel-safe with:** Phases 2, 3, 5, 6. Runs after Phase 1.

- [ ] Translate every user-facing value to Spanish; keep `settings.language.*` endonyms identical.
- [ ] Add the 5 missing keys (translated) + `"a11y.close"` (translated); remove
  `_translation_status`.
- [ ] Preserve all ICU placeholders / plural branches exactly; final key set equals `en.json`'s.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 5 — French locale (fr)

**Owns:** `messages/fr.json`
**Parallel-safe with:** Phases 2, 3, 4, 6. Runs after Phase 1.

- [ ] Translate every user-facing value to French; keep `settings.language.*` endonyms identical.
- [ ] Add the 5 missing keys (translated) + `"a11y.close"` (translated); remove
  `_translation_status`.
- [ ] Preserve all ICU placeholders / plural branches exactly; final key set equals `en.json`'s.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 6 — Japanese locale (ja)

**Owns:** `messages/ja.json`
**Parallel-safe with:** Phases 2, 3, 4, 5. Runs after Phase 1.

- [ ] Translate every user-facing value to Japanese; keep `settings.language.*` endonyms identical.
- [ ] Add the 5 missing keys (translated) + `"a11y.close"` (translated); remove
  `_translation_status`.
- [ ] Preserve all ICU placeholders / plural branches exactly; final key set equals `en.json`'s.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 7 — Vendor close-key wiring + Paraglide regeneration

**Owns:** `src/lib/components/ui/dialog/dialog-content.svelte`,
`src/lib/components/ui/sheet/sheet-content.svelte`
**Parallel-safe with:** Phase 8 only. Runs after Phases 1–6 (regeneration must happen once all
`messages/*.json` edits have landed; the `m['a11y.close']` reference needs the key present in
every locale so generated types/build are correct).

- [ ] In `dialog-content.svelte`, replace `<span class="sr-only">Close</span>` with the
  Paraglide message: `<span class="sr-only">{m['a11y.close']()}</span>` (add
  `import { m } from '$lib/i18n';`). Leave the guarded `showCloseButton` block otherwise intact.
- [ ] In `sheet-content.svelte`, make the identical replacement (import `m`, render
  `m['a11y.close']()`).
- [ ] Do NOT touch `dialog-footer.svelte` (out of scope).
- [ ] Regenerate `src/lib/paraglide/*` via `npm run prepare` (never hand-edit generated output)
  so `check` and `build` see `a11y.close` across all locales.
- [ ] Verify `grep '>Close<'` returns nothing in either vendor file.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 8 — i18n catalog sync

**Owns:** `specs/reference/i18n-catalog.md`
**Parallel-safe with:** Phases 2–7 (doc-only, disjoint from all code). Runs after Phase 1 (needs
the final `en.json` key set).

- [ ] Add rows for the 7 shipped-but-undocumented keys: `combat.notFound.title`,
  `combat.notFound.back`, `appError.title`, `appError.body`, `appError.reload`,
  `appError.goToCombats`, `numpad.history.count`.
- [ ] Add a row for the new close key `a11y.close` (English `"Close"`).
- [ ] Correct the ICU notation on `toasts.importAll.success`
  (`{n, plural, one {{n} combat} other {{n} combats}} imported.`) and `a11y.condition.overflow`
  (`{n, plural, one {{n} more condition} other {{n} more conditions}}`) to match `en.json`.
- [ ] Do not edit `change.md` or any capability spec.

**Gate:** `npm run gate` must pass before this phase is reported done.
