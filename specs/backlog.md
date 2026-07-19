# Backlog

next_id: W-023

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-003 | L | large | inbox | Monster / encounter library (v2) | — | — |
| W-006 | L | large | inbox | App-data export/import — all-combats + single-combat, fail-safe import (v2) | — | — |
| W-008 | L | large | inbox | Smooth animations — motion for tap/expand/damage-entry/condition-toggle interactions | — | — |
| W-019 | M | large | inbox | Icon revision — audit every `lucide-svelte` icon in use, fix each choice or swap for a better-fitting one | — | — |

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
