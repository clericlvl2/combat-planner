/**
 * Per-combat state transitions — pure functions `(Combat, …) => Combat`.
 * Every reversible action pushes an undo snapshot first (undo.ts); HP actions append an hpLog
 * entry (hp.ts). Blocked/no-op actions return the combat unchanged (no undo pushed) so the
 * caller can surface a message (caps/clamps live in clamp.ts; messages are a UI concern — M2+).
 */
import {
	type Combat,
	type Combatant,
	type CombatantType,
	type Condition,
	MAX_COMBATANTS,
	NONE,
	UNROLLED,
} from '../../db/types';
import {
	clampAc,
	clampEscalation,
	clampInitiative,
	clampInitiativeBonus,
	clampMaxHp,
	clampMd,
	clampNote,
	clampPd,
	clampRound,
} from './clamp';
import { canAdvance, sortedCombatants } from './derive';
import { type CombatantInput, createCombatant } from './factories';
import { applyDamage, applyHeal, applySetMax, applySetTemp } from './hp';
import { type D20Roll, d20 as defaultD20, genId as defaultGenId, type IdGen } from './id';
import { pushUndo } from './undo';

// ── internal helpers ────────────────────────────────────────────────────────

const now = (): number => Date.now();

const find = (combat: Combat, id: string): Combatant | undefined =>
	combat.combatants.find((c) => c.id === id);

/** Map the matching combatant and bump updatedAt. */
function mapCombatant(combat: Combat, id: string, fn: (c: Combatant) => Combatant): Combat {
	return {
		...combat,
		combatants: combat.combatants.map((c) => (c.id === id ? fn(c) : c)),
		updatedAt: now(),
	};
}

/** Next addOrder = max existing + 1 (monotonic; survives removals — used for tiebreak + "-" order). */
function nextAddOrder(combat: Combat): number {
	return combat.combatants.reduce((max, c) => Math.max(max, c.addOrder), -1) + 1;
}

const liveRound = (combat: Combat): number | null =>
	combat.state === 'active' ? combat.round : null;

// ── HP transitions ────────────────────────────────────────────────────────

/** Empty/non-positive entry → no-op (no state change, no log). */
export function dealDamage(combat: Combat, id: string, n: number): Combat {
	if (!(n > 0) || !find(combat, id)) return combat;
	const round = liveRound(combat);
	return mapCombatant(pushUndo(combat, 'damage'), id, (c) => applyDamage(c, n, round));
}

export function restoreHp(combat: Combat, id: string, n: number): Combat {
	if (!(n > 0) || !find(combat, id)) return combat;
	const round = liveRound(combat);
	return mapCombatant(pushUndo(combat, 'heal'), id, (c) => applyHeal(c, n, round));
}

export function setTempHp(combat: Combat, id: string, n: number): Combat {
	if (!find(combat, id)) return combat;
	const round = liveRound(combat);
	return mapCombatant(pushUndo(combat, 'setTemp'), id, (c) => applySetTemp(c, n, round));
}

/** Discrete Max-HP step (its own undo entry + "Set Max HP" hpLog entry). */
export function setMaxHp(combat: Combat, id: string, n: number): Combat {
	const target = find(combat, id);
	if (!target || clampMaxHp(n) === target.maxHp) return combat;
	const round = liveRound(combat);
	return mapCombatant(pushUndo(combat, 'setMaxHp'), id, (c) => applySetMax(c, n, round));
}

// ── combatant roster ──────────────────────────────────────────────────────

export function addCombatant(
	combat: Combat,
	input: CombatantInput,
	genId: IdGen = defaultGenId,
	roll: D20Roll = defaultD20,
): Combat {
	if (combat.combatants.length >= MAX_COMBATANTS) return combat;
	let combatant = createCombatant(input, nextAddOrder(combat), genId);
	// Mid-combat add: no manual value given → auto-roll like everyone else got at Start.
	if (combat.state === 'active' && combatant.initiative === UNROLLED) {
		combatant = { ...combatant, initiative: clampInitiative(roll() + combatant.initiativeBonus) };
	}
	const pushed = pushUndo(combat, 'addCombatant');
	return { ...pushed, combatants: [...pushed.combatants, combatant], updatedAt: now() };
}

/**
 * Remove a combatant. If it was active, move the pointer to the next in sorted order (or the new
 * last); removing the last/only one clears the pointer and reverts Active → Setup.
 */
export function removeCombatant(combat: Combat, id: string): Combat {
	if (!find(combat, id)) return combat;
	const pushed = pushUndo(combat, 'removeCombatant');

	let activeCombatantId = pushed.activeCombatantId;
	if (activeCombatantId === id) {
		const sorted = sortedCombatants(pushed);
		const idx = sorted.findIndex((c) => c.id === id);
		const next = sorted[idx + 1] ?? sorted[idx - 1];
		activeCombatantId = next ? next.id : NONE;
	}

	const combatants = pushed.combatants.filter((c) => c.id !== id);
	if (combatants.length === 0) {
		return {
			...pushed,
			combatants,
			activeCombatantId: NONE,
			state: 'setup',
			updatedAt: now(),
		};
	}
	return { ...pushed, combatants, activeCombatantId, updatedAt: now() };
}

/** Windows-style suffix: strip a trailing " N", then find the lowest free "base K". */
function duplicateName(name: string, taken: Set<string>): string {
	const base = name.replace(/\s+\d+$/, '').trimEnd() || name;
	let k = 1;
	while (taken.has(`${base} ${k}`)) k += 1;
	return `${base} ${k}`;
}

/** Duplicate: copy stats+note, reset init/cur/temp/conditions/hpLog, append at bottom. */
export function duplicateCombatant(
	combat: Combat,
	id: string,
	genId: IdGen = defaultGenId,
): Combat {
	const src = find(combat, id);
	if (!src || combat.combatants.length >= MAX_COMBATANTS) return combat;
	const taken = new Set(combat.combatants.map((c) => c.name));
	const copy: Combatant = {
		...src,
		id: genId(),
		name: duplicateName(src.name, taken),
		addOrder: nextAddOrder(combat),
		initiative: UNROLLED,
		currentHp: src.maxHp,
		tempHp: 0,
		conditions: [],
		hpLog: [],
	};
	const pushed = pushUndo(combat, 'duplicateCombatant');
	return { ...pushed, combatants: [...pushed.combatants, copy], updatedAt: now() };
}

// ── combatant fields ──────────────────────────────────────────────────────

export function addCondition(combat: Combat, id: string, condition: Condition): Combat {
	const c = find(combat, id);
	if (!c || c.conditions.includes(condition)) return combat;
	return mapCombatant(pushUndo(combat, 'addCondition'), id, (cb) => ({
		...cb,
		conditions: [...cb.conditions, condition],
	}));
}

export function removeCondition(combat: Combat, id: string, condition: Condition): Combat {
	const c = find(combat, id);
	if (!c?.conditions.includes(condition)) return combat;
	return mapCombatant(pushUndo(combat, 'removeCondition'), id, (cb) => ({
		...cb,
		conditions: cb.conditions.filter((x) => x !== condition),
	}));
}

export function rollOne(combat: Combat, id: string, roll: D20Roll = defaultD20): Combat {
	const c = find(combat, id);
	if (!c) return combat;
	return mapCombatant(pushUndo(combat, 'rollInitiative'), id, (cb) => ({
		...cb,
		initiative: clampInitiative(roll() + cb.initiativeBonus),
	}));
}

export function setInitiative(combat: Combat, id: string, value: number): Combat {
	if (!find(combat, id)) return combat;
	return mapCombatant(pushUndo(combat, 'setInitiative'), id, (cb) => ({
		...cb,
		initiative: clampInitiative(value),
	}));
}

/** Non-HP combatant field edits (name/type/bonus/AC/PD/MD/note/manual init). Max HP is separate. */
export interface CombatantFieldPatch {
	name?: string;
	type?: CombatantType;
	initiativeBonus?: number;
	ac?: number;
	pd?: number;
	md?: number;
	note?: string;
	initiative?: number;
}

function applyFieldPatch(c: Combatant, patch: CombatantFieldPatch): Combatant {
	const next = { ...c };
	if (patch.name !== undefined) next.name = patch.name.trim();
	if (patch.type !== undefined) next.type = patch.type;
	if (patch.initiativeBonus !== undefined)
		next.initiativeBonus = clampInitiativeBonus(patch.initiativeBonus);
	if (patch.ac !== undefined) next.ac = clampAc(patch.ac);
	if (patch.pd !== undefined) next.pd = clampPd(patch.pd);
	if (patch.md !== undefined) next.md = clampMd(patch.md);
	if (patch.note !== undefined) next.note = clampNote(patch.note);
	if (patch.initiative !== undefined) next.initiative = clampInitiative(patch.initiative);
	return next;
}

/**
 * Edit a combatant from the form save. A Max-HP change is recorded as its OWN discrete undo step,
 * separate from the other field edits in the same save: the field
 * edits push one entry, the Max-HP edit a second (with its "Set Max HP" hpLog entry).
 */
export function editCombatant(
	combat: Combat,
	id: string,
	patch: CombatantFieldPatch & { maxHp?: number },
): Combat {
	const target = find(combat, id);
	if (!target) return combat;

	const { maxHp, ...fields } = patch;
	let next = combat;

	const fieldKeys = Object.keys(fields) as (keyof CombatantFieldPatch)[];
	if (fieldKeys.some((k) => fields[k] !== undefined)) {
		next = mapCombatant(pushUndo(next, 'editCombatant'), id, (c) => applyFieldPatch(c, fields));
	}
	if (maxHp !== undefined) {
		next = setMaxHp(next, id, maxHp);
	}
	return next;
}

// ── lifecycle ─────────────────────────────────────────────────────────────

/** Start: roll all "-", re-sort, Active, round 1, pointer = top of order. */
export function start(combat: Combat, roll: D20Roll = defaultD20): Combat {
	if (combat.state !== 'setup') return combat;
	const pushed = pushUndo(combat, 'start');
	const combatants = pushed.combatants.map((c) =>
		c.initiative === UNROLLED
			? { ...c, initiative: clampInitiative(roll() + c.initiativeBonus) }
			: c,
	);
	const rolled: Combat = {
		...pushed,
		combatants,
		state: 'active',
		round: 1,
		escalation: 0,
		updatedAt: now(),
	};
	const top = sortedCombatants(rolled)[0];
	return { ...rolled, activeCombatantId: top ? top.id : NONE };
}

/**
 * Advance the turn; wrap → round+1 AND escalation+1 (decoupled from round otherwise). Blocked at
 * the r99 wrap. A plain turn advance within the same round never touches escalation.
 */
export function advanceTurn(combat: Combat): Combat {
	if (!canAdvance(combat)) return combat;
	const pushed = pushUndo(combat, 'advanceTurn');
	const sorted = sortedCombatants(pushed);
	const idx = sorted.findIndex((c) => c.id === pushed.activeCombatantId);
	if (idx >= 0 && idx < sorted.length - 1) {
		return { ...pushed, activeCombatantId: sorted[idx + 1].id, updatedAt: now() };
	}
	return {
		...pushed,
		round: clampRound(pushed.round + 1),
		escalation: clampEscalation(pushed.escalation + 1),
		activeCombatantId: sorted[0].id,
		updatedAt: now(),
	};
}

export function editRound(combat: Combat, value: number): Combat {
	const pushed = pushUndo(combat, 'editRound');
	return { ...pushed, round: clampRound(value), updatedAt: now() };
}

/** Set the escalation die absolutely; future round-wraps continue +1 from here. */
export function setEscalation(combat: Combat, value: number): Combat {
	const pushed = pushUndo(combat, 'setEscalation');
	return { ...pushed, escalation: clampEscalation(value), updatedAt: now() };
}

/** Clear: remove all combatants (+ their hpLogs), back to empty Setup. */
export function clearCombat(combat: Combat): Combat {
	const pushed = pushUndo(combat, 'clearCombat');
	return {
		...pushed,
		combatants: [],
		round: 1,
		escalation: 0,
		activeCombatantId: NONE,
		state: 'setup',
		updatedAt: now(),
	};
}

/** Restart: keep roster, reset each combatant, back to Setup. */
export function restart(combat: Combat): Combat {
	const pushed = pushUndo(combat, 'restart');
	const combatants = pushed.combatants.map((c) => ({
		...c,
		initiative: UNROLLED as typeof UNROLLED,
		currentHp: c.maxHp,
		tempHp: 0,
		conditions: [],
		hpLog: [],
	}));
	return {
		...pushed,
		combatants,
		round: 1,
		escalation: 0,
		activeCombatantId: NONE,
		state: 'setup',
		updatedAt: now(),
	};
}
