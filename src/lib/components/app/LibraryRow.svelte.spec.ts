import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createCombatantTemplate } from '$lib/stores/domain/factories';
import LibraryRow from './LibraryRow.svelte';

// Row shows name + stat subtitle, no search highlight (that's a combats-list-only feature), and
// delete is confirm-gated through the reused ConfirmDialog.

function fixtureEntry() {
	return createCombatantTemplate({
		name: 'Goblin',
		type: 'enemy',
		maxHp: 7,
		ac: 15,
		pd: 10,
		md: 8,
	});
}

test('renders name and the HP/AC/PD/MD subtitle', async () => {
	const entry = fixtureEntry();
	const screen = render(LibraryRow, {
		entry,
		onEdit: vi.fn(),
		onDelete: vi.fn(),
		onToggleTag: vi.fn(),
	});

	await expect.element(screen.getByText('Goblin')).toBeVisible();
	await expect.element(screen.getByText('HP 7 · AC 15 · PD 10 · MD 8')).toBeVisible();
});

test('root row element carries role="listitem" for the parent role="list"', async () => {
	const entry = fixtureEntry();
	const screen = render(LibraryRow, {
		entry,
		onEdit: vi.fn(),
		onDelete: vi.fn(),
		onToggleTag: vi.fn(),
	});

	await expect.element(screen.getByRole('listitem')).toBeVisible();
});

test('does not wrap the name in a <mark> highlight', async () => {
	const entry = fixtureEntry();
	const screen = render(LibraryRow, {
		entry,
		onEdit: vi.fn(),
		onDelete: vi.fn(),
		onToggleTag: vi.fn(),
	});

	await expect.element(screen.getByText('Goblin')).toBeVisible();
	expect(document.body.querySelector('mark')).toBeNull();
});

test('Edit menu item calls onEdit with the entry id', async () => {
	const entry = fixtureEntry();
	const onEdit = vi.fn();
	const screen = render(LibraryRow, { entry, onEdit, onDelete: vi.fn(), onToggleTag: vi.fn() });

	await screen.getByRole('button', { name: `Actions for ${entry.name}` }).click();
	await screen.getByRole('menuitem', { name: 'Edit' }).click();

	expect(onEdit).toHaveBeenCalledExactlyOnceWith(entry.id);
});

test('Delete menu item opens a confirm dialog; onDelete only fires after confirming', async () => {
	const entry = fixtureEntry();
	const onDelete = vi.fn();
	const screen = render(LibraryRow, { entry, onEdit: vi.fn(), onDelete, onToggleTag: vi.fn() });

	await screen.getByRole('button', { name: `Actions for ${entry.name}` }).click();
	await screen.getByRole('menuitem', { name: 'Delete' }).click();

	await expect
		.element(screen.getByRole('alertdialog', { name: 'Delete this template?' }))
		.toBeVisible();
	expect(onDelete).not.toHaveBeenCalled();

	await screen.getByRole('button', { name: 'Delete' }).click();

	expect(onDelete).toHaveBeenCalledExactlyOnceWith(entry.id);
});

test('cancelling the confirm dialog does not call onDelete', async () => {
	const entry = fixtureEntry();
	const onDelete = vi.fn();
	const screen = render(LibraryRow, { entry, onEdit: vi.fn(), onDelete, onToggleTag: vi.fn() });

	await screen.getByRole('button', { name: `Actions for ${entry.name}` }).click();
	await screen.getByRole('menuitem', { name: 'Delete' }).click();
	await screen.getByRole('button', { name: 'Cancel' }).click();

	expect(onDelete).not.toHaveBeenCalled();
});

test("renders a chip for each of the entry's tags", async () => {
	const entry = createCombatantTemplate({ name: 'Goblin', tags: ['Undead', 'Boss'] });
	const screen = render(LibraryRow, {
		entry,
		onEdit: vi.fn(),
		onDelete: vi.fn(),
		onToggleTag: vi.fn(),
	});

	await expect.element(screen.getByText('Undead')).toBeVisible();
	await expect.element(screen.getByText('Boss')).toBeVisible();
});

test('the "+Tags" trigger opens the tag-assignment dialog scoped to this entry', async () => {
	const entry = createCombatantTemplate({ name: 'Goblin', tags: ['Undead'] });
	const screen = render(LibraryRow, {
		entry,
		allTags: ['Undead', 'Boss'],
		onEdit: vi.fn(),
		onDelete: vi.fn(),
		onToggleTag: vi.fn(),
	});

	await screen.getByRole('button', { name: `Add tags to ${entry.name}` }).click();

	await expect.element(screen.getByRole('dialog', { name: 'Assign tags' })).toBeVisible();
	await expect.element(screen.getByRole('button', { name: 'Boss' })).toBeVisible();
});

test("keyboard-activating a tag chip's ✕ calls onToggleTag with that tag name", async () => {
	const entry = createCombatantTemplate({ name: 'Goblin', tags: ['Undead'] });
	const onToggleTag = vi.fn();
	const screen = render(LibraryRow, { entry, onEdit: vi.fn(), onDelete: vi.fn(), onToggleTag });

	const closeButton = screen.getByRole('button', { name: 'Remove tag Undead' }).element();
	closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

	expect(onToggleTag).toHaveBeenCalledExactlyOnceWith('Undead');
});
