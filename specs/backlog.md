# Backlog

next_id: W-044

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-043 | S | small | done | HP-history rows in NumpadSheet rebuilt as a three-column grid (round · delta+action · result), units dropped and setTemp/setMax/round labels shortened in all 6 locales — localized rows wrapped onto two lines on a phone | — | — |
| W-042 | S | small | done | Mobile UI pass from device review: numpad header removed (title now sr-only), numpad commit labels shortened in all 6 locales, drawer no longer double-adjusts for the on-screen keyboard (`repositionInputs={false}`), Restart/Clear menu items got icons, ru `initShort` → Иниц, init pill slightly larger with no press animation | — | — |
| W-039 | M | large | inbox | Split `CombatHeader.svelte` (two divergent popover implementations) and `CombatantFormBody.svelte` (four props encoding two axes). Both flagged by the W-038 audit, deferred as out of scope there | — | — |
| W-040 | M | large | inbox | `hpLog` grows unbounded inside persisted undo snapshots (`domain/hp.ts`) — every snapshot carries the full log, so a long combat compounds. Needs a history-retention decision, not a style fix | — | — |
| W-041 | M | large | inbox | Boot flash on first open still visible. `src/app.html`'s pre-paint script now sets `data-theme` + `color-scheme` (kills the unstyled white/black token flash), but a blank-shell → app transition remains: ADR-007 keeps `ssr = false` / `prerender = false`, so the served HTML is an empty SPA shell and nothing paints until the JS bundle hydrates. Fixing it means revisiting the render strategy (prerendered shell, or a static skeleton in the shell body) — not a CSS change | — | `.claude/plans/2026-07-28-fix-theme-boot-flash.md` |
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
