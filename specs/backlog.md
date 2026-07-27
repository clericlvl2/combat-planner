# Backlog

next_id: W-035

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-034 | S | small | inbox | Run the W-033 manual PWA device pass against the live deploy — install, airplane-mode reload, offline deep link, update toast on redeploy. Checklist written, never run | — | `specs/reports/2026-07-27-pwa-restoration.md` |
| W-028 | M | large | active | Progressive nav lag + Settings won't open — suspect stuck bits-ui overlay body-lock; needs runtime repro | — | `specs/reports/2026-07-20-nav-lag-overlay-lock.md` |
| W-006 | L | large | inbox | App-data export — whole app state, and library on its own. Export only, no import; no per-combat snapshots | — | — |

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
