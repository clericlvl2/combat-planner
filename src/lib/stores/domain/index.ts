/**
 * Pure domain barrel (ADR-002). Transitions/derivations/factories/migration-safe helpers — no
 * runes, no Dexie, no DOM. Fully unit-testable (Test Plan §3). The reactive seam
 * (combat-store.svelte.ts) and persistence (db/) compose these.
 */

export * from './app';
export * from './clamp';
export * from './constants';
export * from './derive';
export * from './factories';
export * from './hp';
export * from './id';
export * from './transitions';
export * from './undo';
