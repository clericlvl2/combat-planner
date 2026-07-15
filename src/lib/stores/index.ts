/**
 * Store seam public API (ADR-002). Re-exports the reactive store + the pure domain (transitions,
 * derivations, factories). Components import from `$lib/stores`; tests target `./domain/*` directly.
 *
 *  - reactive seam: `store` (singleton) / `CombatStore` (combat-store.svelte.ts) — owns `$state`,
 *    the only Dexie writer, persist-on-mutation + hydrate-on-boot.
 *  - pure domain (./domain): lifecycle/HP/roster transitions (LIF/HP/CBT), derived views
 *    (sortedCombatants / escalationDie / canAdvance / healthStatus — INI/TRE/HP), undo/redo
 *    (UND), hpLog append/pop (LOG) — all unit-tested (see `specs/reference/acceptance-matrix.md`).
 */
export { CombatStore, store } from './combat-store.svelte';
export * from './domain';
