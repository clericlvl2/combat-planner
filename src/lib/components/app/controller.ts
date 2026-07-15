/**
 * Combat controller — the intent seam between the prop-driven UI leaves and the M1 store
 * (ADR-002). Every method is already bound to one `combatId`, so components emit pure intent
 * (`roll(id)`, `damage(id, n)`, …) and stay free of the store import — which is what lets the
 * component tests (see acceptance-matrix.md) drive them with a plain spy object instead of a
 * live Dexie store.
 *
 * No business logic lives here: each call forwards straight to a store mutation (which snapshots
 * `$state` and persists — see the store seam). The store owns the rules; this only narrows + binds.
 */

import type { Condition } from '$lib/db/types';
import type { CombatantInput, CombatStore } from '$lib/stores';
import type { CombatantFieldPatch } from '$lib/stores/domain/transitions';

export interface CombatController {
	// initiative
	roll(id: string): void;
	setInitiative(id: string, value: number): void;
	// HP (numpad)
	damage(id: string, n: number): void;
	restore(id: string, n: number): void;
	setTempHp(id: string, n: number): void;
	// conditions
	addCondition(id: string, c: Condition): void;
	removeCondition(id: string, c: Condition): void;
	// fields / roster
	edit(id: string, patch: CombatantFieldPatch & { maxHp?: number }): void;
	duplicate(id: string): void;
	remove(id: string): void;
	addCombatant(input: CombatantInput): void;
	// lifecycle
	start(): void;
	advance(): void;
	undo(): void;
	redo(): void;
	clear(): void;
	restart(): void;
	editRound(value: number): void;
	setEscalation(value: number): void;
}

/** Bind a store to one combat, producing the id-scoped controller the UI consumes. */
export function makeController(store: CombatStore, combatId: string): CombatController {
	return {
		roll: (id) => store.rollOne(combatId, id),
		setInitiative: (id, value) => store.setInitiative(combatId, id, value),
		damage: (id, n) => store.dealDamage(combatId, id, n),
		restore: (id, n) => store.restoreHp(combatId, id, n),
		setTempHp: (id, n) => store.setTempHp(combatId, id, n),
		addCondition: (id, c) => store.addCondition(combatId, id, c),
		removeCondition: (id, c) => store.removeCondition(combatId, id, c),
		edit: (id, patch) => store.editCombatant(combatId, id, patch),
		duplicate: (id) => store.duplicateCombatant(combatId, id),
		remove: (id) => store.removeCombatant(combatId, id),
		addCombatant: (input) => store.addCombatant(combatId, input),
		start: () => store.start(combatId),
		advance: () => store.advanceTurn(combatId),
		undo: () => store.undo(combatId),
		redo: () => store.redo(combatId),
		clear: () => store.clearCombat(combatId),
		restart: () => store.restart(combatId),
		editRound: (value) => store.editRound(combatId, value),
		setEscalation: (value) => store.setEscalation(combatId, value),
	};
}
