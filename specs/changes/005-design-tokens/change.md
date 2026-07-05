---
status: approved
backlog: B-017
---

# Change: design-tokens

## Why

`src/routes/layout.css` ships an explicit STUB token layer ("tuned during UI build M-phase").
Once the prototype look is locked (units 003 + 004), that look must become the single source of
truth for app styling — real, contrast-checked CSS variables — so the screen builds (units D/E)
style against fixed tokens instead of ad-hoc values. Promotes backlog B-017 (split from B-008).

Unit **C** of the 5-unit design chain: A prototype → B feedback iterate → **C design tokens** →
D combats-list screen → E combat screen. Depends on unit 004 (converged, approved prototype).

## What changes

| ID | Change |
|----|--------|
| (source) `src/routes/layout.css` | replace the STUB token block with the real, WCAG-AA token set — dark (hero) + light — for neutral chrome, semantic type colors (PC/enemy/ally), health bands (full/wounded/bloodied/dead), the 8 color-tag swatches (ADR-012), typography scale, spacing, radius, elevation |
| `PLT-5` | satisfy: every semantic foreground/background pair meets WCAG-AA in both themes |
| (ref) `specs/adr/ADR-008.md`, `specs/adr/ADR-012.md` | token layer realizes these; no ADR edit |

## Acceptance criteria

- [ ] The STUB block in `src/routes/layout.css` is fully replaced by a real token set covering
      neutral chrome, type colors, health bands, 8 tag swatches, typography, spacing, radius,
      elevation — for both dark and light. (`ADR-008`, `ADR-012`)
- [ ] The token values equal those shown in the approved `specs/design/prototype.html`
      (preview↔code agree — no reinterpretation).
- [ ] Every semantic foreground/background pair meets WCAG-AA contrast in both themes. (`PLT-5`)
- [ ] No `src/routes/layout.css` comment still marks the tokens as STUB / provisional.
- [ ] `npm run gate` stays green.

## Out of scope

- Prototype / spec changes — units A (003) and B (004).
- Wiring or restyling Svelte components/routes to consume the tokens — units D (combats list)
  and E (combat). This unit only defines the tokens.
- New dependencies; backend; any data or behavior/mechanics change.
- Editing any file other than `src/routes/layout.css`.
