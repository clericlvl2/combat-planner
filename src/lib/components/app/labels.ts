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

/** Per-type combatant color as a CSS var, used for the active-turn card halo. */
export const typeAccent: Record<CombatantType, string> = {
	pc: 'var(--type-pc)',
	enemy: 'var(--type-enemy)',
	ally: 'var(--type-ally)',
};

/**
 * Shared card-chip visual formula for both tag chips (TagChip) and condition chips
 * (ConditionIconList) — one palette, one color-mix formula keyed off an inline `--tc` accent
 * (28% border / 9% bg over `--popover`, `--tc` text). Consumers set `style="--tc: …"`.
 */
export const chipAccentClass =
	'h-[22px] gap-1.5 border-[color-mix(in_srgb,var(--tc)_28%,var(--border))] bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))] px-2.5 text-sm font-normal text-[var(--tc)]';

/**
 * Shared modal ToggleGroupItem class string used by both TagAssignmentDialog and ConditionPicker —
 * hoisted here to keep the two byte-for-byte identical (guarded against drift). Consumers set
 * `style="--tc: …"`.
 */
export const modalToggleItemClass =
	'!rounded-[12px] h-10 px-4 text-sm font-medium bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))] border-[color-mix(in_srgb,var(--tc)_28%,var(--border))] text-[var(--tc)] hover:bg-[color-mix(in_srgb,var(--tc)_15%,var(--popover))] data-[state=on]:bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] data-[state=on]:border-[var(--tc)] data-[state=on]:ring-1 data-[state=on]:ring-[var(--tc)] data-[state=on]:text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))] aria-pressed:bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] aria-pressed:border-[var(--tc)] aria-pressed:ring-1 aria-pressed:ring-[var(--tc)] aria-pressed:text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))]';

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

/**
 * The 8 `--combat-*` swatches (ADR-012), reused here via a deterministic hash of the tag's
 * (lowercased) name — tags are an open vocabulary, so the mapping is computed rather than
 * hand-authored per value like `conditionAccent`.
 */
const TAG_ACCENT_PALETTE = [
	'--combat-blue',
	'--combat-green',
	'--combat-violet',
	'--combat-amber',
	'--combat-teal',
	'--combat-red',
	'--combat-orange',
	'--combat-neutral',
] as const;

/** Deterministic tag → `--combat-*` accent, hashed from the lowercased tag name (no tag ids). */
export function tagAccent(name: string): string {
	let h = 0;
	const key = name.toLowerCase();
	for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
	return `var(${TAG_ACCENT_PALETTE[h % TAG_ACCENT_PALETTE.length]})`;
}
