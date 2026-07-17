/**
 * Store seam public API (ADR-002). Re-exports the reactive store + the pure domain (transitions,
 * derivations, factories). Components import from `$lib/stores`; tests target `./domain/*` directly.
 *
 *  - reactive seam: `store` (singleton) / `CombatStore` (combat-store.svelte.ts) — owns `$state`,
 *    the only Dexie writer, persist-on-mutation + hydrate-on-boot.
 *  - pure domain (./domain): lifecycle/HP/roster transitions, derived views
 *    (sortedCombatants / escalationDie / canAdvance / healthStatus), undo/redo,
 *    hpLog append/pop — all unit-tested (see `./domain/*.spec.ts`).
 */
export { CombatStore, store } from './combat-store.svelte';
export * from './domain';
