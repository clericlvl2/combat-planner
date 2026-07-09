import { createRawSnippet } from 'svelte';
import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import AppShell from './AppShell.svelte';

// Phase 1: AppShell composes NavSidebar/AppHeader around the route outlet. Covers the wiring
// (burger opens the sidebar) and that the route outlet still renders — not route-specific chrome
// swapping (page.route.id isn't a real SvelteKit route in this component-level test).

afterEach(() => {
	cleanup();
});

const routeOutlet = createRawSnippet(() => ({
	render: () => '<p data-testid="route-outlet">Combats home</p>',
}));

test('renders the route outlet content', async () => {
	const screen = render(AppShell, { children: routeOutlet });

	await expect.element(screen.getByText('Combats home')).toBeInTheDocument();
});

test('clicking the burger button opens NavSidebar', async () => {
	const screen = render(AppShell, { children: routeOutlet });

	// NavSidebar's branding title only exists in the DOM once its Sheet is open — the
	// nav-desktop icon row (always present, just CSS-hidden below the desktop breakpoint) isn't
	// a reliable signal here since it renders its own "Combats" link regardless of sidebar state.
	await expect.element(screen.getByText(m['about.appName']())).not.toBeInTheDocument();

	await screen.getByRole('button', { name: m['nav.open']() }).click();

	await expect.element(screen.getByText(m['about.appName']())).toBeVisible();
});
