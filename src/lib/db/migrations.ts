/**
 * Schema versioning & migrations (ADR-013). Two callers share one set of per-step transforms:
 *  1. the Dexie `version(n).upgrade()` path (local DB) — wired in db/index.ts when a version bumps;
 *  2. the import path (M5) — older `dataVersion` files are migrated forward by the same steps.
 *
 * v1 ships only the identity transform. A real transform is added ONLY on a shape-incompatible
 * change (ADR-013) — v2 is the first (monster→enemy rename, escalationOverride→escalation);
 * additive, default-tolerant fields need no transform — `normalizeAppData` fills them at read
 * time, AFTER the shape transforms run (see `migrate`).
 */

import { clampEscalation } from '../stores/domain/clamp';
import { createSettings } from '../stores/domain/factories';
import {
	type AppData,
	type Combat,
	type Combatant,
	type CombatSnapshot,
	DATA_VERSION,
	type Settings,
} from './types';

/** Thrown when an import/DB file is from a NEWER data version than this build (Data §10). */
export class NewerDataVersionError extends Error {
	readonly fileVersion: number;
	constructor(fileVersion: number) {
		super(`Data version ${fileVersion} is newer than supported ${DATA_VERSION}; update the app.`);
		this.name = 'NewerDataVersionError';
		this.fileVersion = fileVersion;
	}
}

// ── read-time defaulting (additive changes need no transform — ADR-013) ──────

/** Loosely-typed inbound shapes (a parsed import file or older DB rows may be partial). */
export type RawCombatant = Partial<Combatant>;
export type RawCombat = Partial<Omit<Combat, 'combatants'>> & { combatants?: RawCombatant[] };
export interface RawAppData {
	dataVersion?: number;
	settings?: Partial<Settings>;
	combats?: RawCombat[];
}

/** A pure migration step that produces the RAW shape for its TARGET version (ADR-013). Runs
 *  BEFORE read-time defaulting, since a shape-incompatible change (renamed/retyped field) must
 *  see the legacy field name — defaulting would otherwise silently drop it. */
export type Transform = (data: RawAppData) => RawAppData;

/** A v1 combatant carried `type: 'monster'`; v2 renames it to `'enemy'`. */
function migrateCombatantV2(raw: RawCombatant): RawCombatant {
	return (raw as { type?: string }).type === 'monster' ? { ...raw, type: 'enemy' } : raw;
}

/** A v1 combat carried `escalationOverride: number | 'none'`; v2 replaces it with a plain,
 *  always-set `escalation: number` (Rules — escalation die is stored, not auto-derived). */
function migrateCombatV2(raw: RawCombat): RawCombat {
	const { escalationOverride, ...rest } = raw as RawCombat & {
		escalationOverride?: number | 'none';
	};
	const escalation =
		escalationOverride === undefined || escalationOverride === 'none'
			? 0
			: clampEscalation(escalationOverride);
	return {
		...rest,
		escalation,
		combatants: rest.combatants?.map(migrateCombatantV2),
		undoStack: rest.undoStack?.map((entry) => ({
			...entry,
			snapshot: migrateCombatV2(entry.snapshot) as CombatSnapshot,
		})),
		redoStack: rest.redoStack?.map((entry) => ({
			...entry,
			snapshot: migrateCombatV2(entry.snapshot) as CombatSnapshot,
		})),
	};
}

/**
 * Transforms keyed by the version they PRODUCE. v1 is the identity baseline. Future shape breaks
 * add `3: (d) => …`, applied in order by `migrate`.
 */
export const transforms: Record<number, Transform> = {
	1: (data) => data,
	2: (data) => ({ ...data, combats: data.combats?.map(migrateCombatV2) }),
};

/**
 * Forward-migrate older RAW data to the current `DATA_VERSION` through the chained transforms,
 * BEFORE read-time defaulting; refuse a newer file (Data §10 / ADR-013). One runner, two callers.
 */
export function migrate(data: RawAppData): RawAppData {
	const fileVersion = data.dataVersion ?? DATA_VERSION;
	if (fileVersion > DATA_VERSION) throw new NewerDataVersionError(fileVersion);
	let migrated = data;
	for (let v = fileVersion + 1; v <= DATA_VERSION; v += 1) {
		const step = transforms[v];
		if (step) migrated = step(migrated);
	}
	return { ...migrated, dataVersion: DATA_VERSION };
}

function normalizeCombatant(raw: RawCombatant): Combatant {
	return {
		id: raw.id ?? crypto.randomUUID(),
		name: raw.name ?? '',
		type: raw.type ?? 'enemy',
		addOrder: raw.addOrder ?? 0,
		initiative: raw.initiative ?? '-',
		initiativeBonus: raw.initiativeBonus ?? 0,
		maxHp: raw.maxHp ?? 1,
		currentHp: raw.currentHp ?? raw.maxHp ?? 1,
		tempHp: raw.tempHp ?? 0,
		ac: raw.ac ?? 10,
		pd: raw.pd ?? 10,
		md: raw.md ?? 10,
		note: raw.note ?? '',
		conditions: raw.conditions ?? [],
		hpLog: raw.hpLog ?? [],
	};
}

export function normalizeCombat(raw: RawCombat): Combat {
	const now = Date.now();
	return {
		id: raw.id ?? crypto.randomUUID(),
		title: raw.title ?? '',
		description: raw.description ?? '',
		colorTag: raw.colorTag ?? 'neutral',
		listOrder: raw.listOrder ?? 0,
		state: raw.state ?? 'setup',
		combatants: (raw.combatants ?? []).map(normalizeCombatant),
		round: raw.round ?? 1,
		escalation: raw.escalation ?? 0,
		activeCombatantId: raw.activeCombatantId ?? 'none',
		undoStack: raw.undoStack ?? [],
		redoStack: raw.redoStack ?? [],
		createdAt: raw.createdAt ?? now,
		updatedAt: raw.updatedAt ?? now,
	};
}

function normalizeSettings(raw: Partial<Settings> | undefined): Settings {
	return createSettings(raw ?? {});
}

/**
 * Forward-migrate a loosely-typed parsed payload (import file or DB rows) through the
 * shape-incompatible transforms FIRST — while legacy field names are still present — THEN coerce
 * into a valid AppData with all additive fields defaulted. Shared by load + import (ADR-013,
 * Data §10).
 */
export function normalizeAppData(raw: RawAppData): AppData {
	const migrated = migrate(raw);
	return {
		dataVersion: migrated.dataVersion ?? DATA_VERSION,
		settings: normalizeSettings(migrated.settings),
		combats: (migrated.combats ?? []).map(normalizeCombat),
	};
}
