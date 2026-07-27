# Backlog

next_id: W-039

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-038 | L | large | ready | Svelte 5 code-style revision — effect discipline, $state.raw store seam, boot path, migration machinery, .svelte format gate | — | `.claude/plans/2026-07-28-svelte-code-style-revision.md` |
| W-036 | S | small | inbox | `src/app.html` links `/favicon.svg`, which does not exist in `build/` — 404 on every page load | — | — |
| W-037 | S | small | inbox | InstallBanner sits inside `{#key store.settings.language}`, so a language switch destroys it and discards the stashed `beforeinstallprompt` for the session. Needs a module-level stash outside component lifetime — moving the component out of the key block would break its own localized text | — | — |
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
