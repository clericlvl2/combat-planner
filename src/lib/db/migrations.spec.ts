import { describe, expect, it } from 'vitest';
import { createCombat, createSettings } from '../stores/domain/factories';
import {
	migrate,
	NewerDataVersionError,
	normalizeAppData,
	normalizeCombat,
	normalizeCombatantTemplate,
	type RawAppData,
	transforms,
} from './migrations';
import { loadAppData, type PersistenceDb, persistCombats, persistSettings } from './persistence';
import { type AppData, type Combat, DATA_VERSION, type Settings } from './types';

/** A v1 payload — loosely typed since it predates the v2 field rename under test. */
function legacyPayload(data: Record<string, unknown>): RawAppData {
	return data as unknown as RawAppData;
}

/** Minimal in-memory `PersistenceDb` for the load/normalize/persist round trip below. */
function fakePersistenceDb(): PersistenceDb {
	const combats = new Map<string, Combat>();
	let settingsRow: Settings | undefined;
	return {
		combats: {
			toArray: async () => [...combats.values()],
			put: async (c) => {
				combats.set(c.id, c);
			},
			bulkPut: async (cs) => {
				for (const c of cs) combats.set(c.id, c);
			},
			delete: async (id) => {
				combats.delete(id);
			},
			clear: async () => combats.clear(),
		},
		settings: {
			get: async () => settingsRow,
			put: async (s) => {
				settingsRow = s;
			},
		},
		libraryEntries: {
			toArray: async () => [],
			put: async () => {},
			delete: async () => {},
		},
	};
}

function appData(over: Partial<AppData> = {}): AppData {
	return {
		dataVersion: DATA_VERSION,
		settings: createSettings(),
		combats: [createCombat({ title: 'Fight' }, 0, () => 'k')],
		...over,
	};
}

describe('migrate runner (ADR-013)', () => {
	it('passes a current-version file through unchanged', () => {
		const data = appData();
		const out = migrate(data);
		expect(out.dataVersion).toBe(DATA_VERSION);
		expect(out.combats).toEqual(data.combats);
	});

	it('migrates an OLDER file forward through the chained transforms (identity baseline)', () => {
		const old = appData({ dataVersion: 0 });
		const out = migrate(old);
		expect(out.dataVersion).toBe(DATA_VERSION);
		expect(out.combats?.[0]?.title).toBe('Fight'); // identity preserves data
	});

	it('refuses a NEWER file — "update the app"', () => {
		expect(() => migrate(appData({ dataVersion: DATA_VERSION + 1 }))).toThrow(
			NewerDataVersionError,
		);
	});

	it('every registered transform is a pure function', () => {
		const data = appData();
		for (const step of Object.values(transforms)) {
			expect(step(data)).toEqual(step(data));
		}
	});
});

describe('normalizeAppData — read-time defaulting (additive, no transform — ADR-013)', () => {
	it('fills missing additive fields with defaults', () => {
		const out = normalizeAppData({
			combats: [{ id: 'x', title: 'Loose', combatants: [{ id: 'm', name: 'Mob', maxHp: 12 }] }],
		});
		const combatant = out.combats[0].combatants[0];
		expect(combatant.hpLog).toEqual([]);
		expect(combatant.conditions).toEqual([]);
		expect(combatant.currentHp).toBe(12); // defaulted from maxHp
		expect(combatant.disabled).toBe(false); // legacy row lacks `disabled` — defaults false
		expect(out.combats[0].undoStack).toEqual([]);
		expect(out.dataVersion).toBe(DATA_VERSION);
	});

	it('normalizeCombat tolerates a bare partial', () => {
		const c = normalizeCombat({ id: 'z' });
		expect(c.state).toBe('setup');
		expect(c.combatants).toEqual([]);
		expect(c.escalation).toBe(0);
	});

	it('still refuses a newer dataVersion when normalizing', () => {
		expect(() => normalizeAppData({ dataVersion: DATA_VERSION + 1, combats: [] })).toThrow(
			NewerDataVersionError,
		);
	});
});

describe('v2 transform — monster→enemy, escalationOverride→escalation (ADR-013)', () => {
	it('renames a v1 combatant type and folds a numeric escalationOverride into escalation', () => {
		const out = normalizeAppData(
			legacyPayload({
				dataVersion: 1,
				combats: [
					{
						id: 'c',
						escalationOverride: 4,
						combatants: [{ id: 'm', name: 'Mob', type: 'monster', maxHp: 10 }],
					},
				],
			}),
		);
		expect(out.combats[0].escalation).toBe(4);
		expect(out.combats[0].combatants[0].type).toBe('enemy');
	});

	it('folds a "none" escalationOverride into escalation 0', () => {
		const out = normalizeAppData(
			legacyPayload({
				dataVersion: 1,
				combats: [{ id: 'c', escalationOverride: 'none' }],
			}),
		);
		expect(out.combats[0].escalation).toBe(0);
	});

	it('migrates combatant types nested inside undo/redo snapshots', () => {
		const out = normalizeAppData(
			legacyPayload({
				dataVersion: 1,
				combats: [
					{
						id: 'c',
						undoStack: [
							{
								action: 'addCombatant',
								snapshot: {
									id: 'c',
									combatants: [{ id: 'm', name: 'Mob', type: 'monster' }],
								},
							},
						],
					},
				],
			}),
		);
		const snapshot = out.combats[0].undoStack[0].snapshot;
		expect(snapshot.combatants[0].type).toBe('enemy');
		// A CombatSnapshot has neither key by definition (db/types.ts) — the transform must OMIT
		// them, not stamp them as `undefined`.
		expect('undoStack' in snapshot).toBe(false);
		expect('redoStack' in snapshot).toBe(false);
	});

	it('applying the v2 transform twice is idempotent and preserves a live escalation', () => {
		const raw = legacyPayload({
			dataVersion: 1,
			combats: [{ id: 'c', escalationOverride: 3, combatants: [] }],
		});
		const once = transforms[2](raw);
		const twice = transforms[2](once);
		expect(once.combats?.[0]?.escalation).toBe(3);
		// Re-running the transform on already-v2 data must not overwrite a live `escalation` with
		// 0 — the legacy `escalationOverride` key is gone by the second pass.
		expect(twice.combats?.[0]?.escalation).toBe(3);
		expect(twice).toEqual(once);
	});

	it('a payload with no dataVersion runs the v1→v2 chain rather than skipping it', () => {
		const out = normalizeAppData(
			legacyPayload({
				combats: [
					{
						id: 'c',
						escalationOverride: 5,
						combatants: [{ id: 'm', name: 'Mob', type: 'monster' }],
					},
				],
			}),
		);
		expect(out.combats[0].escalation).toBe(5);
		expect(out.combats[0].combatants[0].type).toBe('enemy');
	});
});

describe('load -> normalize -> persist -> load round trip (ADR-013)', () => {
	it('persists the migrated dataVersion so a second load/migrate is a no-op', async () => {
		const db = fakePersistenceDb();
		await db.settings.put({ ...createSettings(), dataVersion: 1 });
		await db.combats.put(
			legacyPayload({ id: 'c', escalationOverride: 3, combatants: [] }) as unknown as Combat,
		);

		const first = await loadAppData(db);
		expect(first.settings.dataVersion).toBe(DATA_VERSION);
		expect(first.combats[0].escalation).toBe(3);

		// Simulate what `hydrate()` now does after a forward migration: write the migrated shape
		// back so the raw stored `dataVersion` no longer lags.
		await persistSettings(db, first.settings);
		await persistCombats(db, first.combats);

		const second = await loadAppData(db);
		expect(second.settings.dataVersion).toBe(DATA_VERSION);
		expect(second.combats[0].escalation).toBe(3); // not wiped by re-running migrate()

		const remigrated = migrate(second);
		expect(remigrated.dataVersion).toBe(DATA_VERSION);
		expect(remigrated.combats?.[0]?.escalation).toBe(3);
	});
});

describe('normalizeCombatantTemplate — read-time defaulting for library rows (ADR-013)', () => {
	it('defaults tags to [] on a bare partial', () => {
		const template = normalizeCombatantTemplate({ id: 't' });
		expect(template.tags).toEqual([]);
		expect(template.type).toBe('enemy');
		expect(template.name).toBe('');
		// COMBATANT_DEFAULTS.maxHp (10) — was a stray `?? 1` that disagreed with ac/pd/md's `?? 10`
		// default from the very same constants object (Phase 6, ADR-013 additive defaulting).
		expect(template.maxHp).toBe(10);
	});

	it('defaults tags to [] on a fully-empty raw object', () => {
		const template = normalizeCombatantTemplate({});
		expect(template.tags).toEqual([]);
		expect(typeof template.id).toBe('string');
	});

	it('preserves an already-present tags array untouched', () => {
		const template = normalizeCombatantTemplate({ id: 't', tags: ['boss', 'Undead'] });
		expect(template.tags).toEqual(['boss', 'Undead']);
	});
});
