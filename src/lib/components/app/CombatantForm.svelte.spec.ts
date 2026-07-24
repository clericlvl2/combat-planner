import { afterEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import type { CombatantTemplate } from '$lib/db/types';
import { m } from '$lib/i18n';
import CombatantForm from './CombatantForm.svelte';

function fixtureTemplate(overrides: Partial<CombatantTemplate> = {}): CombatantTemplate {
	return {
		id: 't1',
		name: 'Ogre',
		type: 'enemy',
		initiativeBonus: 2,
		maxHp: 40,
		ac: 15,
		pd: 12,
		md: 10,
		note: 'Big and mean',
		tags: [],
		createdAt: 1,
		updatedAt: 1,
		...overrides,
	};
}

// Component test (add-mode defaults, name-required validation, NumberField clamp,
// onSubmit shape). Add mode only — edit-mode prefill isn't part of this.
afterEach(() => {
	cleanup();
});

test('add mode renders real pre-filled defaults: empty name (placeholder shown), enemy type preselected, numeric fields pre-filled', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combatant.add.title']() }))
		.toBeVisible();
	const nameInput = screen.getByLabelText(m['forms.field.name']());
	await expect.element(nameInput).toHaveValue('');
	await expect
		.element(nameInput)
		.toHaveAttribute('placeholder', m['forms.field.name.placeholder.enemy']());
	await expect
		.element(screen.getByRole('radio', { name: m['forms.type.enemy']() }))
		.toHaveAttribute('aria-checked', 'true');
	await expect.element(screen.getByLabelText(m['forms.field.maxHp']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.ac']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.pd']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.md']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.initBonus']())).toHaveValue('0');
	await expect.element(screen.getByLabelText(m['forms.field.note']())).toHaveValue('');
});

test('empty name does not block submit: type placeholder becomes the stored name', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await screen.getByRole('button', { name: m['forms.action.add']() }).click();

	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit).toHaveBeenCalledWith(
		expect.objectContaining({ name: m['forms.field.name.placeholder.enemy']() }),
	);
});

test('numeric fields clamp to their NumberField min/max on commit', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	const maxHpInput = screen.getByLabelText(m['forms.field.maxHp']());
	// Below RANGES.maxHp.min (1) but within the field's digit cap, so it isn't truncated pre-commit.
	await userEvent.fill(maxHpInput, '0');
	// Fire the commit handler directly (a single 'change') so the clamp/aria-invalid assertion below
	// observes the initial over-range commit, not a later no-op re-commit of the already-clamped
	// value that a subsequent native blur would otherwise trigger.
	maxHpInput.element().dispatchEvent(new Event('change', { bubbles: true }));

	await expect.element(maxHpInput).toHaveValue('1');
	await expect.element(maxHpInput).toHaveAttribute('aria-invalid', 'true');
	expect(onSubmit).not.toHaveBeenCalled();
});

test('onSubmit fires with the expected normalized shape', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'Ogre');
	await userEvent.fill(screen.getByLabelText(m['forms.field.maxHp']()), '40');
	await screen.getByRole('button', { name: m['forms.action.add']() }).click();

	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit).toHaveBeenCalledWith({
		name: 'Ogre',
		type: 'enemy',
		initiativeBonus: 0,
		maxHp: 40,
		ac: 10,
		pd: 10,
		md: 10,
		note: '',
		initiative: null,
	});
});

// Add-from-library tab (Phase 6): hidden by default, hidden in edit mode, empty/populated
// picker states, prefill on pick, plain-payload submit, and reset-on-tab-switch.

test('the "New"/"From library" tab is hidden when templates is not passed (add mode)', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await expect
		.element(screen.getByRole('radio', { name: m['library.picker.tab.new']() }))
		.not.toBeInTheDocument();
	await expect
		.element(screen.getByRole('radio', { name: m['library.picker.tab.library']() }))
		.not.toBeInTheDocument();
});

test('the "New"/"From library" tab is hidden in edit mode even when templates is passed', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, {
		mode: 'edit',
		open: true,
		onSubmit,
		templates: [fixtureTemplate()],
	});

	await expect
		.element(screen.getByRole('radio', { name: m['library.picker.tab.new']() }))
		.not.toBeInTheDocument();
});

test('an empty library shows the empty state, and "Open library" calls onOpenLibrary', async () => {
	const onSubmit = vi.fn();
	const onOpenLibrary = vi.fn();
	const screen = render(CombatantForm, {
		mode: 'add',
		open: true,
		onSubmit,
		templates: [],
		onOpenLibrary,
	});

	await screen.getByRole('radio', { name: m['library.picker.tab.library']() }).click();

	await expect.element(screen.getByText(m['library.picker.empty.title']())).toBeVisible();
	await screen.getByRole('button', { name: m['library.picker.empty.openLibrary']() }).click();
	expect(onOpenLibrary).toHaveBeenCalledTimes(1);
});

test('Add is disabled while picking from a non-empty library, until a template is picked', async () => {
	const onSubmit = vi.fn();
	const template = fixtureTemplate();
	const screen = render(CombatantForm, {
		mode: 'add',
		open: true,
		onSubmit,
		templates: [template],
	});

	await screen.getByRole('radio', { name: m['library.picker.tab.library']() }).click();

	const addButton = screen.getByRole('button', { name: m['forms.action.add']() });
	await expect.element(addButton).toBeDisabled();

	await screen.getByRole('button', { name: /Ogre/ }).click();
	await expect.element(addButton).not.toBeDisabled();
});

test('picking a template prefills the field form', async () => {
	const onSubmit = vi.fn();
	const template = fixtureTemplate();
	const screen = render(CombatantForm, {
		mode: 'add',
		open: true,
		onSubmit,
		templates: [template],
	});

	await screen.getByRole('radio', { name: m['library.picker.tab.library']() }).click();
	await screen.getByRole('button', { name: /Ogre/ }).click();

	await expect.element(screen.getByText(m['library.picker.from']({ name: 'Ogre' }))).toBeVisible();
	await expect.element(screen.getByLabelText(m['forms.field.name']())).toHaveValue('Ogre');
	await expect.element(screen.getByLabelText(m['forms.field.maxHp']())).toHaveValue('40');
	await expect.element(screen.getByLabelText(m['forms.field.ac']())).toHaveValue('15');
	await expect.element(screen.getByLabelText(m['forms.field.pd']())).toHaveValue('12');
	await expect.element(screen.getByLabelText(m['forms.field.md']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.initBonus']())).toHaveValue('2');
	await expect.element(screen.getByLabelText(m['forms.field.note']())).toHaveValue('Big and mean');
});

test('submit after picking still emits a plain CombatantFormValues payload (no template id/tags leak)', async () => {
	const onSubmit = vi.fn();
	const template = fixtureTemplate({ tags: ['brute'] });
	const screen = render(CombatantForm, {
		mode: 'add',
		open: true,
		onSubmit,
		templates: [template],
	});

	await screen.getByRole('radio', { name: m['library.picker.tab.library']() }).click();
	await screen.getByRole('button', { name: /Ogre/ }).click();
	await screen.getByRole('button', { name: m['forms.action.add']() }).click();

	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit).toHaveBeenCalledWith({
		name: 'Ogre',
		type: 'enemy',
		initiativeBonus: 2,
		maxHp: 40,
		ac: 15,
		pd: 12,
		md: 10,
		note: 'Big and mean',
		initiative: null,
	});
});

test('switching the tab back to "New" clears the pick and resets the fields', async () => {
	const onSubmit = vi.fn();
	const template = fixtureTemplate();
	const screen = render(CombatantForm, {
		mode: 'add',
		open: true,
		onSubmit,
		templates: [template],
	});

	await screen.getByRole('radio', { name: m['library.picker.tab.library']() }).click();
	await screen.getByRole('button', { name: /Ogre/ }).click();
	await expect.element(screen.getByLabelText(m['forms.field.name']())).toHaveValue('Ogre');

	await screen.getByRole('radio', { name: m['library.picker.tab.new']() }).click();

	await expect.element(screen.getByLabelText(m['forms.field.name']())).toHaveValue('');
	await expect.element(screen.getByLabelText(m['forms.field.maxHp']())).toHaveValue('10');
});
