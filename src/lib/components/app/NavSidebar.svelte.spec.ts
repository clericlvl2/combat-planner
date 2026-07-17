import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import NavSidebar from './NavSidebar.svelte';

// The mobile/tablet nav overlay — links to Combats/Settings/About, each with a visible
// label + icon (no color-alone signifier). The swipe-right-to-open gesture itself is a touch-only
// affordance verified manually/in e2e — not simulated here (see tasks.md Phase 1 report).

afterEach(() => {
	cleanup();
});

test('when open, renders links to Combats, Settings, and About', async () => {
	const screen = render(NavSidebar, { open: true });

	await expect.element(screen.getByRole('navigation', { name: m['nav.primary']() })).toBeVisible();

	const combatsLink = screen.getByRole('link', { name: m['nav.combats']() });
	const settingsLink = screen.getByRole('link', { name: m['nav.settings']() });
	const aboutLink = screen.getByRole('link', { name: m['nav.about']() });

	await expect.element(combatsLink).toHaveAttribute('href', '/combats');
	await expect.element(settingsLink).toHaveAttribute('href', '/settings');
	await expect.element(aboutLink).toHaveAttribute('href', '/about');
});

test('is not rendered in the accessibility tree when closed', async () => {
	const screen = render(NavSidebar, { open: false });

	await expect
		.element(screen.getByRole('link', { name: m['nav.combats']() }))
		.not.toBeInTheDocument();
});
