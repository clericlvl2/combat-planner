/**
 * Service-worker registration seam (ADR-004) — PLACEHOLDER, wired in a later milestone.
 *
 * The PWA plugin is configured with `registerType: 'prompt'` (vite.config.ts), so a
 * waiting service worker must surface the locked "Update available — reload" toast
 * (UX §8, i18n toasts.update.*) and reload to activate — data in IndexedDB survives.
 *
 * Implementation will use the plugin's Svelte virtual module:
 *   import { useRegisterSW } from 'virtual:pwa-register/svelte';
 * driving UpdateToast (Component Inventory §3) + the InstallBanner via `beforeinstallprompt`
 * (persist `installHintDismissed`, Data Model §2).
 *
 * TODO M-phase: register the SW and wire the update/install UI (no network beacons — ADR-010).
 */
export {};
