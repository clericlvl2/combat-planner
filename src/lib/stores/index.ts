/**
 * Store seam (ADR-002) — PLACEHOLDER, implemented in M1.
 *
 * This is the single owner of reactive combat state (Svelte 5 `$state` / `$derived`)
 * and the ONLY writer to Dexie (src/lib/db). It will encapsulate:
 *  - lifecycle transitions: start / advanceTurn / clearCombat / restart / editRound /
 *    setEscalation (Data Model §7) — pure functions over state, unit-testable (Test Plan §3).
 *  - HP transitions: dealDamage / restoreHp / setTempHp + Max-HP edit (Rules §4).
 *  - derived values ($derived, never stored): sortedCombatants / escalationDie /
 *    canAdvance / healthStatus (Data Model §3/§4).
 *  - per-combat 10-deep undo/redo history + hpLog append/pop kept consistent (Data Model §8/§9).
 *  - an injectable d20 RNG seam for deterministic tests (Test Plan §3 / §8 gap).
 *
 * TODO M1: implement per ADR-002 (next doc: "Store seam / ADR-002").
 */
export {};
