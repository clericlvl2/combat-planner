/**
 * Boot seed for the M2 slice — there's no Combats home yet (M3), so we guarantee one playable
 * combat to land on. firstLaunch (Data §7) already auto-creates one empty combat; this fills it
 * with a few combatants the first time only (skipped once it has any, so it never clobbers real
 * play and never re-runs after reload). Goes away with the M3 Combats home + routing.
 *
 * TODO M3 (UX §3): remove — replaced by the real combats list / create flow.
 */
import { store } from '$lib/stores';

export function seedDemoCombat(): void {
	const combat = store.combats[0];
	if (!combat || combat.combatants.length > 0) return;
	store.addCombatant(combat.id, {
		name: 'Kaelen',
		type: 'pc',
		maxHp: 34,
		ac: 18,
		pd: 14,
		md: 12,
		initiativeBonus: 3,
	});
	store.addCombatant(combat.id, {
		name: 'Goblin',
		type: 'enemy',
		maxHp: 12,
		ac: 16,
		pd: 13,
		md: 10,
		initiativeBonus: 2,
	});
	store.addCombatant(combat.id, {
		name: 'Goblin',
		type: 'enemy',
		maxHp: 12,
		ac: 16,
		pd: 13,
		md: 10,
		initiativeBonus: 2,
	});
	store.addCombatant(combat.id, {
		name: 'Ironhide',
		type: 'ally',
		maxHp: 28,
		ac: 17,
		pd: 15,
		md: 11,
		initiativeBonus: 1,
	});
}
