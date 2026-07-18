import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Combatant } from '$lib/db/types';
import CombatantRow from './CombatantRow.svelte';
import type { CombatController } from './controller';

// Component: CombatantRow compact <-> expanded toggle. Drives the row with a plain
// vi.fn() spy controller (per controller.ts's doc comment) instead of a real CombatStore/Dexie.

function fixtureCombatant(overrides: Partial<Combatant> = {}): Combatant {
	return {
		id: 'c1',
		name: 'Rulf',
		type: 'enemy',
		addOrder: 0,
		initiative: '-',
		initiativeBonus: 0,
		maxHp: 20,
		currentHp: 20,
		tempHp: 0,
		ac: 15,
		pd: 12,
		md: 10,
		note: '',
		conditions: [],
		hpLog: [],
		disabled: false,
		...overrides,
	};
}

function spyController(): CombatController {
	return {
		roll: vi.fn(),
		setInitiative: vi.fn(),
		damage: vi.fn(),
		restore: vi.fn(),
		setTempHp: vi.fn(),
		addCondition: vi.fn(),
		removeCondition: vi.fn(),
		edit: vi.fn(),
		duplicate: vi.fn(),
		toggleDisabled: vi.fn(),
		remove: vi.fn(),
		addCombatant: vi.fn(),
		start: vi.fn(),
		advance: vi.fn(),
		undo: vi.fn(),
		redo: vi.fn(),
		clear: vi.fn(),
		restart: vi.fn(),
		editRound: vi.fn(),
		setEscalation: vi.fn(),
	};
}

test('collapsed row hides the note/condition-picker triggers; expanding reveals them', async () => {
	const combatant = fixtureCombatant();
	const controller = spyController();
	const screen = render(CombatantRow, {
		combatant,
		controller,
		onOpenNumpad: vi.fn(),
		onEdit: vi.fn(),
	});

	await expect.element(screen.getByRole('button', { name: 'Expand Rulf' })).toBeVisible();
	await expect.element(screen.getByRole('button', { name: '+ Condition' })).not.toBeInTheDocument();
	await expect.element(screen.getByRole('button', { name: '+ Note' })).not.toBeInTheDocument();

	await screen.getByRole('button', { name: 'Expand Rulf' }).click();

	await expect.element(screen.getByRole('button', { name: 'Collapse Rulf' })).toBeVisible();
	await expect.element(screen.getByRole('button', { name: '+ Condition' })).toBeVisible();
	await expect.element(screen.getByRole('button', { name: '+ Note' })).toBeVisible();
	await expect.element(screen.getByPlaceholder('Add note')).not.toBeInTheDocument();
});

test('collapsing a still-empty note resets it back to the "+ Note" chip on next expand', async () => {
	const combatant = fixtureCombatant();
	const controller = spyController();
	const screen = render(CombatantRow, {
		combatant,
		controller,
		onOpenNumpad: vi.fn(),
		onEdit: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Expand Rulf' }).click();
	await screen.getByRole('button', { name: '+ Note' }).click();

	await expect.element(screen.getByPlaceholder('Add note')).toBeVisible();
	await expect.element(screen.getByRole('button', { name: '+ Note' })).not.toBeInTheDocument();

	// Collapse without having typed anything (combatant.note is still '').
	await screen.getByRole('button', { name: 'Collapse Rulf' }).click();
	await expect.element(screen.getByRole('button', { name: 'Expand Rulf' })).toBeVisible();

	// Next expand: back to the "+ Note" chip, not the open editor.
	await screen.getByRole('button', { name: 'Expand Rulf' }).click();
	await expect.element(screen.getByRole('button', { name: '+ Note' })).toBeVisible();
	await expect.element(screen.getByPlaceholder('Add note')).not.toBeInTheDocument();
});

test('a disabled combatant renders its card at reduced opacity', async () => {
	const combatant = fixtureCombatant({ disabled: true });
	const controller = spyController();
	const screen = render(CombatantRow, {
		combatant,
		controller,
		onOpenNumpad: vi.fn(),
		onEdit: vi.fn(),
	});

	const card = screen.container.querySelector('[data-slot="card"]') as HTMLElement;
	expect(card.className).toContain('opacity-50');
});

test('an enabled combatant renders its card without the disabled opacity class', async () => {
	const combatant = fixtureCombatant({ disabled: false });
	const controller = spyController();
	const screen = render(CombatantRow, {
		combatant,
		controller,
		onOpenNumpad: vi.fn(),
		onEdit: vi.fn(),
	});

	const card = screen.container.querySelector('[data-slot="card"]') as HTMLElement;
	expect(card.className).not.toContain('opacity-50');
});

test('the overflow menu shows "Disable" for an enabled combatant and toggles it', async () => {
	const combatant = fixtureCombatant({ disabled: false });
	const controller = spyController();
	const screen = render(CombatantRow, {
		combatant,
		controller,
		onOpenNumpad: vi.fn(),
		onEdit: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Actions for Rulf' }).click();
	await expect.element(screen.getByRole('menuitem', { name: 'Disable' })).toBeVisible();

	await screen.getByRole('menuitem', { name: 'Disable' }).click();
	expect(controller.toggleDisabled).toHaveBeenCalledWith('c1');
});

test('the overflow menu shows "Enable" for a disabled combatant and toggles it', async () => {
	const combatant = fixtureCombatant({ disabled: true });
	const controller = spyController();
	const screen = render(CombatantRow, {
		combatant,
		controller,
		onOpenNumpad: vi.fn(),
		onEdit: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Actions for Rulf' }).click();
	await expect.element(screen.getByRole('menuitem', { name: 'Enable' })).toBeVisible();

	await screen.getByRole('menuitem', { name: 'Enable' }).click();
	expect(controller.toggleDisabled).toHaveBeenCalledWith('c1');
});
