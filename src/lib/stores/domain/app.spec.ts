import { describe, expect, it } from 'vitest';
import type { Combat } from '../../db/types';
import { createCombatInList, deleteCombat, editCombat, firstLaunch, reorderCombats } from './app';
import { createCombat, createSettings } from './factories';

let seq = 0;
const id = () => `k${seq++}`;

describe('createCombatInList', () => {
	it('inserts at the TOP with the lowest listOrder', () => {
		const existing = createCombat({}, 0, () => 'a');
		const { combats, created } = createCombatInList([existing], { title: 'New' }, id);
		expect(created).not.toBeNull();
		expect(combats[0]).toBe(created);
		expect((created as Combat).listOrder).toBeLessThan(existing.listOrder);
	});

	it('blocks creation past the 100-combat cap', () => {
		const full = Array.from({ length: 100 }, (_, i) => createCombat({}, i, () => `c${i}`));
		const { combats, created } = createCombatInList(full, {}, id);
		expect(created).toBeNull();
		expect(combats).toBe(full);
	});
});

describe('deleteCombat / reorderCombats', () => {
	it('removes by id', () => {
		const a = createCombat({}, 0, () => 'a');
		const b = createCombat({}, 1, () => 'b');
		expect(deleteCombat([a, b], 'a')).toEqual([b]);
	});

	it('reassigns listOrder from a dragged id order', () => {
		const a = createCombat({}, 5, () => 'a');
		const b = createCombat({}, 9, () => 'b');
		const out = reorderCombats([a, b], ['b', 'a']);
		expect(out.find((c) => c.id === 'b')?.listOrder).toBe(0);
		expect(out.find((c) => c.id === 'a')?.listOrder).toBe(1);
	});
});

describe('editCombat', () => {
	it('patches title/description/colorTag and bumps updatedAt, leaving roster/state untouched', () => {
		const original = createCombat({ title: 'Old', description: 'Old desc' }, 0, () => 'a');
		original.combatants = [{ id: 'x' } as never];
		original.state = 'active';
		const before = { ...original };
		const out = editCombat([original], 'a', {
			title: '  New Title  ',
			description: '  New desc  ',
			colorTag: 'red',
		});
		const edited = out.find((c) => c.id === 'a');
		expect(edited?.title).toBe('New Title');
		expect(edited?.description).toBe('New desc');
		expect(edited?.colorTag).toBe('red');
		expect(edited?.combatants).toBe(before.combatants);
		expect(edited?.state).toBe(before.state);
		expect(edited?.updatedAt).toBeGreaterThanOrEqual(before.updatedAt);
	});

	it('patches a subset, leaving unpatched fields untouched', () => {
		const original = createCombat({ title: 'Keep', description: 'Keep desc' }, 0, () => 'a');
		const out = editCombat([original], 'a', { colorTag: 'blue' });
		const edited = out.find((c) => c.id === 'a');
		expect(edited?.title).toBe('Keep');
		expect(edited?.description).toBe('Keep desc');
		expect(edited?.colorTag).toBe('blue');
	});

	it('is a no-op for an unknown id', () => {
		const combats = [createCombat({}, 0, () => 'a')];
		const out = editCombat(combats, 'missing', { title: 'x' });
		expect(out).toBe(combats);
	});
});

describe('firstLaunch', () => {
	it('firstLaunch auto-creates one empty combat and sets the flag, once', () => {
		const fresh = createSettings();
		const run = firstLaunch([], fresh, id);
		expect(run.opened).not.toBeNull();
		expect(run.combats).toHaveLength(1);
		expect(run.settings.firstLaunchDone).toBe(true);
		// already done → no-op
		const again = firstLaunch(run.combats, run.settings, id);
		expect(again.opened).toBeNull();
		expect(again.combats).toHaveLength(1);
	});
});
