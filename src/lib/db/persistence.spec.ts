import { beforeEach, describe, expect, it } from 'vitest';
import { createCombat, createSettings } from '../stores/domain/factories';
import {
	clearCombats,
	loadAppData,
	loadLibraryEntries,
	type PersistenceDb,
	persistCombat,
	persistLibraryEntry,
	persistSettings,
	removeCombatRow,
	removeLibraryEntryRow,
	stripHistory,
} from './persistence';
import { type Combat, type CombatantTemplate, SETTINGS_ID, type Settings } from './types';

/** In-memory PersistenceDb fake (real IndexedDB round-trip is covered by e2e). */
function fakeDb(): PersistenceDb {
	const combats = new Map<string, Combat>();
	const settings = new Map<string, Settings>();
	const libraryEntries = new Map<string, CombatantTemplate>();
	return {
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

function template(over: Partial<CombatantTemplate> = {}): CombatantTemplate {
	return {
		id: 't1',
		name: 'Goblin',
		type: 'enemy',
		initiativeBonus: 0,
		maxHp: 10,
		ac: 10,
		pd: 10,
		md: 10,
		note: '',
		tags: [],
		createdAt: 0,
		updatedAt: 0,
		...over,
	};
}

let db: PersistenceDb;
beforeEach(() => {
	db = fakeDb();
});

describe('persistence round-trip (ADR-003)', () => {
	it('persisted settings + combats hydrate back equal, sorted by listOrder', async () => {
		const settings = createSettings({ language: 'ru', firstLaunchDone: true });
		const top = { ...createCombat({ title: 'Top' }, -1, () => 'top') };
		const bottom = { ...createCombat({ title: 'Bottom' }, 3, () => 'bot') };
		await persistSettings(db, settings);
		await persistCombat(db, bottom);
		await persistCombat(db, top);

		const loaded = await loadAppData(db);
		expect(loaded.settings).toEqual(settings);
		expect(loaded.combats.map((c) => c.title)).toEqual(['Top', 'Bottom']); // listOrder asc
	});

	it('preserves the undo/redo stacks in the DB (only export strips them)', async () => {
		const c: Combat = {
			...createCombat({}, 0, () => 'c'),
			undoStack: [{ action: 'damage', snapshot: { ...createCombat({}, 0, () => 's') } }],
		};
		await persistCombat(db, c);
		const loaded = await loadAppData(db);
		expect(loaded.combats[0].undoStack).toHaveLength(1);
	});

	it('an empty DB hydrates to defaults (fresh settings, no combats)', async () => {
		const loaded = await loadAppData(db);
		expect(loaded.combats).toEqual([]);
		expect(loaded.settings.id).toBe(SETTINGS_ID);
	});

	it('removeCombatRow + clearCombats delete rows', async () => {
		await persistCombat(
			db,
			createCombat({}, 0, () => 'a'),
		);
		await persistCombat(
			db,
			createCombat({}, 1, () => 'b'),
		);
		await removeCombatRow(db, 'a');
		expect((await loadAppData(db)).combats.map((c) => c.id)).toEqual(['b']);
		await clearCombats(db);
		expect((await loadAppData(db)).combats).toEqual([]);
	});
});

describe('library entries round-trip (ADR-003) — additive-only, outside AppData', () => {
	it('persisted entries round-trip through loadLibraryEntries', async () => {
		await persistLibraryEntry(db, template({ id: 'a', name: 'Goblin' }));
		await persistLibraryEntry(db, template({ id: 'b', name: 'Orc' }));

		const loaded = await loadLibraryEntries(db);
		expect(loaded.map((e) => e.name).sort()).toEqual(['Goblin', 'Orc']);
	});

	it('normalizes a partial/legacy row at read time (tags defaults to [])', async () => {
		await db.libraryEntries.put({ id: 'x' } as CombatantTemplate);
		const loaded = await loadLibraryEntries(db);
		expect(loaded[0].tags).toEqual([]);
		expect(loaded[0].type).toBe('enemy');
	});

	it('removeLibraryEntryRow deletes a row', async () => {
		await persistLibraryEntry(db, template({ id: 'a' }));
		await persistLibraryEntry(db, template({ id: 'b' }));
		await removeLibraryEntryRow(db, 'a');
		expect((await loadLibraryEntries(db)).map((e) => e.id)).toEqual(['b']);
	});

	it('an empty table hydrates to an empty array', async () => {
		expect(await loadLibraryEntries(db)).toEqual([]);
	});
});

describe('stripHistory (export keeps hpLog, drops undo/redo)', () => {
	it('clears the stacks but leaves everything else intact', () => {
		const c: Combat = {
			...createCombat({ title: 'Keep' }, 0, () => 'c'),
			undoStack: [{ action: 'start', snapshot: { ...createCombat({}, 0, () => 's') } }],
			redoStack: [{ action: 'start', snapshot: { ...createCombat({}, 0, () => 's2') } }],
		};
		const stripped = stripHistory(c);
		expect(stripped.undoStack).toEqual([]);
		expect(stripped.redoStack).toEqual([]);
		expect(stripped.title).toBe('Keep');
	});
});
