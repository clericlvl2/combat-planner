# Backlog

next_id: W-056

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-043 | S | small | done | HP-history rows in NumpadSheet rebuilt as a three-column grid (round · delta+action · result), units dropped and setTemp/setMax/round labels shortened in all 6 locales — localized rows wrapped onto two lines on a phone | — | — |
| W-042 | S | small | done | Mobile UI pass from device review: numpad header removed (title now sr-only), numpad commit labels shortened in all 6 locales, drawer no longer double-adjusts for the on-screen keyboard (`repositionInputs={false}`), Restart/Clear menu items got icons, ru `initShort` → Иниц, init pill slightly larger with no press animation | — | — |
| W-039 | M | large | inbox | Split `CombatHeader.svelte` (two divergent popover implementations) and `CombatantFormBody.svelte` (four props encoding two axes). Both flagged by the W-038 audit, deferred as out of scope there | — | — |
| W-040 | M | large | inbox | `hpLog` grows unbounded inside persisted undo snapshots (`domain/hp.ts`) — every snapshot carries the full log, so a long combat compounds. Needs a history-retention decision, not a style fix | — | — |
| W-054 | S | large | ready | Finish W-046's deferral on `/combats/[id]`. That route (`nodes/6`) statically imports the same bits-ui / vaul / floating chunks W-046 removed from `/`, via `CombatHeader`→`ConfirmDialog` and `CombatantForm`→`ResponsiveModal` — which is why W-046 measured cold-`/` LCP flat: the bytes were deferred out of `/` and then pulled straight back in by the first-launch redirect into this route. Same approved mechanism as W-046 (action-gated `import()`, module-level memo, `.catch` that clears the memo, `open` flipped after `tick()`, static placeholder wherever a deferred component owns a control visible at first paint). Measured bar: `/combats/[id]`'s eager route closure drops, F5 `/combats/<id>` does not regress, cold `/` LCP finally moves | — | `.claude/plans/2026-07-30-defer-route-dialogs.md` |
| W-055 | S | small | ready | `check:i18n` is in `npm run gate` and in `CLAUDE.md`'s Gate section but is **not** a step in `.github/workflows/ci.yml`, so CI does not verify locale parity — a missing key in one of the 6 locales passes CI. Found while landing W-048 | — | — |
| W-037 | S | small | inbox | InstallBanner sits inside `{#key store.settings.language}`, so a language switch destroys it and discards the stashed `beforeinstallprompt` for the session. Needs a module-level stash outside component lifetime — moving the component out of the key block would break its own localized text. **Narrowed by W-041 Phase 1**: dropping the `store.ready &&` guard stops the hydrate remount, so only a deliberate language switch still discards the prompt | — | — |
| W-053 | M | large | ready | Self-contained inline boot shell (~1 KB, no `var()`, no external asset) plus a non-blocking app stylesheet, so the first frame arrives at ~1 RTT instead of waiting on the render-blocking `<link>`. This is the only lever left on the cold blank window that is not bundle size: W-041 measured first paint at 356 ms (Fast 4G) / 6480 ms (Slow 3G) with the whole delay sitting *before* first paint, which is why the deleted `#boot-skeleton` could never help — it needed the very stylesheet that was blocking. Hard part is not the shell, it is un-blocking the stylesheet without a FOUC on the real app: needs `preload`+`onload` (or equivalent) and an explicit reveal once styles are in, plus a decision on what happens if the stylesheet fails. Worth measuring before committing — post-install boots are SW-warm and already ~80 ms, so the win is confined to the first-ever visit and slow networks | — | `specs/reports/2026-07-29-boot-flash.md` |
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
