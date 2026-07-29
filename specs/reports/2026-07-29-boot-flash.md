# Investigation: boot flash on first open and F5 (W-041)

**Status:** investigation complete, no code changed. Supersedes the cause analysis in the W-041
backlog row, which named a fix that does not work.
**Date:** 2026-07-29
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

- **CLS is 0 in every scenario.** The `<p class="p-4 text-muted-foreground">…</p>` placeholder was
  assumed to cause layout shift. It does not measurably. Replacing it with dimension-matched
  skeletons is a polish item, not a Core Web Vitals fix.
- **Warm F5 is already fast** (~100 ms FCP) because the service worker serves everything from Cache
  Storage, bypassing the network entirely. Bundle size is therefore *not* what makes F5 flash — the
  render sequence is.

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
