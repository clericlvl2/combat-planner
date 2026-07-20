/**
 * Numeric ranges + field defaults — the single source of truth for every numeric limit.
 * Used by clamps (clamp.ts) and factories (factories.ts). Tests assert against these.
 */

export const RANGES = {
	initiativeBonus: { min: -99, max: 99 },
	initiative: { min: -9, max: 99 },
	ac: { min: 0, max: 99 },
	pd: { min: 0, max: 99 },
	md: { min: 0, max: 99 },
	maxHp: { min: 1, max: 999 },
	currentHp: { max: 999 }, // min is -maxHp, computed per-combatant
	tempHp: { min: 0, max: 999 },
	round: { min: 1, max: 99 },
	escalation: { min: 0, max: 6 },
} as const;

/** Note hard cap during input. */
export const NOTE_MAX_LENGTH = 250;

/** Combat title hard cap during input. */
export const TITLE_MAX_LENGTH = 60;

/** Combatant name hard cap during input. */
export const NAME_MAX_LENGTH = 40;

/** Combat description hard cap during input. */
export const DESCRIPTION_MAX_LENGTH = 200;

/** d20 roll bounds — Start auto-roll / per-combatant roll. */
export const D20 = { min: 1, max: 20 } as const;

/** Add-combatant placeholders that double as defaults when a field is omitted. */
export const COMBATANT_DEFAULTS = {
	maxHp: 10,
	ac: 10,
	pd: 10,
	md: 10,
	initiativeBonus: 0,
} as const;
