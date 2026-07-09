# Tasks: design-tokens

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Single-file change unit — out-of-scope forbids editing any file but `src/routes/layout.css`, so
there is exactly one phase and no parallelism.

Source of truth for every value: the `:root` (dark/hero) and `.theme-light` token blocks in
`specs/design/prototype.html` (lines ~50–162) plus its "Contrast note (WCAG-AA)" table. Copy
values verbatim — no reinterpretation.

## Phase 1 — Promote STUB tokens to the real prototype token set

**Owns:** `src/routes/layout.css`
**Parallel-safe with:** none

- [ ] Replace the STUB token layer in `src/routes/layout.css` with the real token set drawn from
      `specs/design/prototype.html`, for both dark and light. **Keep the existing shadcn base var
      names** (`--background`, `--foreground`, `--card`, `--muted-foreground`, `--border`, …) — do
      not rename or drop them; components/shadcn-svelte consume them. Re-point their *values* to the
      prototype's exact neutral-chrome colors, mapping prototype
      `--bg / --surface / --surface-2 / --surface-3 / --text / --text-muted / --text-faint / --ring`
      onto the matching shadcn vars. Values may stay hex (prototype's form) rather than OKLCH.
- [ ] Carry over the non-color scales the prototype defines: typography (`--font-xs..xl`), spacing
      (`--space-1..6`), radius (`--radius`, `-sm`, `-lg`), and elevation/shadow — matching the
      prototype's values.
- [ ] Set the semantic type colors (`--type-pc/enemy/ally`), health bands
      (`--health-full/wounded/bloodied/dead`), and the 8 ADR-012 color-tag swatches
      (`--combat-neutral/red/orange/amber/green/teal/blue/violet`) to the prototype's exact hex in
      both themes.
- [ ] Keep every project token that must surface as a Tailwind utility exposed under
      `@theme inline` (e.g. `--color-type-pc`, `--color-health-full`, `--color-combat-*`), adding
      mappings for any newly introduced tokens the screen builds (units D/E) will consume.
- [ ] Verify PLT-5: each semantic foreground/background pair meets WCAG-AA in both themes
      (≥ 4.5:1 text, ≥ 3:1 large-text / non-text indicators), matching the prototype's contrast
      table. Adjust nothing away from prototype values — they are already contrast-checked; this
      step confirms the copy is faithful.
- [ ] Remove every STUB / provisional comment from `src/routes/layout.css` (the header block that
      calls the values a STUB "tuned during the UI build M-phase"); no comment may still mark the
      tokens as provisional.

**Gate:** `npm run gate` must pass before this phase is reported done.
