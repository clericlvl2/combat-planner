/**
 * Store seam public API (ADR-002). Re-exports the reactive store + the pure domain (transitions,
 * derivations, factories). Components import from `$lib/stores`; tests target `./domain/*` directly.
 *
 *  - reactive seam: `store` (singleton) / `CombatStore` (combat-store.svelte.ts) — owns `$state`,
 *    the only Dexie writer, persist-on-mutation + hydrate-on-boot.
 *  - pure domain (./domain): lifecycle/HP/roster transitions (Data §7), derived views
 *    (sortedCombatants / escalationDie / canAdvance / healthStatus — Data §3/§4), undo/redo
 *    (Data §8), hpLog append/pop (Data §9) — all unit-tested (Test Plan §3).
 */
export { CombatStore, store } from './combat-store.svelte';
export * from './domain';
