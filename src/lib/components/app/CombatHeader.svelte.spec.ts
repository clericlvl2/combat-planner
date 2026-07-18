import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Combat, UndoEntry } from '$lib/db/types';
import { createCombat } from '$lib/stores/domain/factories';
import CombatHeader from './CombatHeader.svelte';
import type { CombatController } from './controller';

// RoundCounterControl's edit popover only calls controller.editRound (never
// setEscalation); undo/redo overflow items disable at their respective stack's empty end.

// controller.ts's own doc comment: drive it with a plain spy object, never a live CombatStore.
function makeController(): CombatController {
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

/** An Active combat with a caller-supplied undo/redo history (empty by default). */
function makeCombat(overrides: Partial<Combat> = {}): Combat {
	const base = createCombat({ title: 'Ogre Den' });
	const active: Combat = { ...base, state: 'active', round: 3, escalation: 2 };
	return { ...active, undoStack: [], redoStack: [], ...overrides };
}

/** A minimal-but-valid UndoEntry — content doesn't matter, only stack length does here. */
function makeUndoEntry(combat: Combat): UndoEntry {
	const { undoStack: _undoStack, redoStack: _redoStack, ...snapshot } = combat;
	return { action: 'editRound', snapshot };
}

describe('CombatHeader', () => {
	it('editing the round via RoundCounterControl fires controller.editRound only', async () => {
		const controller = makeController();
		const combat = makeCombat({ undoStack: [makeUndoEntry(makeCombat())] });
		const screen = render(CombatHeader, { combat, controller, onAdd: vi.fn(), onStart: vi.fn() });

		await userEvent.click(screen.getByRole('button', { name: 'Edit round' }));
		const roundInput = screen.getByRole('spinbutton', { name: 'Round 3' });
		await userEvent.fill(roundInput, '42');
		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		expect(controller.editRound).toHaveBeenCalledExactlyOnceWith(42);
		expect(controller.setEscalation).not.toHaveBeenCalled();
	});

	it('disables Redo (only) when the redo stack is empty and the undo stack is not', async () => {
		const controller = makeController();
		const combat = makeCombat({ undoStack: [makeUndoEntry(makeCombat())], redoStack: [] });
		const screen = render(CombatHeader, { combat, controller, onAdd: vi.fn(), onStart: vi.fn() });

		await userEvent.click(screen.getByRole('button', { name: 'Actions for Ogre Den' }));

		await expect.element(screen.getByRole('menuitem', { name: 'Undo' })).toBeEnabled();
		await expect.element(screen.getByRole('menuitem', { name: 'Redo' })).toBeDisabled();
	});

	it('disables Undo (only) when the undo stack is empty and the redo stack is not', async () => {
		const controller = makeController();
		const combat = makeCombat({ undoStack: [], redoStack: [makeUndoEntry(makeCombat())] });
		const screen = render(CombatHeader, { combat, controller, onAdd: vi.fn(), onStart: vi.fn() });

		await userEvent.click(screen.getByRole('button', { name: 'Actions for Ogre Den' }));

		await expect.element(screen.getByRole('menuitem', { name: 'Undo' })).toBeDisabled();
		await expect.element(screen.getByRole('menuitem', { name: 'Redo' })).toBeEnabled();
	});
});
