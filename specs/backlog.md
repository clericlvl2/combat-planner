# Backlog

next_id: W-033

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-028 | M | large | active | Progressive nav lag + Settings won't open — suspect stuck bits-ui overlay body-lock; needs runtime repro | — | `specs/reports/2026-07-20-nav-lag-overlay-lock.md` |
| W-032 | M | large | active | App composition layer — `ResponsiveModal` owning the Dialog/Drawer split, scroll region, sticky footer, safe-area padding, sizing and drawer touch policy; migrate all 6 modal call sites; extract `Field`/`TypeToggle`; delete dead vendoring (`sheet`/`progress`/`separator`); ADR-014; + at-top swipe-close scroll guard from its device pass (`specs/reports/2026-07-26-drawer-swipe-close-history.md` attempt 6) | — | `.claude/plans/2026-07-26-responsive-modal-app-layer.md` |
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
