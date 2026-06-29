/**
 * Conceptual data model as TypeScript types (Data Model §2–§5, §9).
 * Types + shapes only — no behavior. All transitions/derivations live in the
 * store seam (ADR-002, src/lib/stores), wired in M1.
 */

/** Bumped together with the Dexie DB version on a shape-incompatible change (ADR-013). */
export const DATA_VERSION = 1;

/** Hard caps (Rules §7). */
export const MAX_COMBATANTS = 30;
export const MAX_COMBATS = 100;

/** Bundled UI locales (ADR-005). English is the source language. */
export type Locale = 'en' | 'de' | 'es' | 'fr' | 'ja' | 'ru';

/** Visual-only combatant type — drives color + icon, nothing else (Rules §1). */
export type CombatantType = 'pc' | 'monster' | 'ally';
export const COMBATANT_TYPES = ['pc', 'monster', 'ally'] as const;

/** Combat lifecycle (Data Model §3). */
export type CombatState = 'setup' | 'active';

/** The 8 preset color-tag swatch keys (ADR-012). Stored as the key, never a hex. */
export type ColorTag =
	| 'neutral'
	| 'red'
	| 'orange'
	| 'amber'
	| 'green'
	| 'teal'
	| 'blue'
	| 'violet';
export const COLOR_TAGS = [
	'neutral',
	'red',
	'orange',
	'amber',
	'green',
	'teal',
	'blue',
	'violet',
] as const;

/** The fixed set of 12 conditions — membership only, no duration/stacks (Data Model §5). */
export type Condition =
	| 'charmed'
	| 'confused'
	| 'dazed'
	| 'fear'
	| 'helpless'
	| 'hindered'
	| 'shocked'
	| 'stuck'
	| 'stunned'
	| 'vulnerable'
	| 'weakened'
	| 'staggered';
export const CONDITIONS = [
	'charmed',
	'confused',
	'dazed',
	'fear',
	'helpless',
	'hindered',
	'shocked',
	'stuck',
	'stunned',
	'vulnerable',
	'weakened',
	'staggered',
] as const;

/** Theme preference (Data Model §2). */
export type Theme = 'system' | 'dark' | 'light';

/** Unrolled initiative sentinel (Data Model §4). */
export const UNROLLED = '-' as const;
export type Initiative = number | typeof UNROLLED;

/** "none" sentinels (Data Model §3). */
export const NONE = 'none' as const;

/** One read-only HP-change log line (Data Model §9). Captured at write time. */
export interface HpLogEntry {
	/** Maps to i18n numpad.history.action.* labels. */
	type: 'damage' | 'heal' | 'setTemp' | 'setMax';
	/** Signed change applied. */
	delta: number;
	/** Resulting current HP after the event. */
	currentHp: number;
	/** Resulting temp HP after the event. */
	tempHp: number;
	/** Resulting Max HP after the event. */
	maxHp: number;
	/** Live round when it happened; `null` => occurred in Setup (rendered "—"). */
	round: number | null;
}

/**
 * A bounded undo/redo history entry (Data Model §8). Shape is per-action
 * (prior value | roster snapshot | pre-Start snapshot | turn pointer + round +
 * escalation). Modeled concretely in M1 alongside the store seam.
 */
// TODO M1: replace with the discriminated union of reversible-action entries (Data Model §8).
export type UndoEntry = Record<string, unknown>;

/** A participant (Data Model §4). All types share the same fields. */
export interface Combatant {
	id: string;
	name: string;
	type: CombatantType;
	/** Original insertion index — tiebreaker + "-" ordering. */
	addOrder: number;
	initiative: Initiative;
	initiativeBonus: number;
	maxHp: number;
	currentHp: number;
	tempHp: number;
	ac: number;
	pd: number;
	md: number;
	note: string;
	conditions: Condition[];
	/** Read-only HP change history; inline on the combatant (ADR-003/013). */
	hpLog: HpLogEntry[];
}

/** One fight (Data Model §3). One Dexie row per combat. */
export interface Combat {
	id: string;
	title: string;
	description: string;
	colorTag: ColorTag;
	/** Manual position in the combats list; new combats inserted at top. Dexie index. */
	listOrder: number;
	state: CombatState;
	combatants: Combatant[];
	round: number;
	/** Manual escalation value, or "none" for auto-derivation. */
	escalationOverride: number | typeof NONE;
	/** Active combatant id, bound to identity, or "none" while Setup. */
	activeCombatantId: string | typeof NONE;
	/** Per-combat bounded history (≤10). Persisted; stripped on export (ADR-003). */
	undoStack: UndoEntry[];
	redoStack: UndoEntry[];
	createdAt: number;
	updatedAt: number;
}

/** Singleton settings record (Data Model §2). */
export interface Settings {
	/** Fixed primary key for the singleton row. */
	id: typeof SETTINGS_ID;
	language: Locale;
	theme: Theme;
	firstLaunchDone: boolean;
	installHintDismissed: boolean;
	/** Schema/version marker for safe import + future migrations (ADR-013). */
	dataVersion: number;
}

/** The one fixed key under which the singleton Settings row is stored. */
export const SETTINGS_ID = 'settings' as const;

/** Full export/import payload (Data Model §10). */
export interface AppData {
	dataVersion: number;
	settings: Settings;
	combats: Combat[];
}
