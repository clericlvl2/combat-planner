import { beforeEach, describe, expect, it } from 'vitest';
import type { Combat, Combatant } from '../../db/types';
import { escalationDie, sortedCombatants } from './derive';
import { createCombat, createCombatant } from './factories';
import {
	addCombatant,
	addCondition,
	advanceTurn,
	clearCombat,
	dealDamage,
	duplicateCombatant,
	editCombatant,
	removeCombatant,
	removeCondition,
	restart,
	restoreHp,
	rollOne,
	setInitiative,
	setMaxHp,
	setTempHp,
	start,
} from './transitions';
import { redo, undo } from './undo';

let seq = 0;
beforeEach(() => {
	seq = 0;
});
const id = () => `c${seq++}`;
const d10 = () => 10; // deterministic d20 stub

function mk(over: Partial<Combatant>, addOrder = over.addOrder ?? 0): Combatant {
	return { ...createCombatant({ name: 'X', maxHp: 30 }, addOrder, id), ...over };
}
function combat(combatants: Combatant[], over: Partial<Combat> = {}): Combat {
	return { ...createCombat({}, 0, () => 'combat'), combatants, ...over };
}

describe('start (LIF-3)', () => {
	it('rolls every "-", re-sorts, goes Active round 1, points at the top, pushes a pre-Start snapshot', () => {
		const a = mk({ id: 'a', initiative: '-', initiativeBonus: 5 }, 0);
		const b = mk({ id: 'b', initiative: 12 }, 1);
		const next = start(combat([a, b]), d10);
		expect(next.combatants.find((c) => c.id === 'a')?.initiative).toBe(15); // 10 + 5
		expect(next.combatants.find((c) => c.id === 'b')?.initiative).toBe(12); // untouched
		expect(next.state).toBe('active');
		expect(next.round).toBe(1);
		expect(next.activeCombatantId).toBe('a'); // 15 > 12
		expect(next.undoStack).toHaveLength(1);
		expect(next.undoStack[0].action).toBe('start');
	});

	it('undo restores Setup exactly (unrolled back to "-", no active turn)', () => {
		const a = mk({ id: 'a', initiative: '-', initiativeBonus: 5 }, 0);
		const back = undo(start(combat([a]), d10));
		expect(back.state).toBe('setup');
		expect(back.activeCombatantId).toBe('none');
		expect(back.combatants[0].initiative).toBe('-');
	});
});

describe('advanceTurn (TRE-2)', () => {
	const a = mk({ id: 'a', initiative: 20 }, 0);
	const b = mk({ id: 'b', initiative: 10 }, 1);
	const active = () => combat([a, b], { state: 'active', round: 1, activeCombatantId: 'a' });

	it('moves to the next in order', () => {
		expect(advanceTurn(active()).activeCombatantId).toBe('b');
	});

	it('wraps past the last → round + 1 AND escalation + 1', () => {
		const wrapped = advanceTurn(
			combat([a, b], { state: 'active', round: 1, escalation: 0, activeCombatantId: 'b' }),
		);
		expect(wrapped.round).toBe(2);
		expect(wrapped.activeCombatantId).toBe('a');
		expect(escalationDie(wrapped)).toBe(1);
	});

	it('a plain advance within the same round never touches escalation', () => {
		const advanced = advanceTurn(
			combat([a, b], { state: 'active', round: 1, escalation: 2, activeCombatantId: 'a' }),
		);
		expect(advanced.round).toBe(1);
		expect(escalationDie(advanced)).toBe(2);
	});

	it('escalation caps at 6 on repeated round-wraps', () => {
		const wrapped = advanceTurn(
			combat([a, b], { state: 'active', round: 6, escalation: 6, activeCombatantId: 'b' }),
		);
		expect(escalationDie(wrapped)).toBe(6);
	});

	it('undo of a wrap steps the round AND turn back', () => {
		const wrapped = advanceTurn(
			combat([a, b], { state: 'active', round: 3, activeCombatantId: 'b' }),
		);
		const back = undo(wrapped);
		expect(back.round).toBe(3);
		expect(back.activeCombatantId).toBe('b');
	});

	it('blocks ONLY the round-99 wrap (returns unchanged, pushes no undo)', () => {
		const r99 = combat([a, b], { state: 'active', round: 99, activeCombatantId: 'b' });
		const out = advanceTurn(r99);
		expect(out).toBe(r99);
		// within round 99 still advances
		expect(advanceTurn({ ...r99, activeCombatantId: 'a' }).activeCombatantId).toBe('b');
	});
});

describe('HP transitions (HP-1, LOG-1)', () => {
	it('damage drains temp first, then current, floored at −maxHp; logs delta = −n', () => {
		const c = combat([mk({ id: 'a', currentHp: 30, tempHp: 5, maxHp: 30 })], {
			state: 'active',
			round: 3,
		});
		const hit = dealDamage(c, 'a', 10).combatants[0];
		expect(hit.tempHp).toBe(0);
		expect(hit.currentHp).toBe(25);
		expect(hit.hpLog).toHaveLength(1);
		expect(hit.hpLog[0]).toMatchObject({
			type: 'damage',
			delta: -10,
			currentHp: 25,
			tempHp: 0,
			round: 3,
		});

		const floored = dealDamage(c, 'a', 999).combatants[0];
		expect(floored.currentHp).toBe(-30);
	});

	it('heal = min(cur + n, max(maxHp, cur)); never reduces even when cur > maxHp', () => {
		const low = combat([mk({ id: 'a', currentHp: 10, maxHp: 30 })]);
		expect(restoreHp(low, 'a', 5).combatants[0].currentHp).toBe(15);
		const over = combat([mk({ id: 'a', currentHp: 40, maxHp: 30 })]);
		expect(restoreHp(over, 'a', 5).combatants[0].currentHp).toBe(40); // capped at current
	});

	it('setTempHp replaces the buffer; 0 clears', () => {
		const c = combat([mk({ id: 'a', tempHp: 5 })]);
		expect(setTempHp(c, 'a', 8).combatants[0].tempHp).toBe(8);
		expect(setTempHp(c, 'a', 0).combatants[0].tempHp).toBe(0);
	});

	it('empty/zero entry is a no-op — no state change, no log', () => {
		const c = combat([mk({ id: 'a', currentHp: 30 })]);
		expect(dealDamage(c, 'a', 0)).toBe(c);
		expect(restoreHp(c, 'a', 0)).toBe(c);
	});

	it('logs round "—" (null) while in Setup', () => {
		const c = combat([mk({ id: 'a' })], { state: 'setup' });
		expect(dealDamage(c, 'a', 5).combatants[0].hpLog[0].round).toBeNull();
	});

	it('undo pops the hpLog entry; redo re-adds it', () => {
		const c = combat([mk({ id: 'a', currentHp: 30 })], { state: 'active', round: 1 });
		const hit = dealDamage(c, 'a', 5);
		expect(hit.combatants[0].hpLog).toHaveLength(1);
		const back = undo(hit);
		expect(back.combatants[0].hpLog).toHaveLength(0);
		expect(back.combatants[0].currentHp).toBe(30);
		const again = redo(back);
		expect(again.combatants[0].hpLog).toHaveLength(1);
		expect(again.combatants[0].currentHp).toBe(25);
	});
});

describe('hpLog scope (LOG-1)', () => {
	it('appends only on HP actions — not conditions or initiative', () => {
		const c = combat([mk({ id: 'a' })], { state: 'active', round: 1 });
		expect(addCondition(c, 'a', 'dazed').combatants[0].hpLog).toHaveLength(0);
		expect(setInitiative(c, 'a', 15).combatants[0].hpLog).toHaveLength(0);
		expect(setMaxHp(c, 'a', 50).combatants[0].hpLog[0].type).toBe('setMax');
	});
});

describe('editCombatant — Max HP is a discrete undo step (CBT-4, UND-4)', () => {
	it('field edits + a Max-HP change push TWO entries; undo peels them apart', () => {
		const c = combat([mk({ id: 'a', name: 'Alice', maxHp: 30, currentHp: 30 })]);
		const edited = editCombatant(c, 'a', { name: 'Bob', maxHp: 50 });
		expect(edited.undoStack.map((e) => e.action)).toEqual(['editCombatant', 'setMaxHp']);
		expect(edited.combatants[0]).toMatchObject({ name: 'Bob', maxHp: 50, currentHp: 30 });
		expect(edited.combatants[0].hpLog).toHaveLength(1); // the Set Max HP entry

		const undoMax = undo(edited);
		expect(undoMax.combatants[0]).toMatchObject({ name: 'Bob', maxHp: 30 });
		expect(undoMax.combatants[0].hpLog).toHaveLength(0); // popped its own entry

		const undoFields = undo(undoMax);
		expect(undoFields.combatants[0].name).toBe('Alice');
	});

	it('a field-only edit pushes a single entry; Max-HP edit never touches current HP', () => {
		const c = combat([mk({ id: 'a', ac: 10, currentHp: 30, maxHp: 30 })]);
		const fieldOnly = editCombatant(c, 'a', { ac: 15 });
		expect(fieldOnly.undoStack).toHaveLength(1);
		expect(fieldOnly.combatants[0].ac).toBe(15);
		expect(editCombatant(c, 'a', { maxHp: 10 }).combatants[0].currentHp).toBe(30);
	});
});

describe('roster (CBT-3, CBT-6, CBT-7)', () => {
	it('addCombatant: defaults (cur=max, temp 0, "-", empty hpLog), appended, undoable', () => {
		const c = combat([]);
		const added = addCombatant(c, { name: 'Z', maxHp: 10 }, id);
		const z = added.combatants[0];
		expect(z).toMatchObject({
			currentHp: 10,
			tempHp: 0,
			initiative: '-',
			conditions: [],
			hpLog: [],
		});
		expect(added.undoStack).toHaveLength(1);
	});

	it('addCombatant / duplicateCombatant blocked at the 30 cap', () => {
		const roster = Array.from({ length: 30 }, (_, i) => mk({ id: `x${i}`, name: `G${i}` }, i));
		const full = combat(roster);
		expect(addCombatant(full, { name: 'extra', maxHp: 10 }, id)).toBe(full);
		expect(duplicateCombatant(full, 'x0', id)).toBe(full);
	});

	it('duplicate: Windows suffix skipping taken names; resets; copies stats; bottom', () => {
		const g = mk({ id: 'g', name: 'Goblin', maxHp: 22, ac: 14, note: 'sneaky' }, 0);
		const g1 = mk({ id: 'g1', name: 'Goblin 1' }, 1);
		const dup = duplicateCombatant(combat([g, g1]), 'g', id);
		const copy = dup.combatants[2];
		expect(copy.name).toBe('Goblin 2'); // "Goblin 1" taken → skip to 2
		expect(copy).toMatchObject({
			maxHp: 22,
			ac: 14,
			note: 'sneaky',
			currentHp: 22,
			initiative: '-',
		});
		expect(copy.hpLog).toEqual([]);
		expect(copy.addOrder).toBe(2);
	});

	it('removeCombatant: active pointer moves to next, then to new last, then none → Setup', () => {
		const a = mk({ id: 'a', initiative: 30 }, 0);
		const b = mk({ id: 'b', initiative: 20 }, 1);
		const cc = mk({ id: 'c', initiative: 10 }, 2);
		let st = combat([a, b, cc], { state: 'active', round: 1, activeCombatantId: 'a' });
		st = removeCombatant(st, 'a');
		expect(st.activeCombatantId).toBe('b'); // next in order
		st = removeCombatant(st, 'c'); // remove the last (not active) — pointer stays
		expect(st.activeCombatantId).toBe('b');
		st = removeCombatant(st, 'b'); // remove active, now last → none, revert Setup
		expect(st.activeCombatantId).toBe('none');
		expect(st.state).toBe('setup');
	});
});

describe('conditions (CND-2)', () => {
	it('toggles unique membership; redundant toggles are no-ops', () => {
		const c = combat([mk({ id: 'a' })]);
		const added = addCondition(c, 'a', 'charmed');
		expect(added.combatants[0].conditions).toEqual(['charmed']);
		expect(addCondition(added, 'a', 'charmed')).toBe(added); // already present → no-op
		const removed = removeCondition(added, 'a', 'charmed');
		expect(removed.combatants[0].conditions).toEqual([]);
		expect(removeCondition(removed, 'a', 'charmed')).toBe(removed); // absent → no-op
	});
});

describe('rollOne (INI-2)', () => {
	it('sets initiative = d20 + bonus', () => {
		const c = combat([mk({ id: 'a', initiative: '-', initiativeBonus: 3 })]);
		expect(rollOne(c, 'a', d10).combatants[0].initiative).toBe(13);
	});
});

describe('clearCombat / restart (LIF-5, LIF-6)', () => {
	function dirty(): Combat {
		const a = mk(
			{
				id: 'a',
				currentHp: 5,
				tempHp: 4,
				conditions: ['dazed'],
				hpLog: [{ type: 'damage', delta: -25, currentHp: 5, tempHp: 4, maxHp: 30, round: 2 }],
				initiative: 18,
			},
			0,
		);
		return combat([a], {
			state: 'active',
			round: 4,
			escalation: 5,
			activeCombatantId: 'a',
		});
	}

	it('clearCombat empties the roster → Setup; undo restores the snapshot exactly', () => {
		const cleared = clearCombat(dirty());
		expect(cleared.combatants).toHaveLength(0);
		expect(cleared.state).toBe('setup');
		expect(cleared.activeCombatantId).toBe('none');
		expect(cleared.escalation).toBe(0);
		const back = undo(cleared);
		expect(back.combatants).toHaveLength(1);
		expect(back.combatants[0].hpLog).toHaveLength(1);
		expect(back.escalation).toBe(5);
	});

	it('restart keeps the roster but resets each combatant + resets escalation → Setup', () => {
		const re = restart(dirty());
		expect(re.combatants).toHaveLength(1);
		expect(re.combatants[0]).toMatchObject({
			initiative: '-',
			currentHp: 30,
			tempHp: 0,
			conditions: [],
			hpLog: [],
		});
		expect(re.round).toBe(1);
		expect(re.state).toBe('setup');
		expect(re.escalation).toBe(0);
		expect(sortedCombatants(re)).toHaveLength(1);
	});
});
