# Backlog

next_id: W-046

| ID | Pri | Loop | State | Outcome | Depends | Plan |
|----|-----|------|-------|---------|---------|------|
| W-043 | S | small | done | HP-history rows in NumpadSheet rebuilt as a three-column grid (round · delta+action · result), units dropped and setTemp/setMax/round labels shortened in all 6 locales — localized rows wrapped onto two lines on a phone | — | — |
| W-042 | S | small | done | Mobile UI pass from device review: numpad header removed (title now sr-only), numpad commit labels shortened in all 6 locales, drawer no longer double-adjusts for the on-screen keyboard (`repositionInputs={false}`), Restart/Clear menu items got icons, ru `initShort` → Иниц, init pill slightly larger with no press animation | — | — |
| W-039 | M | large | inbox | Split `CombatHeader.svelte` (two divergent popover implementations) and `CombatantFormBody.svelte` (four props encoding two axes). Both flagged by the W-038 audit, deferred as out of scope there | — | — |
| W-040 | M | large | inbox | `hpLog` grows unbounded inside persisted undo snapshots (`domain/hp.ts`) — every snapshot carries the full log, so a long combat compounds. Needs a history-retention decision, not a style fix | — | — |
| W-041 | M | large | active | Boot flash. Measured 2026-07-29: cold `/` is **2160 ms of blank screen** (FCP 4264 ms, 4× CPU / Fast 3G), warm F5 ~50 ms. Two symptoms, not one. Cold: `src/routes/+page.ts`'s `load` awaits Dexie twice then redirects, and SvelteKit paints nothing until a `load` resolves. Warm: a hard blank-to-content cut, plus a **theme flip that also destroys the persisted theme** (pre-hydrate `applyTheme('system')` overwrites the `cp-theme` mirror `app.html` boots from) and a transient `InstallBanner` strip — the reported desktop "black lines", desktop-only because headless never fires `beforeinstallprompt`. Also: `{#key store.ready && …}` remounts all of AppShell at hydrate; SW registers at module scope with `immediate: true`. **Prerendering is NOT the fix** — `prerender = true` + `ssr = false` emits the same empty body; ADR-007 stands. CLS is 0, so the `…` placeholder is polish. Note `gate` runs no Playwright, and `e2e/pwa.e2e.ts:85-86` is the offline suite's only hydration proof | — | `.claude/plans/2026-07-29-fix-boot-flash.md` |
| W-036 | S | small | inbox | `src/app.html` links `/favicon.svg`, which does not exist in `build/` — 404 on every page load | — | — |
| W-037 | S | small | inbox | InstallBanner sits inside `{#key store.settings.language}`, so a language switch destroys it and discards the stashed `beforeinstallprompt` for the session. Needs a module-level stash outside component lifetime — moving the component out of the key block would break its own localized text. **Narrowed by W-041 Phase 1**: dropping the `store.ready &&` guard stops the hydrate remount, so only a deliberate language switch still discards the prompt | W-041 | — |
| W-045 | S | small | inbox | `playwright.config.ts:6` runs e2e against `npm run build && npm run preview`. `vite preview` serves its own shell with relative asset paths; `build/index.html` uses absolute — under preview, deep-link F5 with the SW active fails to boot entirely, so the suite tests a different artifact than production. Same class of bug W-035 fixed for SW registration. Point `webServer` at `build/` behind a catch-all rewrite matching `vercel.json` | — | `specs/reports/2026-07-29-boot-flash.md` |
| W-044 | M | large | inbox | Move Dexie off the eager boot graph (~31,932 brotli, nothing paints from it). Not a one-line dynamic import: `db` is a synchronous default parameter (`combat-store.svelte.ts:55`) on a singleton constructed at module eval (`:285`), and `#mutate` plus ~20 public methods are synchronous fire-and-forget `void persistX(this.#db, …)` called straight from click handlers. Needs a memoized async facade behind `PersistenceDb`. Split out of W-041 Phase 5 | W-041 | — |
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
