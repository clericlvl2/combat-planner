import { afterEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import { createCombatantTemplate } from '$lib/stores/domain/factories';
import LibraryEntryFormDialog from './LibraryEntryFormDialog.svelte';

// Component test (create adds at top / cap message via onCreateResult(null) keeps the dialog
// open, edit pre-fills and patches silently, no initiative/tags field in this phase).
afterEach(() => {
	cleanup();
});

test('create mode calls store.addTemplate with the form values and closes on success', async () => {
	const addTemplateFn = vi.fn(() =>
		createCombatantTemplate({ name: 'Goblin' }, () => 'new', () => 0),
	);
	const editTemplateFn = vi.fn();
	const store = { addTemplate: addTemplateFn, editTemplate: editTemplateFn };
	const onCreateResult = vi.fn();
	const screen = render(LibraryEntryFormDialog, { open: true, store, onCreateResult });

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.library.create.title']() }))
		.toBeVisible();

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'Goblin');
	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	expect(addTemplateFn).toHaveBeenCalledTimes(1);
	expect(addTemplateFn).toHaveBeenCalledWith({
		name: 'Goblin',
		type: 'enemy',
		initiativeBonus: 0,
		maxHp: 10,
		ac: 10,
		pd: 10,
		md: 10,
		note: '',
	});
	expect(editTemplateFn).not.toHaveBeenCalled();
	expect(onCreateResult).toHaveBeenCalledTimes(1);
	expect(onCreateResult).toHaveBeenCalledWith(expect.objectContaining({ name: 'Goblin' }));

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.library.create.title']() }))
		.not.toBeInTheDocument();
});

test('create mode with a blank name falls back to the type-specific placeholder as the real name', async () => {
	const addTemplateFn = vi.fn(() =>
		createCombatantTemplate({ name: 'Enemy' }, () => 'new', () => 0),
	);
	const store = { addTemplate: addTemplateFn, editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, {
		open: true,
		store,
		onCreateResult: vi.fn(),
	});

	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	expect(addTemplateFn).toHaveBeenCalledWith(
		expect.objectContaining({ name: m['forms.field.name.placeholder.enemy']() }),
	);
});

test('create mode blocks on the cap: dialog stays open, form preserved, onCreateResult(null) fires', async () => {
	const addTemplateFn = vi.fn(() => null);
	const store = { addTemplate: addTemplateFn, editTemplate: vi.fn() };
	const onCreateResult = vi.fn();
	const screen = render(LibraryEntryFormDialog, { open: true, store, onCreateResult });

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'One too many');
	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	expect(addTemplateFn).toHaveBeenCalledTimes(1);
	expect(onCreateResult).toHaveBeenCalledTimes(1);
	expect(onCreateResult).toHaveBeenCalledWith(null);

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.library.create.title']() }))
		.toBeVisible();
	await expect
		.element(screen.getByLabelText(m['forms.field.name']()))
		.toHaveValue('One too many');
});

test('edit mode pre-fills from the existing template', async () => {
	const entry = createCombatantTemplate(
		{ name: 'Dragon', type: 'pc', maxHp: 40, ac: 20, pd: 18, md: 16, initiativeBonus: 5, note: 'Boss' },
		() => 'existing',
		() => 0,
	);
	const store = { addTemplate: vi.fn(), editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, { open: true, entry, store, onCreateResult: vi.fn() });

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.library.edit.title']() }))
		.toBeVisible();
	await expect.element(screen.getByLabelText(m['forms.field.name']())).toHaveValue('Dragon');
	await expect
		.element(screen.getByRole('radio', { name: m['forms.type.pc']() }))
		.toHaveAttribute('aria-checked', 'true');
});

test('edit mode calls store.editTemplate silently (no onCreateResult) and closes on submit', async () => {
	const entry = createCombatantTemplate({ name: 'Dragon' }, () => 'existing', () => 0);
	const editTemplateFn = vi.fn();
	const addTemplateFn = vi.fn();
	const onCreateResult = vi.fn();
	const store = { addTemplate: addTemplateFn, editTemplate: editTemplateFn };
	const screen = render(LibraryEntryFormDialog, { open: true, entry, store, onCreateResult });

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'Dragon, part 2');
	await screen.getByRole('button', { name: m['forms.action.save']() }).click();

	expect(editTemplateFn).toHaveBeenCalledTimes(1);
	expect(editTemplateFn).toHaveBeenCalledWith(
		'existing',
		expect.objectContaining({ name: 'Dragon, part 2' }),
	);
	expect(addTemplateFn).not.toHaveBeenCalled();
	expect(onCreateResult).not.toHaveBeenCalled();

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.library.edit.title']() }))
		.not.toBeInTheDocument();
});
