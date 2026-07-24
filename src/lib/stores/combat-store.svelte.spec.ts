import { describe, expect, it } from 'vitest';
import type { PersistenceDb } from '../db/persistence';
import { MAX_LIBRARY_ENTRIES } from '../db/types';
import type { Combat, CombatantTemplate, Settings } from '../db/types';
import { CombatStore } from './combat-store.svelte';
import { createCombatantTemplate } from './domain/factories';

// Light integration smoke for the reactive seam (ADR-002): state + persist-on-mutation wiring.
// The transition math itself is pinned by the pure domain tests (transitions.spec.ts, etc).
function fakeDb(): PersistenceDb & {
	_combats: Map<string, Combat>;
	_libraryEntries: Map<string, CombatantTemplate>;
} {
	const combats = new Map<string, Combat>();
	const settings = new Map<string, Settings>();
	const libraryEntries = new Map<string, CombatantTemplate>();
	return {
		_combats: combats,
		_libraryEntries: libraryEntries,
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
		libraryEntries: {
			toArray: async () => [...libraryEntries.values()],
			put: async (e) => libraryEntries.set(e.id, structuredClone(e)),
			delete: async (id) => void libraryEntries.delete(id),
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

	it('editCombat patches title/description/colorTag and persists', async () => {
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

describe('CombatStore library delegation (ADR-002 seam) — thin methods only', () => {
	it('hydrate loads library entries alongside combats', async () => {
		const db = fakeDb();
		await db.libraryEntries.put(createCombatantTemplate({ name: 'Goblin' }, () => 'g1'));
		const store = new CombatStore(db);
		await store.hydrate(() => 'gen');
		expect(store.libraryEntries.map((t) => t.name)).toEqual(['Goblin']);
	});

	it('addTemplate updates state and persists the new row', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);
		const created = store.addTemplate({ name: 'Orc' }, () => 'o1');
		expect(created?.name).toBe('Orc');
		expect(store.libraryEntries).toHaveLength(1);
		await Promise.resolve();
		expect(db._libraryEntries.get('o1')?.name).toBe('Orc');
	});

	it('addTemplate surfaces null when the 1000-entry cap is reached', () => {
		const store = new CombatStore(fakeDb());
		for (let i = 0; i < MAX_LIBRARY_ENTRIES; i++) {
			store.addTemplate({ name: `t${i}` }, () => `t${i}`);
		}
		const overflow = store.addTemplate({ name: 'Overflow' }, () => 'overflow');
		expect(overflow).toBeNull();
		expect(store.libraryEntries).toHaveLength(MAX_LIBRARY_ENTRIES);
	});

	it('editTemplate patches state and persists the row', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);
		const created = store.addTemplate({ name: 'Orc' }, () => 'o1');
		store.editTemplate((created as CombatantTemplate).id, { name: 'Orc Renamed' });
		expect(store.libraryEntries[0].name).toBe('Orc Renamed');
		await Promise.resolve();
		expect(db._libraryEntries.get('o1')?.name).toBe('Orc Renamed');
	});

	it('removeTemplate deletes from state and the row', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);
		const created = store.addTemplate({ name: 'Orc' }, () => 'o1');
		store.removeTemplate((created as CombatantTemplate).id);
		expect(store.libraryEntries).toHaveLength(0);
		await Promise.resolve();
		expect(db._libraryEntries.has('o1')).toBe(false);
	});

	it('createTemplateFromCombatant maps a live combatant into a new untagged template', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);
		await store.hydrate(() => 'gen');
		const combatId = store.combats[0].id;
		store.addCombatant(combatId, { name: 'Ogre', maxHp: 40 }, () => 'ogre');

		const created = store.createTemplateFromCombatant(combatId, 'ogre');
		expect(created?.name).toBe('Ogre');
		expect(created?.maxHp).toBe(40);
		expect(created?.tags).toEqual([]);
		expect(store.libraryEntries).toHaveLength(1);
	});

	it('createTemplateFromCombatant returns null for an unknown combat/combatant id', () => {
		const store = new CombatStore(fakeDb());
		expect(store.createTemplateFromCombatant('nope', 'nope')).toBeNull();
	});

	it('toggleTemplateTag adds/removes and persists the affected row', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);
		const created = store.addTemplate({ name: 'Orc' }, () => 'o1');
		const id = (created as CombatantTemplate).id;

		store.toggleTemplateTag(id, 'Undead');
		expect(store.libraryEntries[0].tags).toEqual(['Undead']);
		await Promise.resolve();
		expect(db._libraryEntries.get('o1')?.tags).toEqual(['Undead']);

		store.toggleTemplateTag(id, 'undead');
		expect(store.libraryEntries[0].tags).toEqual([]);
	});
});
