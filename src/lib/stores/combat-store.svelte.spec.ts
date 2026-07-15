import { describe, expect, it } from 'vitest';
import type { PersistenceDb } from '../db/persistence';
import type { Combat, Settings } from '../db/types';
import { CombatStore } from './combat-store.svelte';

// Light integration smoke for the reactive seam (ADR-002): state + persist-on-mutation wiring.
// The transition math itself is pinned by the pure domain specs (see `specs/reference/acceptance-matrix.md`).
function fakeDb(): PersistenceDb & { _combats: Map<string, Combat> } {
	const combats = new Map<string, Combat>();
	const settings = new Map<string, Settings>();
	return {
		_combats: combats,
		combats: {
			toArray: async () => [...combats.values()],
			put: async (c) => combats.set(c.id, structuredClone(c)),
			bulkPut: async (cs) => {
				for (const c of cs) combats.set(c.id, structuredClone(c));
			},
			delete: async (id) => void combats.delete(id),
			clear: async () => combats.clear(),
		},
		settings: {
			get: async (id) => settings.get(id),
			put: async (s) => settings.set(s.id, structuredClone(s)),
		},
	};
}

describe('CombatStore (ADR-002 seam)', () => {
	it('hydrates, runs first-launch, and persists mutations', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);
		let n = 0;
		await store.hydrate(() => `gen${n++}`);

		expect(store.ready).toBe(true);
		expect(store.combats).toHaveLength(1); // first-launch auto-created one
		const combatId = store.combats[0].id;

		store.addCombatant(combatId, { name: 'Ogre', maxHp: 40 }, () => 'ogre');
		expect(store.getCombat(combatId)?.combatants).toHaveLength(1);

		store.dealDamage(combatId, 'ogre', 15);
		expect(store.getCombat(combatId)?.combatants[0].currentHp).toBe(25);

		// persisted to the (fake) DB
		await Promise.resolve();
		expect(db._combats.get(combatId)?.combatants[0].currentHp).toBe(25);
	});

	it('createCombat returns the new combat and enforces no-op on missing ids', () => {
		const store = new CombatStore(fakeDb());
		const created = store.createCombat({ title: 'Ad hoc' }, () => 'fresh');
		expect(created?.title).toBe('Ad hoc');
		expect(store.combats[0].id).toBe('fresh');
		// mutation against an unknown combat id is a safe no-op
		store.dealDamage('nope', 'x', 5);
		expect(store.combats).toHaveLength(1);
	});

	it('editCombat patches title/description/colorTag and persists (CLS-3)', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);
		const created = store.createCombat({ title: 'Original' }, () => 'fresh');
		const id = (created as Combat).id;

		store.editCombat(id, { title: 'Renamed', description: 'New desc', colorTag: 'blue' });

		const combat = store.getCombat(id);
		expect(combat?.title).toBe('Renamed');
		expect(combat?.description).toBe('New desc');
		expect(combat?.colorTag).toBe('blue');

		await Promise.resolve();
		expect(db._combats.get(id)?.title).toBe('Renamed');
	});

	it('editCombat is a safe no-op for an unknown id', () => {
		const store = new CombatStore(fakeDb());
		store.createCombat({ title: 'Ad hoc' }, () => 'fresh');
		store.editCombat('nope', { title: 'x' });
		expect(store.combats).toHaveLength(1);
		expect(store.combats[0].title).toBe('Ad hoc');
	});
});
