/**
 * Injectable seams for the two sources of nondeterminism (Test Plan §3/§8 gap):
 *  - `genId`  — stable identifier generation.
 *  - `d20`    — the initiative die.
 * Transitions take these as optional deps so unit tests can pass deterministic stubs.
 */
import { D20 } from './constants';

export type IdGen = () => string;
export type D20Roll = () => number;

/** Default id source — `crypto.randomUUID` exists in both browser and modern Node. */
export const genId: IdGen = () => crypto.randomUUID();

/** Default d20 — uniform 1..20. */
export const d20: D20Roll = () => Math.floor(Math.random() * (D20.max - D20.min + 1)) + D20.min;
