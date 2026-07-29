/**
 * Theme resolve/apply — single owner of setting the `data-theme`
 * attribute on `document.documentElement` and the `theme-color` meta. Called
 * from the root `+layout.svelte` on mount and reactively whenever
 * `store.settings.theme` changes, so the resolved theme is correct on every
 * route/reload — not just on the Settings page (theme-boot bug #1).
 */
import type { Theme } from '$lib/db/types';

const DARK_THEME_COLOR = '#101317';
const LIGHT_THEME_COLOR = '#f4f5f7';

/**
 * localStorage key holding a mirror of `settings.theme`. Dexie stays the source of truth; this
 * mirror exists purely so the pre-paint boot script in `src/app.html` (which cannot await Dexie,
 * and cannot import this module) can set `data-theme` before the first paint. Keep the literal in
 * app.html in sync with this constant.
 */
export const THEME_STORAGE_KEY = 'cp-theme';

function setThemeColorMeta(isDark: boolean) {
	const meta = document.querySelector('meta[name="theme-color"]');
	meta?.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
}

function applyIsDark(isDark: boolean) {
	document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
	// Keep in sync with app.html's pre-paint script, which sets both together — otherwise
	// `data-theme` and `colorScheme` disagree from mount onward and after every theme change.
	document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
	setThemeColorMeta(isDark);
}

/**
 * Resolves `theme` against the current `prefers-color-scheme` media query and
 * applies it to the document. For `theme === 'system'`, also attaches a
 * media-query change listener so a live OS-level scheme change is reflected
 * without a reload. Returns a cleanup function that removes the listener (a
 * no-op for `dark`/`light`) — call it before re-invoking on theme change.
 */
export function applyTheme(theme: Theme): () => void {
	// Mirror the SETTING, not the resolved value — `system` must re-resolve against the live media
	// query at next boot rather than replay a stale resolution. Best-effort: private mode and
	// storage-disabled profiles throw here, and the boot script degrades to its own fallback.
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// Boot hint only — never a hard failure.
	}

	const media = window.matchMedia('(prefers-color-scheme: dark)');
	const resolve = () => theme === 'dark' || (theme === 'system' && media.matches);

	applyIsDark(resolve());

	if (theme === 'system') {
		const onChange = () => applyIsDark(resolve());
		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	}

	return () => {};
}
