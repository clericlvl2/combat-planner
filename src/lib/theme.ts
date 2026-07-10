/**
 * Theme resolve/apply (SET-2) — single owner of "toggle the `dark` class on
 * `document.documentElement`" and the `theme-color` meta. Called from the root
 * `+layout.svelte` on mount and reactively whenever `store.settings.theme`
 * changes, so the resolved theme is correct on every route/reload — not just
 * on the Settings page (theme-boot bug #1).
 */
import type { Theme } from '$lib/db/types';

const DARK_THEME_COLOR = '#101317';
const LIGHT_THEME_COLOR = '#f4f5f7';

function setThemeColorMeta(isDark: boolean) {
	const meta = document.querySelector('meta[name="theme-color"]');
	meta?.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
}

function applyIsDark(isDark: boolean) {
	document.documentElement.classList.toggle('dark', isDark);
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
