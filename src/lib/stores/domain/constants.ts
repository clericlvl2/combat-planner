/**
 * Numeric ranges + field defaults — single source of truth mirrors specs/reference/limits.md.
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

/** Note hard cap during input (specs/reference/limits.md). */
export const NOTE_MAX_LENGTH = 250;

/** d20 roll bounds (INI-5 — Start auto-roll / per-combatant roll). */
export const D20 = { min: 1, max: 20 } as const;

/** Add-combatant placeholders that double as defaults when a field is omitted (specs/reference/limits.md). */
export const COMBATANT_DEFAULTS = {
	maxHp: 10,
	ac: 10,
	pd: 10,
	md: 10,
	initiativeBonus: 0,
} as const;
