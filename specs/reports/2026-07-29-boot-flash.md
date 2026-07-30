# Investigation: boot flash on first open and F5 (W-041)

**Status:** investigation complete; all six phases of the plan shipped. The "After — Phase 6" table
below records the post-fix numbers against the original baseline. Supersedes the cause analysis in
the W-041 backlog row, which named a fix that does not work.
**Date:** 2026-07-29 (investigation), 2026-07-30 (fix landed)
**Plan:** `.claude/plans/2026-07-29-fix-boot-flash.md`

## Headline

Two different problems were being reported as one:

1. **Cold open (`/`, no service worker) — 2.16 s of blank screen.** Dominated by
   `src/routes/+page.ts`, whose `load` awaits IndexedDB twice and then redirects before SvelteKit
   renders anything at all. This is the PWA `start_url`, so it is the launch path.
2. **Warm F5 — ~100 ms blank.** Fast, but visible as a flash because it is a hard
   blank-to-content cut with no intermediate state.

The previously-shipped pre-paint theme script (`src/app.html`) is working correctly: the blank
frame is `#101317`, the real dark `--bg`. What remains is not a wrong colour, it is an empty page.

## Measured evidence

Captured against the real `build/` output served through a static server replicating
`vercel.json`'s catch-all rewrite. Headless Chromium 1440×900, `colorScheme: dark`, CPU throttled
4×, network Fast 3G (1.6 Mbps / 150 ms RTT). Rig: throwaway Playwright script, scratchpad only,
not committed.

| Scenario | first-paint | FCP | LCP | CLS | blank window |
|---|---:|---:|---:|---:|---:|
| Cold `/` (no SW, empty IndexedDB) | 2104 ms | 4264 ms | 4264 ms | 0 | **2160 ms** |
| F5 on `/` (SW warm) | 44 ms | 104 ms | 144 ms | 0 | 60 ms |
| F5 on `/combats` | 52 ms | 112 ms | 160 ms | 0 | 60 ms |
| F5 on `/combats/<id>` | 44 ms | 92 ms | 136 ms | 0 | 48 ms |

Two results that contradict working assumptions and change priorities:

- **CLS is 0 in every baseline scenario.** The `<p class="p-4 text-muted-foreground">…</p>`
  placeholder was assumed to cause layout shift. It does not — see the CLS investigation below,
  which identifies the real (and unrelated) shifter. Placeholder sizing is a polish item, exactly
  as this baseline suggested.
- **Warm F5 is already fast** (~100 ms FCP) because the service worker serves everything from Cache
  Storage, bypassing the network entirely. Bundle size is therefore *not* what makes F5 flash — the
  render sequence is.

### After — Phase 6 (all phases applied)

Captured with the now-committed `scripts/capture-boot.mjs` against the same real `build/`
output, served by `scripts/serve-build.mjs` (the two-line static server this phase adds to
replace `vite preview` in the e2e config — see Phase 6 below). Same conditions: headless
Chromium 1440×900, `colorScheme: dark`, CPU throttled 4×, network Fast 3G. "Blank window" is
reported as equal to first-paint here — nothing paints before it, by definition — rather than
independently re-derived from screenshot polling; see the script's header comment for why that
turned out to be a noisier measurement of the same instant, not a different one.

| Scenario | first-paint | FCP | LCP | CLS | blank window |
|---|---:|---:|---:|---:|---:|
| Cold `/` (no SW, empty IndexedDB) | 1744 ms | 3616 ms | 4712 ms | 0.036 | 1744 ms |
| F5 on `/` (SW warm) | 40 ms | 144 ms | 192 ms | 0.000 | 40 ms |
| F5 on `/combats` | 44 ms | 108 ms | 132 ms | 0.000 | 44 ms |
| F5 on `/combats/<id>` | 44 ms | 100 ms | 140 ms | 0.000 | 44 ms |

Note what the cold row is: an empty IndexedDB is **the first launch ever for that install**, and
`App.firstLaunch` (`src/lib/stores/domain/app.ts:79`) gates on `settings.firstLaunchDone`, so it
seeds a combat and returns an id exactly once and `null` on every boot after. The
`/` → seeded-combat redirect Phase 3 moved out of `+page.ts` therefore happens once per install, not
on every cold boot — a cold boot on an existing install goes straight to `CombatsHome` with no
redirect and no intermediate chrome. Measurements on this row should not be generalised to
steady-state cold opens.

Deltas against the baseline above:

- **Cold `/` first-paint/blank-window: 2104/2160 ms → 1744 ms (−17%/−19%).** Phase 3 unblocking
  `/` (no more double Dexie await before anything paints) plus Phase 2's static skeleton account
  for this — the skeleton itself now paints at first-paint, before Dexie or the redirect decision
  resolve.
- **Cold `/` FCP: 4264 ms → 3616 ms (−15%).** Faster, but still the dominant cost on this path —
  Phase 5's boot-graph shrink and the still-open Dexie-behind-a-facade item (out of scope, filed
  separately) are the remaining levers, not this phase.
- **Cold `/` LCP: 4264 ms → 4712 ms (+10.5%) — a regression, and the one number this unit made
  worse.** Expected in direction if not in size: pre-fix, the first thing painted at all was the
  settled page, so first-paint, FCP and LCP collapsed onto the same 4264 ms instant. Post-fix the
  skeleton paints at 1744 ms and the real largest element arrives later, on its own schedule, so LCP
  becomes a separate and later event. The +448 ms on top of that is real extra work on the critical
  path, not just re-labelling: Phase 3 moved `CombatsHome` into `/`'s own bundle, which pulls
  bits-ui and vaul into the root node graph. Phase 5 took only the layout-level shrink (sonner,
  NavSidebar's Drawer); the route-level dialog deferral that would offset this is filed as W-046 and
  is the first thing to do before re-measuring.
- **Cold `/` CLS: 0 → 0.036.** Cause identified by measurement — see "What the 0.036 actually is"
  below. It is neither the skeleton nor the placeholder, both of which were asserted here in earlier
  revisions of this report and both of which were wrong.
- **Warm F5 scenarios (`/`, `/combats`, `/combats/<id>`): first-paint/blank-window unchanged
  within measurement noise (~40-52 ms before, ~40-44 ms after).** Consistent with warm F5 already
  being fast pre-fix (everything served from Cache Storage). FCP moved a few ms in both directions
  across runs, consistent with CDP-throttling jitter, not a real change.

### Correction — Phase 2's skeleton made warm F5 qualitatively *worse*

The delta note above originally claimed the warm-F5 improvement was "qualitative, not a timing
regression these numbers were ever going to show". The user reported after deploy that F5 still
flashed, and re-measurement showed the qualitative change went the wrong way. Warm F5 with the
service worker in control, production build, CPU 4×:

| | first paint | content |
|---|---:|---:|
| with the skeleton painting immediately | 32 ms — skeleton chrome | 80 ms |
| with the skeleton suppressed, nothing else changed | 44 ms — flat dark canvas | 96 ms |

On a reload the browser holds the previous frame until the new document paints, so suppressing the
skeleton yields **one** visual change. Painting it yields **two** 48 ms apart, the first of which is
chrome that matches neither the previous page nor the destination. Two structural paints 48 ms apart
is what "flashing on F5" is.

Two further facts this exposed, both of which narrow what the skeleton can ever do:

- **It cannot cover the first frame.** Every color in it is a `var()` token defined by the
  render-blocking app stylesheet, so it has nothing to paint until that sheet lands. The dark canvas
  on the genuinely first frame comes from the inline `color-scheme` declaration in the theme script,
  which was the other half of the same commit. Verified in dev, where Vite injects CSS via JS: with
  no stylesheet applied, `--bg` is undefined and the skeleton's computed background is
  `rgba(0, 0, 0, 0)` — the raw canvas shows through, white under `cp-theme: light`.
- **It never painted on cold boot at all, so it was deleted.** A delayed reveal (CSS
  `animation-delay`, past warm-F5 FCP) was implemented first, on the assumption that cold open still
  needed cover. Measurement killed that assumption. Sampling the skeleton's computed opacity every
  animation frame, cold, empty profile, CPU 4×:

| profile | first paint | skeleton removed | visible frames |
|---|---:|---:|---:|
| Fast 4G, no reveal delay | 356 ms | 351 ms | **0** |
| Slow 3G, no reveal delay | 6480 ms | 6472 ms | **0** |
| Fast 4G, 260 ms delay | 360 ms | 355 ms | **0** |
| Slow 3G, 260 ms delay | 6480 ms | 6472 ms | **0** |

  `onMount` removes the skeleton 5-8 ms *before* first paint on every profile, delay or not. The
  reason is structural: the skeleton is styled entirely off `var()` tokens, so it cannot paint until
  the render-blocking app stylesheet lands — and the bundle, fetched in parallel via `modulepreload`,
  has finished executing by then. On a cold boot the gap between "stylesheet applied" and "bundle
  ran" does not exist. It exists **only** on a warm F5, where both come from Cache Storage and the
  JS parse is the slower half (~30 ms vs ~78 ms) — that is, the one window where painting a skeleton
  is harmful. The mechanism was inverted: the only place it could appear was the only place it must
  not.

  So `#boot-skeleton`, its teardown in `+layout.svelte`, and the reveal delay are all gone. The
  cold-boot blank window is entirely *pre-first-paint* time, which no in-shell markup can cover
  because that markup needs the stylesheet too. The dark canvas there comes from the inline
  `color-scheme` declaration, and only from it. Shortening the window itself means either shrinking
  what blocks first paint (W-044, W-046) or making the app stylesheet non-blocking behind a
  self-contained inline shell (W-053).

### What the 0.036 actually is

Two explanations were asserted in this report before anyone measured, and both were wrong: first
the `#boot-skeleton` overlay (impossible — `position: fixed; inset: 0`, out of flow), then the
in-flow `…` placeholder. The second was disproved by doing it: the placeholders on `/`,
`CombatsHome`, `/library` and `/combats/[id]` were dimension-matched to their real content and
cold-`/` CLS stayed at exactly 0.036.

Resolved by capturing `layout-shift` entries with their `sources` array, which names the shifting
nodes. Cold `/`, first launch, three runs — one single entry, byte-identical every time:

```
[~4706 ms] value = 0.03573
  <main class="flex flex-1 flex-col">
    previousRect = { x: 0, y: 52, w: 1425, h: 848 }
    currentRect  = { x: 0, y: 0,  w: 1425, h: 900 }
```

`<main>` jumps up by 52 px — `h-13`, one `AppHeader`. `AppShell.svelte` derives
`routeHasOwnHeader = page.route.id === '/combats/[id]'` and renders `AppHeader` as an in-flow
sibling *above* `<main>` on every other route. So when `/`'s first-launch `onMount` runs
`goto('/combats/<seededId>')`, `routeHasOwnHeader` flips true, `AppHeader` unmounts, and everything
below it slides up one header height. `/combats/[id]` renders its own `CombatHeader` *inside*
`<main>`, so the header appears not to move while the content under it jumps.

Independently confirmed by geometry — `/combats/[id]` is the only route where `<main>` starts at
`y = 0`:

| route | `<main>` | `<header>` | header inside `<main>` |
|---|---|---|---|
| `/combats`, `/library`, `/settings` | y=52 h=848 | y=0 h=52 | no |
| `/combats/<id>` | **y=0 h=900** | y=0 h=52 | **yes** |

The arithmetic closes exactly, which rules out coincidence: impact fraction
`(900 × 1425) / (900 × 1440) = 0.98958`, distance fraction `52 / max(1440, 900) = 0.036111`,
product `0.035735` against Chrome's reported `0.03573`.

Scope, three runs each: cold `/` first launch **0.0357**; cold `/` steady state (`firstLaunchDone`
true, combats seeded) **0.0000, zero entries**; cold `/library`, `/settings`, `/combats` **0.0000,
zero entries**. So the earlier claim in this report that 0.036 was "a lower bound on the app" is
**dead** — the floor is 0.000 on every route and on every launch after the first. This is a
once-per-install event, at ~4.7 s, during a navigation the user initiated by opening the app.

**Deliberately not fixed.** 0.036 is 36% of the "good" threshold, occurs once per install, and field
CLS is a p75 across page loads, so a single first-launch event is statistically invisible. The header
seam it comes from is also intentional: `/combats/[id]` owns its header so the app does not stack two
bars. The only real fixes cost more than they buy — reserving 52 px on every route means refactoring
`AppShell` so `/combats/[id]` renders `CombatHeader` into a shell-owned slot, and suppressing
`AppHeader` during the undecided first-launch window trades the shift for a 52 px blank bar during
boot, which is the class of flash this whole unit exists to remove. The backlog row tracking this
(W-050) is deleted rather than done.

The desktop "black lines at the top" symptom **could not be reproduced headless**, but the
mechanism is now identified — see root cause 5. The original theory (`AppHeader.svelte:34` being
destroyed by the `{#key}` remount and repainting) is **discarded**: Svelte's `{#key}` teardown and
re-create happen inside a single effect flush, so there is no intermediate frame to see. The
remount is a state/CPU problem, not a repaint one.

## Root causes

### 1. `/`'s `load` blocks the first paint on two serial IndexedDB reads

`src/routes/+page.ts:21-39`:

```ts
const wasFirstLaunch = await store.peekFirstLaunch();  // Dexie round-trip 1
await store.hydrate();                                  // Dexie round-trip 2 (must follow)
redirect(307, '/combats');                              // then a cold chunk fetch
```

SvelteKit renders nothing until a route's `load` resolves. `nodes/5` and `nodes/6` are not in the
boot preload graph, so the post-redirect chunk fetch starts cold. Net effect on `/`: no header, no
placeholder, no chrome — one unbroken blank frame until everything lands.

The two awaits are semantically serial: `peekFirstLaunch` must observe the flag before `hydrate`
consumes it. This is not a missing `Promise.all`.

`hydrate()` itself is already optimal — `src/lib/stores/combat-store.svelte.ts:81-91` issues three
promises / four Dexie operations concurrently.

### 2. Hydrate remounts the entire app

`src/routes/+layout.svelte:63` — `{#key store.ready && store.settings.language}`. The expression is
`false` pre-hydrate (short-circuit on `store.ready`) and `"en"` after, so Svelte destroys and
recreates the whole `<AppShell>` subtree — header, nav, install banner, main — the instant hydrate
resolves.

### 3. Locale resolves to English first on a fresh profile

Paraglide reads `localStorage['PARAGLIDE_LOCALE']`, which is only ever written by `setLocale()`,
called at `+layout.svelte:24` *after* hydrate. `createSettings()` hardcodes `language: 'en'`
(`src/lib/stores/domain/factories.ts:146`). A non-English DM sees English text, then a swap.

### 4. The service worker competes with boot

`src/lib/pwa/register.ts:18-22` calls `useRegisterSW()` at **module scope**, and the compiled
default is `immediate: true` (the Svelte wrapper flips workbox-window's own `false` default). The
precache sweep — 50 entries, 873,570 raw / ~246 KB brotli — starts while boot chunks are still
parsing, and Workbox precaching uses `cache: 'reload'`, so HTTP-cache hits are not guaranteed.

### 5. The pre-hydrate theme effect flips the document *and* destroys the persisted choice

Added after review; missed in the first pass.

`src/routes/+layout.svelte:29-32` runs `applyTheme(store.settings.theme)` in a `$effect` that fires
at mount, i.e. pre-hydrate, when `store.settings.theme` is the hardcoded `'system'`
(`factories.ts:150`). `applyTheme` then does two damaging things for the whole hydrate window:

- `theme.ts:43` — `localStorage.setItem('cp-theme', 'system')`, **overwriting the user's persisted
  `light`/`dark` mirror**, which is the value `app.html:28` reads to paint the first frame. Reload
  inside that window and the explicit theme choice is silently gone until the user revisits Settings.
- `theme.ts:51` → `:27` — re-resolves `data-theme` against `prefers-color-scheme`, ignoring the
  user's explicit setting.

Concrete failure: `theme: 'light'` in Dexie, dark OS. `app.html` paints `light` correctly, the effect
flips it to `dark`, hydrate resolves, it flips back to `light`. Two full-page theme flips across
exactly the window this report is about.

The rig missed it because it ran a fresh profile with `colorScheme: dark` — `'system'` resolves dark,
and dark → dark → dark is invisible.

Separately, `applyIsDark` (`theme.ts:26-29`) never updates `documentElement.style.colorScheme`,
which `app.html:32` set inline, so the two disagree from mount onward and after every theme change.

### 6. `InstallBanner` paints a transient strip pre-hydrate — the "black lines"

`AppShell.svelte:41` mounts `<InstallBanner>` in normal document flow directly above `<main>`, and it
renders a full-width strip with `border-b border-border bg-secondary px-4 py-2`
(`InstallBanner.svelte:67-69`). Visibility is
`deferredPrompt !== null && !store.settings.installHintDismissed && !standalone`
(`:49-51`).

Pre-hydrate `installHintDismissed` is `false` (`factories.ts:152`) and, unlike `theme` and
`language`, it has **no localStorage mirror** — so it cannot be seeded. On desktop Chrome
`beforeinstallprompt` fires early, so a user who already dismissed the hint gets the bordered strip
painted and then removed the instant hydrate lands.

This accounts for every property of the reported symptom: a bordered full-width bar at the top of
the viewport, appearing and disappearing, desktop-only, and invisible to the rig — **headless
Chromium never fires `beforeinstallprompt`**, which is why no capture reproduced it.

## Boot bundle

Wire bytes before first possible paint (shell = `index.html` + 20 modulepreloads + 3 blocking
stylesheets, 24 files): **509,389 raw / 157,441 gzip / 139,798 brotli.**

Reaching an actual first pixel needs more, because `/` redirects:

| Milestone | files | brotli |
|---|---:|---:|
| Shell | 24 | 139,798 |
| → `/combats` (node 5) — returning user | 32 | 175,235 |
| → `/combats/<id>` (node 6) — first launch | 33 | 191,115 |

Top boot-path costs by brotli:

| Asset | brotli | Verdict |
|---|---:|---|
| `DnzpwbP5.js` — Dexie 4.4 (27,440) + db/store/domain | 31,932 | Deferrable; nothing paints from it |
| `BBrfdo3k.js` — Svelte 5 runtime | 20,929 | Irreducible |
| `CL0XYHL5.js` — bits-ui + svelte-toolbelt | 17,213 | **Not removable from the layout alone** — see correction below |
| `Wvz0Wcvz.js` + `drawer.css` — vaul-svelte | 13,295 | Deferrable; Drawer mounts closed |
| `0.CgrFEE3m.css` — Tailwind 4 output | 11,026 | Needed, correctly sized |

**Correction (post-review).** The original claim here — that lazy-mounting `<Toaster>` and
`NavSidebar`'s Drawer drops drawer + sonner + bits-ui for −41,611 brotli, 30 % of the shell, and
−53 % with lazy Dexie — **is wrong on both counts.**

- **bits-ui and vaul are not layout-exclusive.** `ResponsiveModal.svelte:29-30` statically imports
  both `ui/dialog` (bits-ui) and `ui/drawer` (vaul), and `combats/+page.svelte:104` renders
  `<CombatFormDialog>` *outside* the `{#if}`/`{:else}` at `:74`/`:88` — unconditionally. So
  `/combats` already pulls both chunks regardless of what the root layout does. The only
  layout-exclusive chunk is sonner. The real lever for bits-ui/vaul is deferring
  `CombatFormDialog` / `ConfirmDialog` / `CombatRowMenu` *inside the route components*.
- **Lazy Dexie is not a one-line import change.** `db` is a synchronous default parameter
  (`combat-store.svelte.ts:55`) on a singleton constructed at module eval (`:285`), and `#mutate`
  (`:126-135`) plus ~20 public methods are synchronous fire-and-forget `void persistX(this.#db, …)`
  called straight from click handlers. It needs a memoized async facade behind `PersistenceDb`.

The honest layout-level win is the sonner JS chunk plus `sonner.css`, which also takes the fallback
`index.html` from three render-blocking stylesheets to two. Any future measurement here must be
baselined against `/` and `/combats` wire bytes, not against a "shell" that no route renders.

Checked and *not* worth acting on: the `$lib/icons` lucide barrel over-includes ~18 unused glyphs,
worth ≈1.1 KB brotli. Paraglide ships all 6 locales per message, but only 16 of 234 messages reach
the boot path — under 2 KB brotli of waste, and Paraglide's own guidance says per-locale splitting
only pays above ~20 locales. The 76 KB Tailwind sheet is 639 utility rules with no safelist blowup;
it compresses to 11 KB.

## Framework verdicts (Kit 2.68 / Vite 8.1 / Tailwind 4.3 / vite-pwa 1.1)

### Does not work — the W-041 row is wrong

**`prerender = true` + `ssr = false` emits the same empty body.** It is allowed and throws no
error, but `render.js:144` short-circuits: with `ssr: false`, both `%sveltekit.head%`'s component
contribution and `%sveltekit.body%` are the empty string. Docs, page-options: *"If you set `ssr` to
`false`, it renders an empty 'shell' page instead."* It buys per-route preload hints only.

Real markup in static HTML requires `prerender = true` **with `ssr = true`**, which needs the root
layout and page to be server-renderable (no `document`/`window`/Dexie at module or render time) and
**can never cover `/combats/<id>`** — the IDs live only in IndexedDB, so SvelteKit cannot enumerate
them. It would also collide with `fallback: 'index.html'`: adapter-static writes prerendered pages
first, then overwrites with the fallback (`adapter-static/index.js:65-71`). That is a full ADR-007
reversal for partial coverage. **ADR-007 stands.**

### Works

- **Static skeleton in `app.html`.** With `ssr: false` there is no hydration; SvelteKit calls
  Svelte's `mount()`, which *appends*. `clear_text_content(target)` exists only in `hydrate()`'s
  error path, so skeleton markup persists and never flashes — it must be removed explicitly. Not
  documented anywhere; behaviour confirmed from installed source.
- **`useRegisterSW({ immediate: false })`** — `Workbox.register` then awaits `window.load`.
- **`preload` filter on `resolve` in a `handle` hook** — the correct layer for trimming the 20
  modulepreloads. Vite's `modulePreload.resolveDependencies` cannot touch them; SvelteKit emits
  those tags itself (`render.js:388-395`). Fallback generation runs through the full server
  pipeline, so a `hooks.server.ts` applies at build time even with no runtime server.

### No supported mechanism

Critical-CSS extraction does not exist in Vite 8 or Tailwind 4.3. `cssCodeSplit: false` makes it
worse. `inlineStyleThreshold` is per-file all-or-nothing — inlining the 76 KB sheet into every HTML
response is a bad trade. Paraglide per-locale builds are experimental and require a `url`/`cookie`
strategy that ADR-005 rules out. Workbox `navigationPreload` is a near no-op here because
navigations are served from Cache Storage, not the network.

## Out-of-scope findings

- **`npm run preview` is not representative of the deployed artifact.** Preview renders its own
  shell with *relative* asset paths; `build/index.html` uses absolute. Under preview, F5 on
  `/combats/<id>` with the service worker active fails to boot entirely — every module 404s to the
  SPA fallback and returns `text/html`, so the app never starts. Against the real `build/` output
  the same reload works (FCP 92 ms, no console errors). `playwright.config.ts` runs e2e against
  `npm run preview`, so the suite cannot catch deep-link boot regressions — the exact class of bug
  W-035 fixed for service-worker registration. Worth its own row.
- **`npm run gate` runs no Playwright.** `gate` is `lint && check && check:i18n && test:unit --run
  && build`; `test:e2e` is a separate script. Any change to routing can break the e2e suite without
  failing a single gate run.
- **`e2e/pwa.e2e.ts:85-86` is load-bearing and easy to break silently.** It asserts `goto('/')` then
  `toHaveURL(/\/combats\/?$/)`, and its own comment states why: *"a shell that was served but never
  hydrated has a visible body too, which is the exact failure this test exists to catch (W-035).
  Only the hydrated client router can turn `/` into a combat URL."* Making `/` render its content in
  place does not merely break the assertion — it removes the only hydration proof in the offline
  suite. Any such change must replace it with an equivalent, e.g. the client-rendered `sr-only` `h1`
  idiom the same file already uses for `/settings`.
- `e2e/smoke.e2e.ts:5` asserts `/` redirects to `/combats/<id>`. This one needs no rewrite —
  `expect(page).toHaveURL()` auto-retries, so it is already timing-tolerant.
- `NavSidebar.svelte:27,35` duplicates the nav list and current-route logic that
  `nav-links.ts` exists to centralise — the exact drift its doc comment warns about.
- ADR-011 names `lucide-svelte`; the installed package is `@lucide/svelte`.
- W-036 (`/favicon.svg` 404) still open and sits in the critical window.
