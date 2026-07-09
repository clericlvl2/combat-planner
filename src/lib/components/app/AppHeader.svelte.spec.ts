import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import AppHeader from './AppHeader.svelte';

// PLT-3: tablet/desktop chrome — burger opens NavSidebar (via the parent-owned onOpenNav
// callback), desktop's inline nav-desktop icon row exposes the same three destinations.

afterEach(() => {
	cleanup();
});

test('the burger button calls onOpenNav when clicked', async () => {
	const onOpenNav = vi.fn();
	const screen = render(AppHeader, { onOpenNav });

	await screen.getByRole('button', { name: m['nav.open']() }).click();

	expect(onOpenNav).toHaveBeenCalledOnce();
});

test('nav-desktop exposes Combats, Settings, and About, each with a visible label', async () => {
	const screen = render(AppHeader, { onOpenNav: vi.fn() });

	await expect
		.element(screen.getByRole('navigation', { name: m['nav.primary']() }))
		.toBeInTheDocument();
	await expect.element(screen.getByRole('link', { name: m['nav.combats']() })).toBeInTheDocument();
	await expect.element(screen.getByRole('link', { name: m['nav.settings']() })).toBeInTheDocument();
	await expect.element(screen.getByRole('link', { name: m['nav.about']() })).toBeInTheDocument();
});
