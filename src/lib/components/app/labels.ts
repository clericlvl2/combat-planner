/**
 * Static maps from domain enums → Paraglide message fns (ADR-005). Bracket-indexing `m` with a
 * runtime-built key isn't type-safe, so these tables pin each enum value to its message fn once,
 * giving call sites a checked `typeLabel[type]()` instead of `m['forms.type.' + type]()`.
 */
import type { CombatantType, Condition } from '$lib/db/types';
import { m } from '$lib/i18n';
import type { HealthStatus } from '$lib/stores/domain/derive';

export const typeLabel: Record<CombatantType, () => string> = {
	pc: m['forms.type.pc'],
	enemy: m['forms.type.enemy'],
	ally: m['forms.type.ally'],
};

/**
 * Tailwind bg-color utility for each type's leading-edge stripe (tokens in layout.css; the row's
 * only type signal now — icon dropped, see CombatantRow / TypeBadge removal).
 */
export const typeColor: Record<CombatantType, string> = {
	pc: 'bg-type-pc',
	enemy: 'bg-type-enemy',
	ally: 'bg-type-ally',
};

/** Condition tag color (grouped semantically for at-a-glance distinction). */
export const conditionColor: Record<Condition, string> = {
	charmed: 'border-combat-violet/30 bg-combat-violet/10 text-combat-violet',
	confused: 'border-combat-amber/30 bg-combat-amber/10 text-combat-amber',
	dazed: 'border-combat-teal/30 bg-combat-teal/10 text-combat-teal',
	fear: 'border-combat-red/30 bg-combat-red/10 text-combat-red',
	helpless: 'border-combat-neutral/30 bg-combat-neutral/10 text-combat-neutral',
	hindered: 'border-combat-orange/30 bg-combat-orange/10 text-combat-orange',
	shocked: 'border-combat-blue/30 bg-combat-blue/10 text-combat-blue',
	stuck: 'border-combat-orange/30 bg-combat-orange/10 text-combat-orange',
	stunned: 'border-combat-teal/30 bg-combat-teal/10 text-combat-teal',
	vulnerable: 'border-combat-red/30 bg-combat-red/10 text-combat-red',
	weakened: 'border-combat-red/30 bg-combat-red/10 text-combat-red',
	staggered: 'border-combat-neutral/30 bg-combat-neutral/10 text-combat-neutral',
};

/** Per-condition combatant-card `--combat-*` hue, used by the condition picker. */
export const conditionAccent: Record<Condition, string> = {
	charmed: 'var(--combat-violet)',
	confused: 'var(--combat-amber)',
	dazed: 'var(--combat-teal)',
	fear: 'var(--combat-red)',
	helpless: 'var(--combat-neutral)',
	hindered: 'var(--combat-orange)',
	shocked: 'var(--combat-blue)',
	stuck: 'var(--combat-orange)',
	stunned: 'var(--combat-teal)',
	vulnerable: 'var(--combat-red)',
	weakened: 'var(--combat-red)',
	staggered: 'var(--combat-neutral)',
};

export const conditionLabel: Record<Condition, () => string> = {
	charmed: m['conditions.charmed'],
	confused: m['conditions.confused'],
	dazed: m['conditions.dazed'],
	fear: m['conditions.fear'],
	helpless: m['conditions.helpless'],
	hindered: m['conditions.hindered'],
	shocked: m['conditions.shocked'],
	stuck: m['conditions.stuck'],
	stunned: m['conditions.stunned'],
	vulnerable: m['conditions.vulnerable'],
	weakened: m['conditions.weakened'],
	staggered: m['conditions.staggered'],
};

export const healthLabel: Record<HealthStatus, () => string> = {
	full: m['health.full'],
	wounded: m['health.wounded'],
	bloodied: m['health.bloodied'],
	dead: m['health.dead'],
};

/** Health band → bar fill color utility (`dead` = reverse/alarm). */
export const healthColor: Record<HealthStatus, string> = {
	full: 'bg-health-full',
	wounded: 'bg-health-wounded',
	bloodied: 'bg-health-bloodied',
	dead: 'bg-health-dead',
};

/** Health band → text color utility (same tokens as `healthColor`, for numeric HP values). */
export const healthTextColor: Record<HealthStatus, string> = {
	full: 'text-health-full',
	wounded: 'text-health-wounded',
	bloodied: 'text-health-bloodied',
	dead: 'text-health-dead',
};

/** Sorts conditions alphabetically by localized label; returns a new array. */
export function sortConditions(cs: Condition[]): Condition[] {
	return [...cs].sort((a, b) => conditionLabel[a]().localeCompare(conditionLabel[b]()));
}
