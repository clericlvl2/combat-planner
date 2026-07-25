import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import NavSidebar from './NavSidebar.svelte';

// The mobile/tablet nav overlay — links to Combats/Settings/About, each with a visible
// label + icon (no color-alone signifier).

afterEach(() => {
	cleanup();
});

function touchWithClientXY(x: number, y: number) {
	return { clientX: x, clientY: y } as Touch;
}

// jsdom/vitest-browser-svelte's TouchEvent constructor support is inconsistent across
// environments, so these tests build a plain Event and monkey-patch the `touches` property the
// component's handlers read — the same technique used elsewhere in this suite for
// environment-unsupported event shapes.
function fireTouch(type: 'touchstart' | 'touchmove' | 'touchend', x?: number, y?: number) {
	const event = new Event(type, { bubbles: true, cancelable: true }) as unknown as TouchEvent;
	Object.defineProperty(event, 'touches', {
		value: x === undefined ? [] : [touchWithClientXY(x, y ?? 0)],
	});
	window.dispatchEvent(event);
}

test('swipe starting inside the edge zone with horizontal dominance opens the drawer', async () => {
	const screen = render(NavSidebar, { open: false });

	fireTouch('touchstart', 60, 100);
	fireTouch('touchmove', 150, 110); // dx=90, dy=10

	await expect
		.element(screen.getByRole('navigation', { name: m['nav.primary']() }))
		.toBeInTheDocument();
});

test('swipe starting outside the edge zone does not open the drawer', async () => {
	const screen = render(NavSidebar, { open: false });

	fireTouch('touchstart', 200, 100);
	fireTouch('touchmove', 290, 110); // dx=90, dy=10

	await expect
		.element(screen.getByRole('link', { name: m['nav.combats']() }))
		.not.toBeInTheDocument();
});

test('a diagonal drag that fails horizontal dominance does not open the drawer', async () => {
	const screen = render(NavSidebar, { open: false });

	fireTouch('touchstart', 60, 100);
	fireTouch('touchmove', 130, 160); // dx=70, dy=60

	await expect
		.element(screen.getByRole('link', { name: m['nav.combats']() }))
		.not.toBeInTheDocument();
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
