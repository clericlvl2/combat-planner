import { describe, expect, it } from 'vitest';
import type { Combat, Combatant } from '../../db/types';
import { createCombat, createCombatant } from './factories';
import { dealDamage } from './transitions';
import { canRedo, canUndo, redo, UNDO_LIMIT, undo } from './undo';

let seq = 0;
const id = () => `c${seq++}`;
function active(currentHp = 200): Combat {
	const c: Combatant = { ...createCombatant({ name: 'A', maxHp: 200 }, 0, id), id: 'a', currentHp };
	return { ...createCombat({}, 0, () => 'combat'), combatants: [c], state: 'active', round: 1 };
}

describe('undo/redo history (UND-6)', () => {
	it('is bounded at 10 — the 11th action drops the oldest', () => {
		let c = active();
		for (let i = 0; i < UNDO_LIMIT + 5; i += 1) c = dealDamage(c, 'a', 1);
		expect(c.undoStack).toHaveLength(UNDO_LIMIT);
	});

	it('a new action clears the redo branch (UND-6)', () => {
		let c = dealDamage(active(), 'a', 5);
		c = undo(c);
		expect(canRedo(c)).toBe(true);
		c = dealDamage(c, 'a', 3); // new action → redo invalidated
		expect(canRedo(c)).toBe(false);
	});

	it('undo/redo are no-ops at each end of the stack', () => {
		const c = active();
		expect(undo(c)).toBe(c); // empty undo stack
		expect(redo(c)).toBe(c); // empty redo stack
		expect(canUndo(c)).toBe(false);
	});

	it('walks the stack symmetrically', () => {
		const c0 = active(200);
		const c1 = dealDamage(c0, 'a', 10); // 190
		const c2 = dealDamage(c1, 'a', 20); // 170
		expect(c2.combatants[0].currentHp).toBe(170);
		const u1 = undo(c2);
		expect(u1.combatants[0].currentHp).toBe(190);
		const u2 = undo(u1);
		expect(u2.combatants[0].currentHp).toBe(200);
		const r1 = redo(u2);
		expect(r1.combatants[0].currentHp).toBe(190);
	});
});
