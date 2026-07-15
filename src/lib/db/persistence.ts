/**
 * Dexie persistence operations (ADR-003) behind the store seam. The reactive store is the ONLY
 * caller; it passes the Dexie instance, so these functions take an injectable `PersistenceDb` and
 * unit tests can supply an in-memory fake (real IndexedDB round-trip is E2E — see
 * specs/reference/acceptance-matrix.md).
 *
 * Combats persist one row each (inline JSON for combatants/conditions/hpLog/undoStack — ADR-013);
 * settings is the singleton row. Hydrate-on-boot reads all rows + normalizes/migrates (migrations.ts).
 */

import { normalizeAppData } from './migrations';
import { type AppData, type Combat, SETTINGS_ID, type Settings } from './types';

/** The minimal surface this module needs from Dexie — keeps the seam mockable. */
export interface PersistenceDb {
	combats: {
		toArray(): Promise<Combat[]>;
		put(combat: Combat): Promise<unknown>;
		bulkPut(combats: Combat[]): Promise<unknown>;
		delete(id: string): Promise<void>;
		clear(): Promise<void>;
	};
	settings: {
		get(id: string): Promise<Settings | undefined>;
		put(settings: Settings): Promise<unknown>;
	};
}

/** Hydrate full AppData on boot: read all rows, normalize + forward-migrate (ADR-013, IMP-3). */
export async function loadAppData(db: PersistenceDb): Promise<AppData> {
	const [settings, combats] = await Promise.all([
		db.settings.get(SETTINGS_ID),
		db.combats.toArray(),
	]);
	return normalizeAppData({
		dataVersion: settings?.dataVersion,
		settings,
		combats: [...combats].sort((a, b) => a.listOrder - b.listOrder),
	});
}

/** Persist one combat row (called on every mutation — the single writer, ADR-002/003). */
export async function persistCombat(db: PersistenceDb, combat: Combat): Promise<void> {
	await db.combats.put(combat);
}

/** Persist many combat rows at once (e.g. a reorder touching every listOrder). */
export async function persistCombats(db: PersistenceDb, combats: Combat[]): Promise<void> {
	await db.combats.bulkPut(combats);
}

export async function persistSettings(db: PersistenceDb, settings: Settings): Promise<void> {
	await db.settings.put(settings);
}

export async function removeCombatRow(db: PersistenceDb, id: string): Promise<void> {
	await db.combats.delete(id);
}

export async function clearCombats(db: PersistenceDb): Promise<void> {
	await db.combats.clear();
}

/**
 * Strip the throwaway undo/redo history from a combat (IMP-2): export keeps the hpLog but NOT
 * the action-recovery stacks. Reused by the M5 export path; defined here beside the store seam.
 */
export function stripHistory(combat: Combat): Combat {
	return { ...combat, undoStack: [], redoStack: [] };
}
