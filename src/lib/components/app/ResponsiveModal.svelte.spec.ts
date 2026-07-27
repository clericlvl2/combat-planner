import { page } from '@vitest/browser/context';
import { createRawSnippet } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import ResponsiveModal from './ResponsiveModal.svelte';

// The app-level composition layer over ui/dialog and ui/drawer — asserts the invariants it owns:
// a scroll region always exists, the footer renders as a sibling after it (never nested inside —
// the whole point, sticky by construction), the optional onSubmit form wrapper, the required
// `title` always giving the dialog an accessible name, and the two size tokens being the only
// sizing knob.

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
	const screen = render(ResponsiveModal, {
		open: true,
		title: 'Test modal',
		children: childrenSnippet,
	});

	await expect.element(screen.getByText('body content')).toBeVisible();
});

test('renders footer when passed', async () => {
	const screen = render(ResponsiveModal, {
		open: true,
		title: 'Test modal',
		children: childrenSnippet,
		footer: footerSnippet,
	});

	await expect.element(screen.getByTestId('footer')).toBeVisible();
});

test('renders nothing footer-related when footer is not passed', async () => {
	render(ResponsiveModal, { open: true, title: 'Test modal', children: childrenSnippet });

	expect(document.querySelector('[data-testid="footer"]')).toBeNull();
});

test('the footer is not a descendant of the overflow-y-auto scroll container', async () => {
	const screen = render(ResponsiveModal, {
		open: true,
		title: 'Test modal',
		children: childrenSnippet,
		footer: footerSnippet,
	});

	const scrollContainer = document.querySelector('.overflow-y-auto');
	const footerEl = screen.getByTestId('footer').element();

	expect(scrollContainer).not.toBeNull();
	expect(scrollContainer?.contains(footerEl)).toBe(false);
});

test('the scroll region leaves clip room on both axes for focus/selected rings', async () => {
	render(ResponsiveModal, { open: true, title: 'Test modal', children: childrenSnippet });

	const scrollContainer = document.querySelector('.overflow-y-auto') as HTMLElement;
	const classes = scrollContainer.className.split(/\s+/);

	// `overflow-y-auto` clips on both axes, so a `ring-2 ring-offset-2` control flush against an
	// edge loses 4px of its ring unless the region pads itself by at least that much. Each axis
	// pairs padding with a cancelling negative margin so the outer geometry is unchanged.
	// Asserted on the class list, not computed style: no stylesheet is loaded in this browser test
	// environment, so every computed padding reads 0px regardless of the classes present.
	for (const [pad, margin] of [
		['px-3', '-mx-3'],
		['py-1', '-my-1'],
	]) {
		expect(classes).toContain(pad);
		expect(classes).toContain(margin);
	}
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

// `title` is required (ADR-014): the old "no header when omitted" contract left bits-ui with no
// DialogTitle/DrawerTitle, so `aria-labelledby` pointed at nothing and a caller could ship an
// unnamed dialog (NumpadSheet did). Assert the header renders instead.
test('renders the dialog title', async () => {
	render(ResponsiveModal, { open: true, title: 'Test modal', children: childrenSnippet });

	expect(document.querySelector('[data-slot="dialog-title"]')).not.toBeNull();
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
