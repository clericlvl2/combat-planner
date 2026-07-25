import { page } from '@vitest/browser/context';
import { afterEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import TagAssignmentDialog from './TagAssignmentDialog.svelte';

// Entry-agnostic tag-assignment surface: toggling a chip fires onToggle, the pinned new-tag
// input fires onCreateTag (trimmed, empty ignored), and it renders a Dialog on desktop / Drawer
// on mobile (same MediaQuery split as ConditionPicker). The chip list is a live view of `allTags`
// — a tag toggled off its last entry vanishes immediately.

afterEach(async () => {
	cleanup();
	await page.viewport(1280, 800);
});

test('clicking an unselected tag chip fires onToggle with that name', async () => {
	const onToggle = vi.fn();
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: ['Boss', 'Undead'],
		selected: [],
		onToggle,
		onCreateTag: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Boss' }).click();

	expect(onToggle).toHaveBeenCalledExactlyOnceWith('Boss');
});

test('clicking a selected tag chip (toggle-off) fires onToggle with that name', async () => {
	const onToggle = vi.fn();
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: ['Boss'],
		selected: ['Boss'],
		onToggle,
		onCreateTag: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Boss' }).click();

	expect(onToggle).toHaveBeenCalledExactlyOnceWith('Boss');
});

test('submitting the new-tag input fires onCreateTag with the trimmed value', async () => {
	const onCreateTag = vi.fn();
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: [],
		selected: [],
		onToggle: vi.fn(),
		onCreateTag,
	});

	await userEvent.fill(screen.getByPlaceholder('New tag…'), '  Boss  ');
	await userEvent.keyboard('{Enter}');

	expect(onCreateTag).toHaveBeenCalledExactlyOnceWith('Boss');
});

test('submitting a name already selected does not fire onCreateTag and clears the input', async () => {
	const onCreateTag = vi.fn();
	const onToggle = vi.fn();
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: ['Boss'],
		selected: ['Boss'],
		onToggle,
		onCreateTag,
	});

	const input = screen.getByPlaceholder('New tag…');
	await userEvent.fill(input, '  boss  ');
	await userEvent.keyboard('{Enter}');

	expect(onCreateTag).not.toHaveBeenCalled();
	expect(onToggle).not.toHaveBeenCalled();
	await expect.element(input).toHaveValue('');
});

test('shows a muted empty-state hint when there are no tags', async () => {
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: [],
		selected: [],
		onToggle: vi.fn(),
		onCreateTag: vi.fn(),
	});

	await expect
		.element(screen.getByText('No tags yet — type a name above to create one.'))
		.toBeVisible();
});

test('submitting an empty new-tag input is ignored', async () => {
	const onCreateTag = vi.fn();
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: [],
		selected: [],
		onToggle: vi.fn(),
		onCreateTag,
	});

	await userEvent.fill(screen.getByPlaceholder('New tag…'), '   ');
	await userEvent.keyboard('{Enter}');

	expect(onCreateTag).not.toHaveBeenCalled();
});

test('renders a Dialog on desktop viewports', async () => {
	await page.viewport(1280, 800);
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: [],
		selected: [],
		onToggle: vi.fn(),
		onCreateTag: vi.fn(),
	});

	await expect.element(screen.getByRole('dialog', { name: 'Assign tags' })).toBeVisible();
});

test('renders a Drawer on mobile viewports', async () => {
	await page.viewport(500, 800);
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: [],
		selected: [],
		onToggle: vi.fn(),
		onCreateTag: vi.fn(),
	});

	await expect.element(screen.getByRole('dialog', { name: 'Assign tags' })).toBeVisible();
	expect(document.querySelector('[data-vaul-drawer-direction]')).not.toBeNull();
});

test('a tag toggled off its last remaining entry vanishes from the chip list immediately', async () => {
	const screen = render(TagAssignmentDialog, {
		open: true,
		allTags: ['Boss'],
		selected: ['Boss'],
		onToggle: vi.fn(),
		onCreateTag: vi.fn(),
	});

	await expect.element(screen.getByRole('button', { name: 'Boss' })).toBeVisible();

	await screen.rerender({
		open: true,
		allTags: [],
		selected: [],
		onToggle: vi.fn(),
		onCreateTag: vi.fn(),
	});

	expect(screen.getByRole('button', { name: 'Boss' }).query()).toBeNull();
});
