/**
 * Entity factories — produce well-formed entities with their default values.
 * Pure; ids/timestamps injectable for deterministic tests.
 */
import {
	type ColorTag,
	type Combat,
	type Combatant,
	type CombatantType,
	DATA_VERSION,
	NONE,
	SETTINGS_ID,
	type Settings,
	UNROLLED,
} from '../../db/types';
import {
	clampAc,
	clampInitiative,
	clampInitiativeBonus,
	clampMaxHp,
	clampMd,
	clampNote,
	clampPd,
} from './clamp';
import { COMBATANT_DEFAULTS } from './constants';
import { genId as defaultGenId, type IdGen } from './id';

export interface CombatantInput {
	name: string;
	type?: CombatantType;
	initiativeBonus?: number;
	/** Mid-combat add only — DM hand-enters a known value; left blank, it auto-rolls. */
	initiative?: number;
	maxHp?: number;
	ac?: number;
	pd?: number;
	md?: number;
	note?: string;
}

/** New combatant: currentHp = maxHp, temp 0, init "-" (unless given), no conditions, empty hpLog. */
export function createCombatant(
	input: CombatantInput,
	addOrder: number,
	genId: IdGen = defaultGenId,
): Combatant {
	const maxHp = clampMaxHp(input.maxHp ?? COMBATANT_DEFAULTS.maxHp);
	return {
		id: genId(),
		name: input.name.trim(),
		type: input.type ?? 'enemy',
		addOrder,
		initiative: input.initiative !== undefined ? clampInitiative(input.initiative) : UNROLLED,
		initiativeBonus: clampInitiativeBonus(
			input.initiativeBonus ?? COMBATANT_DEFAULTS.initiativeBonus,
		),
		maxHp,
		currentHp: maxHp,
		tempHp: 0,
		ac: clampAc(input.ac ?? COMBATANT_DEFAULTS.ac),
		pd: clampPd(input.pd ?? COMBATANT_DEFAULTS.pd),
		md: clampMd(input.md ?? COMBATANT_DEFAULTS.md),
		note: clampNote(input.note ?? ''),
		conditions: [],
		hpLog: [],
	};
}

export interface CombatInput {
	title?: string;
	description?: string;
	colorTag?: ColorTag;
}

/** New combat: Setup, round 1 (hidden), no active turn, empty roster + history. */
export function createCombat(
	input: CombatInput = {},
	listOrder = 0,
	genId: IdGen = defaultGenId,
): Combat {
	const now = Date.now();
	return {
		id: genId(),
		title: input.title?.trim() ?? '',
		description: input.description?.trim() ?? '',
		colorTag: input.colorTag ?? 'neutral',
		listOrder,
		state: 'setup',
		combatants: [],
		round: 1,
		escalation: 0,
		activeCombatantId: NONE,
		undoStack: [],
		redoStack: [],
		createdAt: now,
		updatedAt: now,
	};
}

/** Singleton settings with default values (language defaulting is the boot layer's job). */
export function createSettings(overrides: Partial<Omit<Settings, 'id'>> = {}): Settings {
	return {
		id: SETTINGS_ID,
		language: 'en',
		theme: 'system',
		firstLaunchDone: false,
		installHintDismissed: false,
		dataVersion: DATA_VERSION,
		...overrides,
	};
}
