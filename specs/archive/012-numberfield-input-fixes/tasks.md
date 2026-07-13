# Tasks: 012-numberfield-input-fixes

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Two phases, strictly sequential. Phase 2 references the new stepper `aria-label` message keys via
`m[...]`, so those keys must exist and be Paraglide-compiled first (Phase 1). The phases own
disjoint file sets but have a real ordering dependency — neither is parallel-safe.

## Phase 1 — Add Decrease/Increase i18n keys + regenerate Paraglide

**Owns:** `messages/en.json`, `messages/de.json`, `messages/es.json`, `messages/fr.json`,
`messages/ja.json`, `messages/ru.json`, and the generated `src/lib/paraglide/*` output.
**Parallel-safe with:** none (Phase 2 depends on this; also owns the generated Paraglide output
that Phase 2 reads)

- [ ] Add two new flat dotted message keys (Decrease / Increase, for the stepper `−`/`+`
  `aria-label`s) to all 6 locale files, following the existing `"errors.clamp"` flat-key
  convention. Use the same key name in every locale; provide a real translation per language
  (`de/en/es/fr/ja/ru`), not an English fallback.
- [ ] Do NOT hand-edit `src/lib/paraglide/*` — edit only `messages/*.json`, then regenerate with
  `npm run prepare` so the new keys are available as `m['<key>']`.
- [ ] Confirm the two new keys resolve through `$lib/i18n`'s `m` object after regen (Phase 2 will
  reference them; a missing key would fail `check`/`build`).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Rework NumberField input + B-013 test

**Owns:** `src/lib/components/app/NumberField.svelte`,
`src/lib/components/app/NumberField.svelte.spec.ts` (new)
**Parallel-safe with:** none (depends on Phase 1's message keys + compiled Paraglide output)

- [ ] Switch the inner value `<Input>` from `type="number"` to `type="text"` so no native browser
  spinner arrows render (kills the desktop overlap with the `−`/`+` buttons).
- [ ] Change the keyboard hint so a minus key is reachable on mobile for the negative-capable
  fields (`inputmode="text"` or `"tel"`), so a leading `-` followed by digits is typeable and
  commits as a negative number.
- [ ] Sanitize typed entry on `oninput` via regex to the allowed set (digits + a single leading
  `-`); intermediate-invalid states (`-`, `1e`, `1.`) must no longer blank the field or break
  commit. Keep the existing commit-time `clamp(n, min, max)` behavior and the `errors.clamp` inline
  hint exactly as today.
- [ ] Retain the digit-cap for typed input (`capDigits`/`digitCap`), AND add a paste /
  programmatic-set path that bypasses the cap so an overflowing value can reach `clamp` (B-013).
- [ ] Add `aria-label`s to the `−` and `+` stepper buttons sourced from the two new Phase 1 message
  keys via `m['<key>']`. Ensure `getByLabelText(fieldLabel)` still resolves to the value input
  alone (stepper aria-labels must not collide with the field label). Update the top-of-file comment
  that currently claims no Decrease/Increase keys exist.
- [ ] Keep the `.numfield` visual unchanged (bordered stepper shell, `−` / centered value / `+`,
  44px/`min-h-11` touch targets); do not add new public props, and do not touch call sites or
  `clamp`/`RANGES`.
- [ ] Add `NumberField.svelte.spec.ts` (vitest-browser-svelte, matching the existing
  `CombatantForm.svelte.spec.ts` conventions): a unit test that drives the paste / programmatic-set
  path with an over-cap out-of-range value and asserts the clamp fires (closes B-013's "clamp
  unreachable" gap). Also assert `getByLabelText(fieldLabel)` resolves to the input alone.

**Gate:** `npm run gate` must pass before this phase is reported done.
