import { describe, expect, it } from 'vitest';
import type { PersistenceDb } from '../db/persistence';
import type { Combat, CombatantTemplate, Settings } from '../db/types';
import { MAX_LIBRARY_ENTRIES } from '../db/types';
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

// Phase 4 (boot path): re-entrancy guard, failure containment, and the first-launch peek that
// must not duplicate `hydrate()`'s full load.
describe('CombatStore boot path (hydrate/hydrateError/peekFirstLaunch)', () => {
	it('hydrate called twice (concurrently) performs one Dexie load', async () => {
		const db = fakeDb();
		let toArrayCalls = 0;
		const originalToArray = db.combats.toArray.bind(db.combats);
		db.combats.toArray = async () => {
			toArrayCalls += 1;
			return originalToArray();
		};
		const store = new CombatStore(db);

		await Promise.all([store.hydrate(() => 'a'), store.hydrate(() => 'b')]);

		expect(toArrayCalls).toBe(1);
		expect(store.ready).toBe(true);
		expect(store.combats).toHaveLength(1);

		// A later call, once already ready, is also a no-op — not a second load.
		await store.hydrate(() => 'c');
		expect(toArrayCalls).toBe(1);
	});

	it('a failing loadAppData sets hydrateError instead of rejecting out of hydrate()', async () => {
		const db = fakeDb();
		const failure = new Error('Dexie unavailable');
		db.settings.get = async () => {
			throw failure;
		};
		const store = new CombatStore(db);

		await expect(store.hydrate()).resolves.toBeUndefined();

		expect(store.ready).toBe(false);
		expect(store.hydrateError).toBe(failure);
	});

	it('a retry after a failed hydrate can succeed once the underlying failure clears', async () => {
		const db = fakeDb();
		let shouldFail = true;
		const originalGet = db.settings.get.bind(db.settings);
		db.settings.get = async (id) => {
			if (shouldFail) throw new Error('Dexie unavailable');
			return originalGet(id);
		};
		const store = new CombatStore(db);

		await store.hydrate();
		expect(store.ready).toBe(false);
		expect(store.hydrateError).not.toBeNull();

		shouldFail = false;
		await store.hydrate();
		expect(store.ready).toBe(true);
		expect(store.hydrateError).toBeNull();
	});

	it('peekFirstLaunch answers from live state once ready, without a second full load', async () => {
		const db = fakeDb();
		let toArrayCalls = 0;
		const originalToArray = db.combats.toArray.bind(db.combats);
		db.combats.toArray = async () => {
			toArrayCalls += 1;
			return originalToArray();
		};
		const store = new CombatStore(db);
		await store.hydrate(() => 'gen');
		expect(toArrayCalls).toBe(1);

		const wasFirstLaunch = await store.peekFirstLaunch();

		expect(wasFirstLaunch).toBe(false); // hydrate() already ran first-launch
		expect(toArrayCalls).toBe(1); // no extra combats read
	});

	it('peekFirstLaunch reads only the settings row before hydrate has run', async () => {
		const db = fakeDb();
		let combatsRead = 0;
		let libraryRead = 0;
		db.combats.toArray = async () => {
			combatsRead += 1;
			return [];
		};
		db.libraryEntries.toArray = async () => {
			libraryRead += 1;
			return [];
		};
		const store = new CombatStore(db);

		const wasFirstLaunch = await store.peekFirstLaunch();

		expect(wasFirstLaunch).toBe(true); // no settings row yet -> firstLaunchDone defaults false
		expect(combatsRead).toBe(0);
		expect(libraryRead).toBe(0);
		expect(store.ready).toBe(false); // peeking must not itself hydrate
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

	it('addTemplate surfaces null when the 1000-entry cap is reached', async () => {
		// Seed the cap boundary through the real hydrate path instead of 1000 addTemplate
		// calls — each call snapshots the whole growing array (O(n²)), which times out
		// under full-suite load.
		const db = fakeDb();
		for (let i = 0; i < MAX_LIBRARY_ENTRIES - 1; i++) {
			await db.libraryEntries.put(createCombatantTemplate({ name: `t${i}` }, () => `t${i}`));
		}
		const store = new CombatStore(db);
		await store.hydrate(() => 'gen');
		expect(store.libraryEntries).toHaveLength(MAX_LIBRARY_ENTRIES - 1);

		const last = store.addTemplate({ name: 'Last' }, () => 'last');
		expect(last?.name).toBe('Last');

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

	// Regression: LibraryEntryFormDialog hands `fields.tags` straight through as a `$state`
	// proxy. Without a snapshot at the store seam the raw proxy reaches Dexie's structured
	// clone and throws DataCloneError (the fake db's structuredClone reproduces that here).
	it('addTemplate/editTemplate snapshot a $state tags array before persisting', async () => {
		const db = fakeDb();
		const store = new CombatStore(db);

		const addTags = $state(['Undead']);
		const created = store.addTemplate({ name: 'Orc', tags: addTags }, () => 'o1');
		expect(created?.name).toBe('Orc');
		await Promise.resolve();
		const persisted = db._libraryEntries.get('o1');
		expect(Array.isArray(persisted?.tags)).toBe(true);
		expect(persisted?.tags).toEqual(['Undead']);

		const editTags = $state(['Boss']);
		store.editTemplate('o1', { tags: editTags });
		await Promise.resolve();
		const editedPersisted = db._libraryEntries.get('o1');
		expect(Array.isArray(editedPersisted?.tags)).toBe(true);
		expect(editedPersisted?.tags).toEqual(['Boss']);
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
