import { page } from '@vitest/browser/context';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import ResponsiveModal from './ResponsiveModal.svelte';

// The app-level composition layer over ui/dialog and ui/drawer — asserts the invariants it owns:
// a scroll region always exists, the footer renders as a sibling after it (never nested inside —
// the whole point, sticky by construction), the optional onSubmit form wrapper, the header being
// entirely optional, and the two size tokens being the only sizing knob.

afterEach(async () => {
	cleanup();
	await page.viewport(1280, 800);
});

const childrenSnippet = createRawSnippet(() => ({
	render: () => '<p>body content</p>',
}));

const footerSnippet = createRawSnippet(() => ({
	render: () => '<div data-testid="footer">footer content</div>',
}));

const submitChildrenSnippet = createRawSnippet(() => ({
	render: () => '<div><p>body content</p><button type="submit">Submit</button></div>',
}));

test('renders children', async () => {
	const screen = render(ResponsiveModal, { open: true, children: childrenSnippet });

	await expect.element(screen.getByText('body content')).toBeVisible();
});

test('renders footer when passed', async () => {
	const screen = render(ResponsiveModal, {
		open: true,
		children: childrenSnippet,
		footer: footerSnippet,
	});

	await expect.element(screen.getByTestId('footer')).toBeVisible();
});

test('renders nothing footer-related when footer is not passed', async () => {
	render(ResponsiveModal, { open: true, children: childrenSnippet });

	expect(document.querySelector('[data-testid="footer"]')).toBeNull();
});

test('the footer is not a descendant of the overflow-y-auto scroll container', async () => {
	const screen = render(ResponsiveModal, {
		open: true,
		children: childrenSnippet,
		footer: footerSnippet,
	});

	const scrollContainer = document.querySelector('.overflow-y-auto');
	const footerEl = screen.getByTestId('footer').element();

	expect(scrollContainer).not.toBeNull();
	expect(scrollContainer?.contains(footerEl)).toBe(false);
});

test('onSubmit fires once on submit and the default is prevented', async () => {
	const onSubmit = vi.fn();
	const screen = render(ResponsiveModal, {
		open: true,
		title: 'Submit test',
		onSubmit,
		children: submitChildrenSnippet,
	});

	await screen.getByRole('button', { name: 'Submit' }).click();

	expect(onSubmit).toHaveBeenCalledOnce();
	// If the browser's native submit weren't prevented, the page would navigate/reload and this
	// dialog (and the rest of the DOM) would be torn down along with it.
	await expect.element(screen.getByRole('dialog', { name: 'Submit test' })).toBeVisible();
});

test('no header element when title is omitted', async () => {
	render(ResponsiveModal, { open: true, children: childrenSnippet });

	expect(document.querySelector('[data-slot="dialog-title"]')).toBeNull();
	expect(document.querySelector('[data-slot="drawer-title"]')).toBeNull();
});

test('size="form" renders the desktop sm:max-w-[400px] token', async () => {
	const screen = render(ResponsiveModal, {
		open: true,
		title: 'Form size',
		size: 'form',
		children: childrenSnippet,
	});

	const dialog = screen.getByRole('dialog', { name: 'Form size' }).element();
	expect(dialog.className).toContain('sm:max-w-[400px]');
});

test('size="compact" renders the desktop sm:max-w-sm token', async () => {
	const screen = render(ResponsiveModal, {
		open: true,
		title: 'Compact size',
		size: 'compact',
		children: childrenSnippet,
	});

	const dialog = screen.getByRole('dialog', { name: 'Compact size' }).element();
	expect(dialog.className).toContain('sm:max-w-sm');
});
