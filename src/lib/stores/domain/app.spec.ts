import { describe, expect, it } from 'vitest';
import type { Combat } from '../../db/types';
import { createCombatInList, deleteCombat, firstLaunch, reorderCombats, resetAll } from './app';
import { createCombat, createSettings } from './factories';

let seq = 0;
const id = () => `k${seq++}`;

describe('createCombatInList (Data §7, Rules §7)', () => {
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

describe('deleteCombat / reorderCombats (Data §7)', () => {
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

describe('resetAll / firstLaunch (Data §7)', () => {
	it('resetAll clears combats, keeps language/theme, re-arms first-launch', () => {
		const settings = createSettings({ language: 'de', theme: 'dark', firstLaunchDone: true });
		const { combats, settings: next } = resetAll(settings);
		expect(combats).toEqual([]);
		expect(next.language).toBe('de');
		expect(next.theme).toBe('dark');
		expect(next.firstLaunchDone).toBe(false);
	});

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
