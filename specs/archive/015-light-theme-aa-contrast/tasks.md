# Tasks: 015-light-theme-aa-contrast

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

This is a token-value-only change confined to the single SSOT file `specs/design/tokens.css`.
Every failing foreground token lives in that one file, and the light combat swatches are one
visual surface (mutual distinguishability per ADR-012) that must not be split — so all the
recompute/adjust work is a single sequential phase. The PLT-5 spec-doc edit (removing the B-028
deferral paragraph, restoring the unqualified both-themes-AA claim) is the doc-syncer's job at
close, not an implementer phase, and is intentionally absent here.

## Phase 1 — Recompute + adjust failing token hexes to AA

**Owns:** `specs/design/tokens.css`
**Parallel-safe with:** none (single-phase change)

For each foreground below, recompute the WCAG 2.1 relative-luminance contrast ratio from the
actual hex against each rendered background, then adjust the hex only if it falls below 4.5:1 —
hue-preserving, minimal luminance shift (darken for light theme, lighten for dark theme) — until
it clears **≥4.5:1** as normal text. Backgrounds: `--surface` = `#ffffff` (light) / `#171b21`
(dark); `--surface-2` = `#f0f2f5` (light) / `#1f242c` (dark).

- [ ] `--text-faint` **dark** (`[data-theme="dark"]`, currently `#6b7683`) ≥4.5:1 against
      `#171b21` and `#1f242c`.
- [ ] `--text-faint` **light** (`[data-theme="light"]`, currently `#8b94a1`) ≥4.5:1 against
      `#ffffff` and `#f0f2f5`.
- [ ] Light `--health-wounded` (`#a76b07`) ≥4.5:1 against `#ffffff` and `#f0f2f5`.
- [ ] Light `--health-bloodied` (`#c75505`) ≥4.5:1 against `#ffffff` and `#f0f2f5`.
- [ ] Light `--combat-blue` (`#0b7caf`) ≥4.5:1 against `#ffffff` and `#f0f2f5`.
- [ ] Light `--combat-orange` (`#bb5611`) ≥4.5:1 against `#ffffff` and `#f0f2f5`.
- [ ] Light `--combat-green` (`#0b8457`) ≥4.5:1 against `#ffffff` and `#f0f2f5`.
- [ ] Light `--combat-neutral` (`#64748b`) ≥4.5:1 against `#ffffff` and `#f0f2f5`.
- [ ] Light `--combat-teal` (`#0e8174`) ≥4.5:1 against `#ffffff` and `#f0f2f5`.
- [ ] Every changed value stays in its original hue family (hue shift incidental to the luminance
      change, not a recolor); the 8 light combat swatches remain mutually distinguishable
      (ADR-012).
- [ ] No other token value in `specs/design/tokens.css` is changed — dark health bands, dark
      swatches, light `--combat-red`/`--combat-amber`/`--combat-violet`, the three type colors,
      and all neutral-chrome / spacing / type / radius / component-dim tokens stay byte-identical.
- [ ] Do NOT edit `prototype.html`, `card-prototype.html`, or `src/routes/layout.css` — they
      already resolve these tokens via `@import` of `tokens.css` (verified: no inline hex); the
      SSOT invariant must stay intact. Do NOT edit `specs/capabilities/platform.md` (doc-syncer
      owns the PLT-5 edit at close).

**Gate:** `npm run gate` must pass before this phase is reported done.
