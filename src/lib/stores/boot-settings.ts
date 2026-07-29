/**
 * Boot-layer settings seed (Phase 1 of the boot-flash fix). `createSettings()` (factories.ts)
 * stays pure per ADR-002 and always returns its hardcoded defaults; this module is the one place
 * that reads the localStorage mirrors those defaults would otherwise contradict pre-hydrate —
 * Paraglide's own locale mirror (`getLocale()`) and the theme mirror `src/lib/theme.ts` writes
 * (`THEME_STORAGE_KEY`) — so `CombatStore`'s initial `$state.raw<Settings>` already agrees with
 * what `app.html`'s pre-paint script and the persisted locale show, instead of flashing English/
 * `system` for the hydrate window and then correcting itself.
 *
 * Both reads are independently best-effort: `export const store = new CombatStore()`
 * (combat-store.svelte.ts) constructs this seed at module eval, so any test importing the store
 * outside a DOM/localStorage environment must not throw here — each read falls back to
 * `createSettings()`'s own default on any failure.
 */
import type { Locale, Settings } from '$lib/db/types';
import { getLocale } from '$lib/i18n';
import { THEME_STORAGE_KEY } from '$lib/theme';
import { createSettings } from './domain/factories';

function seedLanguage(): Locale | undefined {
	try {
		return getLocale() as Locale;
	} catch {
		return undefined;
	}
}

function seedTheme(): Settings['theme'] | undefined {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return stored === 'dark' || stored === 'light' || stored === 'system' ? stored : undefined;
	} catch {
		return undefined;
	}
}

/** `createSettings()` seeded from the boot-time localStorage mirrors, each independently guarded. */
export function createBootSettings(): Settings {
	const language = seedLanguage();
	const theme = seedTheme();
	return createSettings({
		...(language !== undefined ? { language } : {}),
		...(theme !== undefined ? { theme } : {}),
	});
}
