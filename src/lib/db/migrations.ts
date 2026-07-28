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
import { COMBATANT_DEFAULTS } from '../stores/domain/constants';
import { createSettings } from '../stores/domain/factories';
import { genId as defaultGenId, type IdGen } from '../stores/domain/id';
import {
	type AppData,
	type Combat,
	type Combatant,
	type CombatantTemplate,
	type CombatSnapshot,
	DATA_VERSION,
	NONE,
	type Settings,
	UNROLLED,
} from './types';

/** Thrown when an import/DB file is from a NEWER data version than this build. */
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
/** A library row may predate the `tags` field (additive-only, no shape transform needed). */
export type RawCombatantTemplate = Partial<CombatantTemplate>;
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
 *  always-set `escalation: number` (escalation die is stored, not auto-derived). Only folds the
 *  legacy key when PRESENT — re-running this transform on already-v2 data (idempotency, ADR-013)
 *  must leave a live `escalation` untouched rather than zeroing it. */
function migrateCombatV2(raw: RawCombat): RawCombat {
	const { escalationOverride, ...rest } = raw as RawCombat & {
		escalationOverride?: number | 'none';
	};
	const escalation =
		'escalationOverride' in raw
			? escalationOverride === undefined || escalationOverride === 'none'
				? 0
				: clampEscalation(escalationOverride)
			: (rest.escalation ?? 0);
	return {
		...rest,
		escalation,
		combatants: rest.combatants?.map(migrateCombatantV2),
		undoStack: rest.undoStack?.map((entry) => ({
			...entry,
			snapshot: migrateSnapshotV2(entry.snapshot),
		})),
		redoStack: rest.redoStack?.map((entry) => ({
			...entry,
			snapshot: migrateSnapshotV2(entry.snapshot),
		})),
	};
}

/** Recurse the v2 transform into an undo/redo snapshot, but OMIT `undoStack`/`redoStack` — a
 *  `CombatSnapshot` has neither by definition (`db/types.ts`), so setting them (even to
 *  `undefined`) stamps phantom keys that don't belong on the type. */
function migrateSnapshotV2(raw: RawCombat): CombatSnapshot {
	const { undoStack: _undoStack, redoStack: _redoStack, ...snapshot } = migrateCombatV2(raw);
	return snapshot as CombatSnapshot;
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
 * BEFORE read-time defaulting; refuse a newer file (ADR-013). One runner, two callers.
 */
export function migrate(data: RawAppData): RawAppData {
	// A missing version (absent settings row, hand-edited import file) is the OLDEST shipped
	// shape, not already-current — defaulting to DATA_VERSION here would skip every transform.
	const fileVersion = data.dataVersion ?? 1;
	if (fileVersion > DATA_VERSION) throw new NewerDataVersionError(fileVersion);
	let migrated = data;
	for (let v = fileVersion + 1; v <= DATA_VERSION; v += 1) {
		const step = transforms[v];
		if (step) migrated = step(migrated);
	}
	return { ...migrated, dataVersion: DATA_VERSION };
}

function normalizeCombatant(raw: RawCombatant, genId: IdGen = defaultGenId): Combatant {
	return {
		id: raw.id ?? genId(),
		name: raw.name ?? '',
		type: raw.type ?? 'enemy',
		addOrder: raw.addOrder ?? 0,
		initiative: raw.initiative ?? UNROLLED,
		initiativeBonus: raw.initiativeBonus ?? COMBATANT_DEFAULTS.initiativeBonus,
		maxHp: raw.maxHp ?? COMBATANT_DEFAULTS.maxHp,
		currentHp: raw.currentHp ?? raw.maxHp ?? COMBATANT_DEFAULTS.maxHp,
		tempHp: raw.tempHp ?? 0,
		ac: raw.ac ?? COMBATANT_DEFAULTS.ac,
		pd: raw.pd ?? COMBATANT_DEFAULTS.pd,
		md: raw.md ?? COMBATANT_DEFAULTS.md,
		note: raw.note ?? '',
		conditions: raw.conditions ?? [],
		// `id` on `HpLogEntry` is additive (ADR-013) — entries logged before it existed get one
		// here so list keying (NumpadSheet history, `HealthBar`'s flash) has a stable identity.
		// Backfilled at read time and deliberately not written back: this is normalization, not a
		// versioned transform, so it does not trip `hydrate()`'s forward-migration write. A legacy
		// entry therefore draws a fresh id each boot, which is harmless — the ids are only ever
		// used for keying within one session, and nothing persists a reference to one. The next
		// real write to the combat, from any HP edit, stamps them permanently.
		hpLog: (raw.hpLog ?? []).map((e) => (e.id ? e : { ...e, id: genId() })),
		disabled: raw.disabled ?? false,
	};
}

export function normalizeCombat(raw: RawCombat, genId: IdGen = defaultGenId): Combat {
	const now = Date.now();
	return {
		id: raw.id ?? genId(),
		title: raw.title ?? '',
		description: raw.description ?? '',
		colorTag: raw.colorTag ?? 'neutral',
		listOrder: raw.listOrder ?? 0,
		state: raw.state ?? 'setup',
		combatants: (raw.combatants ?? []).map((c) => normalizeCombatant(c, genId)),
		round: raw.round ?? 1,
		escalation: raw.escalation ?? 0,
		activeCombatantId: raw.activeCombatantId ?? NONE,
		undoStack: raw.undoStack ?? [],
		redoStack: raw.redoStack ?? [],
		createdAt: raw.createdAt ?? now,
		updatedAt: raw.updatedAt ?? now,
	};
}

/**
 * Read-time defaulting for a library entry row (not wired into `migrate()`/`normalizeAppData` —
 * `libraryEntries` is outside `AppData`, per the export exclusion; called directly from the
 * persistence loader). `tags` defaults to `[]`, same additive style as `normalizeCombatant`.
 */
export function normalizeCombatantTemplate(
	raw: RawCombatantTemplate,
	genId: IdGen = defaultGenId,
): CombatantTemplate {
	const now = Date.now();
	return {
		id: raw.id ?? genId(),
		name: raw.name ?? '',
		type: raw.type ?? 'enemy',
		initiativeBonus: raw.initiativeBonus ?? COMBATANT_DEFAULTS.initiativeBonus,
		maxHp: raw.maxHp ?? COMBATANT_DEFAULTS.maxHp,
		ac: raw.ac ?? COMBATANT_DEFAULTS.ac,
		pd: raw.pd ?? COMBATANT_DEFAULTS.pd,
		md: raw.md ?? COMBATANT_DEFAULTS.md,
		note: raw.note ?? '',
		tags: raw.tags ?? [],
		createdAt: raw.createdAt ?? now,
		updatedAt: raw.updatedAt ?? now,
	};
}

/** Settings normalizer — exported so the store's `peekFirstLaunch()` (a partial, settings-only
 *  read before `hydrate()` has run) shares this exact defaulting instead of replicating it. */
export function normalizeSettings(raw: Partial<Settings> | undefined): Settings {
	// `createSettings` spreads `overrides` AFTER its own `dataVersion: DATA_VERSION` default, so a
	// stored `raw.dataVersion` from an older file would otherwise survive normalization untouched.
	return { ...createSettings(raw ?? {}), dataVersion: DATA_VERSION };
}

/**
 * Forward-migrate a loosely-typed parsed payload (import file or DB rows) through the
 * shape-incompatible transforms FIRST — while legacy field names are still present — THEN coerce
 * into a valid AppData with all additive fields defaulted. Shared by load + import (ADR-013).
 */
export function normalizeAppData(raw: RawAppData, genId: IdGen = defaultGenId): AppData {
	const migrated = migrate(raw);
	return {
		dataVersion: migrated.dataVersion ?? DATA_VERSION,
		settings: normalizeSettings(migrated.settings),
		combats: (migrated.combats ?? []).map((c) => normalizeCombat(c, genId)),
	};
}
