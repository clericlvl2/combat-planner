# Backlog

next_id: W-054

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-043 | S | small | done | HP-history rows in NumpadSheet rebuilt as a three-column grid (round · delta+action · result), units dropped and setTemp/setMax/round labels shortened in all 6 locales — localized rows wrapped onto two lines on a phone | — | — |
| W-042 | S | small | done | Mobile UI pass from device review: numpad header removed (title now sr-only), numpad commit labels shortened in all 6 locales, drawer no longer double-adjusts for the on-screen keyboard (`repositionInputs={false}`), Restart/Clear menu items got icons, ru `initShort` → Иниц, init pill slightly larger with no press animation | — | — |
| W-039 | M | large | inbox | Split `CombatHeader.svelte` (two divergent popover implementations) and `CombatantFormBody.svelte` (four props encoding two axes). Both flagged by the W-038 audit, deferred as out of scope there | — | — |
| W-040 | M | large | inbox | `hpLog` grows unbounded inside persisted undo snapshots (`domain/hp.ts`) — every snapshot carries the full log, so a long combat compounds. Needs a history-retention decision, not a style fix | — | — |
| W-036 | S | small | inbox | `src/app.html` links `/favicon.svg`, which does not exist in `build/` — 404 on every page load | — | — |
| W-037 | S | small | inbox | InstallBanner sits inside `{#key store.settings.language}`, so a language switch destroys it and discards the stashed `beforeinstallprompt` for the session. Needs a module-level stash outside component lifetime — moving the component out of the key block would break its own localized text. **Narrowed by W-041 Phase 1**: dropping the `store.ready &&` guard stops the hydrate remount, so only a deliberate language switch still discards the prompt | — | — |
| W-053 | M | large | ready | Self-contained inline boot shell (~1 KB, no `var()`, no external asset) plus a non-blocking app stylesheet, so the first frame arrives at ~1 RTT instead of waiting on the render-blocking `<link>`. This is the only lever left on the cold blank window that is not bundle size: W-041 measured first paint at 356 ms (Fast 4G) / 6480 ms (Slow 3G) with the whole delay sitting *before* first paint, which is why the deleted `#boot-skeleton` could never help — it needed the very stylesheet that was blocking. Hard part is not the shell, it is un-blocking the stylesheet without a FOUC on the real app: needs `preload`+`onload` (or equivalent) and an explicit reveal once styles are in, plus a decision on what happens if the stylesheet fails. Worth measuring before committing — post-install boots are SW-warm and already ~80 ms, so the win is confined to the first-ever visit and slow networks | — | `specs/reports/2026-07-29-boot-flash.md` |
| W-044 | S | large | ready | Serialize the store's fire-and-forget Dexie writes behind one FIFO chain. `#mutate` plus ~20 public methods are synchronous `void persistX(this.#db, …)` called straight from click handlers, and two hazards follow: `#doHydrate`'s own first-launch / forward-migration `persistCombat`/`persistSettings` sit outside any queue, so a user write racing hydrate can land first and be clobbered; and a failed `void persistX(...)` is an unhandled rejection. Scope is **Phase 1 only** of the plan — the deferred-handle refactor plus the queue, with the Dexie import left static, i.e. provably byte-neutral and no change to the boot path. Its original goal (deferring Dexie to drop ~24-28 KB brotli) is **not approved**: Dexie is on the critical path to `ready`, so `import()` moves those bytes from parallel-with-boot to a serial RTT before `hydrate()` resolves, and the `modulepreload` mitigation would undo the very deferral it mitigates. Plan Phases 2 and 4 stay unapproved unless a measurement shows cold LCP does not regress | — | `.claude/plans/2026-07-30-move-dexie-off-boot-graph.md` |
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
