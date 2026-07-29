/// <reference types="vite-plugin-pwa/svelte" />
/**
 * Service-worker registration seam (ADR-004).
 *
 * The PWA plugin is configured with `registerType: 'prompt'` (vite.config.ts), so a
 * waiting service worker must surface the locked "Update available — reload" toast
 * (i18n toasts.update.*) and reload to activate — data in IndexedDB survives.
 *
 * Thin wrapper over the plugin's Svelte virtual module — `needRefresh` (a Svelte store)
 * and `updateServiceWorker` are re-exported as-is so `+layout.svelte` owns all UI. No
 * network beacons or telemetry (ADR-010): `useRegisterSW` is called with `immediate: false`
 * only, so it neither pings nor periodically checks a remote endpoint beyond fetching this
 * app's own `sw.js` for updates.
 *
 * `immediate: false` defers registration rather than disabling it: the Svelte wrapper
 * defaults `immediate: true` (overriding `registerSW`'s own `false` default), which put a
 * ~246 KB precache sweep on the boot path while boot chunks were still parsing.
 * `workbox-window`'s `Workbox.register` awaits `window.load` before registering when
 * `immediate` is falsy and `document.readyState !== 'complete'`, so the service worker
 * still registers and update checks still fire — just after first paint, not before it.
 * `needRefresh` is a plain `writable(false)` constructed synchronously regardless of
 * `immediate`, so no call site changes.
 *
 * The manifest `<link>` itself is static in `src/app.html`, not injected from here — see
 * the comment there for why `<svelte:head>` can't reach the adapter-static SPA fallback.
 */
import { useRegisterSW } from 'virtual:pwa-register/svelte';

const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: false });

export { needRefresh, updateServiceWorker };
