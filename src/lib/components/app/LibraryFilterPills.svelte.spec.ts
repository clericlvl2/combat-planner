import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import LibraryFilterPills from './LibraryFilterPills.svelte';

// Quick row = first 6 tags alphabetically, plus any out-of-range selected tag (never invisible);
// the inline more/less trigger only renders when the tag count exceeds the 6-tag quick row (7+),
// expands/collapses to show every tag; selection is OR semantics and survives expand/collapse.

afterEach(() => {
	cleanup();
});

const TAGS = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];

test('no more/less trigger when tag count is at or below the quick row (6)', async () => {
	const screen = render(LibraryFilterPills, {
		allTags: TAGS.slice(0, 6),
		selected: [],
		onChange: vi.fn(),
	});

	expect(screen.getByRole('button', { name: 'More' }).query()).toBeNull();
	expect(screen.getByRole('button', { name: 'Less' }).query()).toBeNull();
});

test('the more trigger appears once the tag count exceeds 6', async () => {
	const screen = render(LibraryFilterPills, {
		allTags: TAGS.slice(0, 7),
		selected: [],
		onChange: vi.fn(),
	});

	await expect.element(screen.getByRole('button', { name: 'More' })).toBeVisible();
});

test('collapsed shows only the first 6 tags alphabetically', async () => {
	const screen = render(LibraryFilterPills, { allTags: TAGS, selected: [], onChange: vi.fn() });

	for (const name of TAGS.slice(0, 6)) {
		await expect.element(screen.getByRole('button', { name })).toBeVisible();
	}
	expect(screen.getByRole('button', { name: 'Golf' }).query()).toBeNull();
	expect(screen.getByRole('button', { name: 'Hotel' }).query()).toBeNull();
});

test('an out-of-range selected tag stays visible while collapsed', async () => {
	const screen = render(LibraryFilterPills, {
		allTags: TAGS,
		selected: ['Hotel'],
		onChange: vi.fn(),
	});

	await expect.element(screen.getByRole('button', { name: 'Hotel' })).toBeVisible();
});

test('the more/less trigger expands to show every tag, then collapses back to 6', async () => {
	const screen = render(LibraryFilterPills, { allTags: TAGS, selected: [], onChange: vi.fn() });

	await screen.getByRole('button', { name: 'More' }).click();
	await expect.element(screen.getByRole('button', { name: 'Golf' })).toBeVisible();
	await expect.element(screen.getByRole('button', { name: 'Hotel' })).toBeVisible();

	await screen.getByRole('button', { name: 'Less' }).click();
	expect(screen.getByRole('button', { name: 'Golf' }).query()).toBeNull();
});

test('selection persists across expand/collapse', async () => {
	const onChange = vi.fn();
	const screen = render(LibraryFilterPills, { allTags: TAGS, selected: [], onChange });

	await screen.getByRole('button', { name: 'Alpha' }).click();
	expect(onChange).toHaveBeenCalledExactlyOnceWith(['Alpha']);

	// `selected` is a read-only, caller-owned prop (no local fallback state) — the real call site
	// (routes/library/+page.svelte) re-derives and passes it back down on every onChange, so the
	// test mirrors that round trip explicitly instead of relying on component-local mutation.
	await screen.rerender({ allTags: TAGS, selected: ['Alpha'], onChange });

	await screen.getByRole('button', { name: 'More' }).click();
	await expect
		.element(screen.getByRole('button', { name: 'Alpha' }))
		.toHaveAttribute('aria-pressed', 'true');

	await screen.getByRole('button', { name: 'Less' }).click();
	await expect
		.element(screen.getByRole('button', { name: 'Alpha' }))
		.toHaveAttribute('aria-pressed', 'true');
});

test('clicking a second pill adds it (OR semantics) rather than replacing the first', async () => {
	const onChange = vi.fn();
	const screen = render(LibraryFilterPills, {
		allTags: TAGS,
		selected: ['Alpha'],
		onChange,
	});

	await screen.getByRole('button', { name: 'Bravo' }).click();

	expect(onChange).toHaveBeenCalledExactlyOnceWith(['Alpha', 'Bravo']);
});

test('clicking a selected pill deselects it', async () => {
	const onChange = vi.fn();
	const screen = render(LibraryFilterPills, {
		allTags: TAGS,
		selected: ['Alpha', 'Bravo'],
		onChange,
	});

	await screen.getByRole('button', { name: 'Alpha' }).click();

	expect(onChange).toHaveBeenCalledExactlyOnceWith(['Bravo']);
});
