import { afterEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import { createCombatantTemplate } from '$lib/stores/domain/factories';
import LibraryEntryFormDialog from './LibraryEntryFormDialog.svelte';

// Component test (create adds at top / cap message via onCreateResult(null) keeps the dialog
// open, edit pre-fills and patches silently including tags, no initiative field).
afterEach(() => {
	cleanup();
});

test('create mode calls store.addTemplate with the form values and closes on success', async () => {
	const addTemplateFn = vi.fn(() =>
		createCombatantTemplate(
			{ name: 'Goblin' },
			() => 'new',
			() => 0,
		),
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
		tags: [],
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
		createCombatantTemplate(
			{ name: 'Enemy' },
			() => 'new',
			() => 0,
		),
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
	await expect.element(screen.getByLabelText(m['forms.field.name']())).toHaveValue('One too many');
});

test('edit mode pre-fills from the existing template', async () => {
	const entry = createCombatantTemplate(
		{
			name: 'Dragon',
			type: 'pc',
			maxHp: 40,
			ac: 20,
			pd: 18,
			md: 16,
			initiativeBonus: 5,
			note: 'Boss',
		},
		() => 'existing',
		() => 0,
	);
	const store = { addTemplate: vi.fn(), editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, {
		open: true,
		entry,
		store,
		onCreateResult: vi.fn(),
	});

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.library.edit.title']() }))
		.toBeVisible();
	await expect.element(screen.getByLabelText(m['forms.field.name']())).toHaveValue('Dragon');
	await expect
		.element(screen.getByRole('radio', { name: m['forms.type.pc']() }))
		.toHaveAttribute('aria-checked', 'true');
});

test('edit mode calls store.editTemplate silently (no onCreateResult) and closes on submit', async () => {
	const entry = createCombatantTemplate(
		{ name: 'Dragon' },
		() => 'existing',
		() => 0,
	);
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

test("edit mode renders a chip for each of the entry's tags", async () => {
	const entry = createCombatantTemplate(
		{ name: 'Dragon', tags: ['Boss', 'Undead'] },
		() => 'existing',
		() => 0,
	);
	const store = { addTemplate: vi.fn(), editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, {
		open: true,
		entry,
		store,
		onCreateResult: vi.fn(),
	});

	await expect.element(screen.getByText('Boss')).toBeVisible();
	await expect.element(screen.getByText('Undead')).toBeVisible();
});

test('"Edit tags" opens the tag-assignment dialog', async () => {
	const entry = createCombatantTemplate(
		{ name: 'Dragon', tags: ['Boss'] },
		() => 'existing',
		() => 0,
	);
	const store = { addTemplate: vi.fn(), editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, {
		open: true,
		entry,
		store,
		onCreateResult: vi.fn(),
	});

	await screen.getByRole('button', { name: m['library.tags.editTrigger']() }).click();

	await expect
		.element(screen.getByRole('dialog', { name: m['library.tags.assign.title']() }))
		.toBeVisible();
});

test('create-mode: a tag created via the Edit-tags dialog lands in the submitted payload', async () => {
	const addTemplateFn = vi.fn(() =>
		createCombatantTemplate(
			{ name: 'Goblin', tags: ['Undead'] },
			() => 'new',
			() => 0,
		),
	);
	const store = { addTemplate: addTemplateFn, editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, { open: true, store, onCreateResult: vi.fn() });

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'Goblin');
	await screen.getByRole('button', { name: m['library.tags.editTrigger']() }).click();
	await userEvent.fill(screen.getByPlaceholder(m['library.tags.newTag.placeholder']()), 'Undead');
	await userEvent.keyboard('{Enter}');
	// The pending tag is reflected as a chip on the form.
	await expect.element(screen.getByRole('button', { name: 'Remove tag Undead' })).toBeVisible();
	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	expect(addTemplateFn).toHaveBeenCalledWith(expect.objectContaining({ tags: ['Undead'] }));
});

test('nested tag dialog: Escape closes only the tag surface, focus returns to "Edit tags", form state intact', async () => {
	const entry = createCombatantTemplate(
		{ name: 'Dragon', tags: ['Boss'] },
		() => 'existing',
		() => 0,
	);
	const store = { addTemplate: vi.fn(), editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, {
		open: true,
		entry,
		store,
		onCreateResult: vi.fn(),
	});

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'Dragon, unsaved edit');

	const editTagsTrigger = screen.getByRole('button', { name: m['library.tags.editTrigger']() });
	await editTagsTrigger.click();
	await expect
		.element(screen.getByRole('dialog', { name: m['library.tags.assign.title']() }))
		.toBeVisible();

	await userEvent.keyboard('{Escape}');

	// Only the tag dialog closed — the form dialog (edit title) is still open.
	await expect
		.element(screen.getByRole('dialog', { name: m['library.tags.assign.title']() }))
		.not.toBeInTheDocument();
	await expect
		.element(screen.getByRole('dialog', { name: m['forms.library.edit.title']() }))
		.toBeVisible();

	// Focus returned to the "Edit tags" trigger.
	await expect.element(editTagsTrigger).toHaveFocus();

	// The underlying form state (the unsaved name edit) survived untouched.
	await expect
		.element(screen.getByLabelText(m['forms.field.name']()))
		.toHaveValue('Dragon, unsaved edit');
});

test('the submit button is not a descendant of the scroll container (footer stays pinned)', async () => {
	const store = { addTemplate: vi.fn(), editTemplate: vi.fn() };
	const screen = render(LibraryEntryFormDialog, { open: true, store, onCreateResult: vi.fn() });

	const submitButton = screen.getByRole('button', { name: m['forms.action.create']() }).element();
	const scrollContainer = submitButton.closest('.overflow-y-auto');

	expect(scrollContainer?.contains(submitButton)).not.toBe(true);
});
