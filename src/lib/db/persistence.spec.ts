import { beforeEach, describe, expect, it } from 'vitest';
import { createCombat, createSettings } from '../stores/domain/factories';
import {
	clearCombats,
	loadAppData,
	type PersistenceDb,
	persistCombat,
	persistSettings,
	removeCombatRow,
	stripHistory,
} from './persistence';
import { type Combat, SETTINGS_ID, type Settings } from './types';

/** In-memory PersistenceDb fake (real IndexedDB round-trip is E2E — see specs/reference/acceptance-matrix.md). */
function fakeDb(): PersistenceDb {
	const combats = new Map<string, Combat>();
	const settings = new Map<string, Settings>();
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

describe('stripHistory (IMP-2 — export keeps hpLog, drops undo/redo)', () => {
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
