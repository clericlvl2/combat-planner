# Backlog

next_id: W-018

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-003 | L | large | inbox | Monster / encounter library (v2) | — | — |
| W-005 | S | small | inbox | Disable-combatant toggle — skipped by turn advance, card renders pale | — | — |
| W-006 | L | large | inbox | App-data export/import — all-combats + single-combat, fail-safe import (v2) | — | — |
| W-007 | M | small | inbox | Task spec scoping — keep large-task chunks small enough agents don't overflow context | — | — |
| W-008 | L | large | inbox | Smooth animations — motion for tap/expand/damage-entry/condition-toggle interactions | — | — |
| W-009 | M | small | inbox | First-launch UX — onboarding/hints/tutorial or zero-state guidance (needs brainstorm) | — | — |
| W-010 | S | small | inbox | Update About-screen credits/attribution | — | — |
| W-012 | S | small | inbox | NumberField onchange+onblur double-commit can flicker the invalid ring off on blur; decide fix | — | — |
| W-014 | M | small | inbox | Active-turn card indicator — new visual treatment (needs brainstorm) | — | — |
| W-015 | L | large | inbox | Tailwind/styles/tokens grand revision — simplify + unify with modern theming; kill 100-word class lists on simple buttons | — | — |
| W-016 | M | large | inbox | Incorporate git worktrees into skills + workflows | — | — |
| W-017 | M | large | inbox | Rethink a11y scope — commit to color contrast + large mobile tap targets; explicitly drop screen-reader/ARIA/invisible support (needs brainstorm) | — | — |

**Fields**

- **ID**: `W-001`… stable, never reused; `next_id` above tracks the next one to assign.
- **Pri**: S / M / L, a rough size/priority signal, not a hard queue order.
- **Loop**: `small` (`/work-small`) or `large` (`/work-large`) — which loop will run this task.
- **State**: `inbox` (unapproved idea) · `ready` (user-approved) · `active` (claimed) ·
  `blocked` (needs external decision). No `done` state — completed rows are deleted; the
  commit trailer `Work: W-NNN` owns history.
- **Depends**: another `W-NNN` this row is blocked on, or `—`.
- **Plan**: path to the row's plan file once one exists (large loop only), else `—`.

**Non-goals** (not tasks, listed so nobody re-adds them as backlog rows): multi-device
sync/cloud, rules automation, other game systems, live-session sharing — deliberate product
non-goals, see `specs/PRODUCT.md`.
