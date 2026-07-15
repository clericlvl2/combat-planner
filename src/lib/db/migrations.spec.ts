import { describe, expect, it } from 'vitest';
import { createCombat, createSettings } from '../stores/domain/factories';
import {
	migrate,
	NewerDataVersionError,
	normalizeAppData,
	normalizeCombat,
	type RawAppData,
	transforms,
} from './migrations';
import { type AppData, DATA_VERSION } from './types';

/** A v1 payload — loosely typed since it predates the v2 field rename under test. */
function legacyPayload(data: Record<string, unknown>): RawAppData {
	return data as unknown as RawAppData;
}

function appData(over: Partial<AppData> = {}): AppData {
	return {
		dataVersion: DATA_VERSION,
		settings: createSettings(),
		combats: [createCombat({ title: 'Fight' }, 0, () => 'k')],
		...over,
	};
}

describe('migrate runner (ADR-013, IMP-3)', () => {
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
		expect(out.combats[0].undoStack[0].snapshot.combatants[0].type).toBe('enemy');
	});
});
