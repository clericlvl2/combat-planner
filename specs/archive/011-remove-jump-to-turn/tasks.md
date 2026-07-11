# Tasks: 011-remove-jump-to-turn

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Ordering note: Phase 1 strips every *source* reference to the jump control and the two i18n keys.
Only once those references are gone can Phase 2 safely drop the keys from `messages/*.json` and
regenerate Paraglide — removing a key while source still calls `m['active.jumpToTurn']()` would
fail `check`. The two phases own disjoint file sets but have a hard ordering dependency, so they
are **not** parallel-safe.

Do NOT edit capability specs (`TRE-2`, `PLT-3`) or reference docs (`component-inventory.md`,
`i18n-catalog.md`) — those are re-synced by doc-syncer at CLOSE, not implementer work.

## Phase 1 — Remove jump control from source (component / route / icon / README + delete)

**Owns:** `src/lib/components/app/JumpToTurnButton.svelte`, `src/lib/components/app/CombatHeader.svelte`, `src/routes/combats/[id]/+page.svelte`, `src/lib/icons.ts`, `src/lib/components/app/README.md`
**Parallel-safe with:** none (Phase 2 depends on this landing first)

This is one visual surface (the Active-screen jump control: desktop `header-jump` roundel + mobile
Jump pill) plus its icon/registry/doc plumbing — one implementer owns all of it.

- [ ] Delete `src/lib/components/app/JumpToTurnButton.svelte`.
- [ ] `CombatHeader.svelte`: remove the `header-jump` roundel `<Button>` block (the one whose
      `aria-label`/`title` use `m['active.jumpToTurn']()`), remove the `onJump?: () => void` entry
      from the `$props()` type, remove `onJump` from the destructure, and remove
      `const Jump = chromeIcon.jump;`. Keep the `header-advance` roundel, its `onAdvance` handler,
      and everything else intact. Update the header doc-comment / inline comments that mention
      `header-jump` / "Jump pill" so they no longer reference the removed control.
- [ ] `src/routes/combats/[id]/+page.svelte`: remove the `JumpToTurnButton` import, the
      `<JumpToTurnButton onclick={jumpToActiveTurn}/>` render in the Active branch, the
      `jumpToActiveTurn` function, and the `onJump={jumpToActiveTurn}` prop on `<CombatHeader>`.
      **Keep** the `mainEl` `bind:this` on `<main>` — it is now consumed by the auto-scroll below,
      not deleted. Update the leading doc-comment and the Active-FAB inline comment that describe
      the JumpToTurnButton / Jump pill. Do NOT touch the Advance FAB, round counter, escalation
      die, or overlay/back-dismiss logic.
- [ ] `src/routes/combats/[id]/+page.svelte`: wire auto-scroll-on-advance (TRE-2, previously
      spec'd but never coded — the removed `jumpToActiveTurn` held the only scroll-into-view). On
      turn advance, scroll the newly active row (`[data-active="true"]` inside `mainEl`) into view
      with `scrollIntoView({ behavior: 'smooth', block: 'center' })` — the same effect the deleted
      handler produced. Implementer picks the mechanism (e.g. an `$effect` keyed on the active
      combatant's id, or wrapping `controller.advance`), but it MUST fire on every advance
      including the round-wrap advance, and MUST NOT depend on the removed button/handler.
- [ ] `src/lib/icons.ts`: remove the `jump: Crosshair,` entry from `chromeIcon` and remove the
      `Crosshair` import (confirmed no other consumer — only the `jump` entry referenced it).
- [ ] `src/lib/components/app/README.md`: remove the `JumpToTurnButton.svelte    scroll active row into view (§7)` line.
- [ ] Leave `messages/*.json` and `src/lib/paraglide/*` untouched in this phase — the two i18n
      keys stay present (now unused) until Phase 2; unused keys do not fail the gate.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Drop i18n keys + regenerate Paraglide

**Owns:** `messages/en.json`, `messages/ja.json`, `messages/ru.json`, `messages/de.json`, `messages/fr.json`, `messages/es.json`, `src/lib/paraglide/**` (generated)
**Parallel-safe with:** none (must run after Phase 1 removes all source references)

- [ ] Remove the `"active.jumpToTurn"` and `"a11y.jumpToTurn"` entries from all six
      `messages/*.json` locales (en, ja, ru, de, fr, es).
- [ ] Regenerate Paraglide with `npm run prepare` — never hand-edit `src/lib/paraglide/*`. Confirm
      no generated `jumpToturn` message functions remain (e.g. `active_jumptoturn2.js`,
      `a11y_jumptoturn2.js` are gone).

**Gate:** `npm run gate` must pass before this phase is reported done.
