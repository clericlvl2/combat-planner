import Dexie, { type Table } from 'dexie';
import type { Combat, CombatantTemplate, Settings } from './types';

export * from './types';

/**
 * IndexedDB schema via Dexie (ADR-003). v1 ships two tables:
 *  - `combats`  — one row per combat (keyPath `id`, index `listOrder`).
 *  - `settings` — singleton (keyPath `id`, the fixed SETTINGS_ID row).
 * v2 adds a third, purely additive table:
 *  - `libraryEntries` — one row per combatant-library template (keyPath `id`). Not part of
 *    `AppData`/export (W-006's territory); no `.upgrade()` needed since nothing existing changes
 *    shape (ADR-013).
 *
 * Combatants / conditions / hpLog / undoStack ride inline as JSON on the combat
 * record (ADR-013), so Dexie only indexes the top-level keys above.
 *
 * This module is SCHEMA ONLY — no reads/writes. The store seam (ADR-002) is the
 * single writer; CRUD + transitions land in M1 (src/lib/stores).
 */
export class CombatPlannerDB extends Dexie {
	combats!: Table<Combat, string>;
	settings!: Table<Settings, string>;
	libraryEntries!: Table<CombatantTemplate, string>;

	constructor() {
		super('combat-planner');
		this.version(1).stores({
			combats: 'id, listOrder',
			settings: 'id',
		});
		this.version(2).stores({
			combats: 'id, listOrder',
			settings: 'id',
			libraryEntries: 'id',
		});
		// TODO M-phase (ADR-013): add `version(n).upgrade(tx => transform)` ONLY on a
		// shape-incompatible change. The same per-step transform is reused by the import
		// path (one transform, two callers). Bump DATA_VERSION + the Dexie version together.
	}
}

export const db = new CombatPlannerDB();
