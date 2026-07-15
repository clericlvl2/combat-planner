import { describe, expect, it } from 'vitest';
import {
	COLOR_TAGS,
	COMBATANT_TYPES,
	CONDITIONS,
	DATA_VERSION,
	MAX_COMBATANTS,
	MAX_COMBATS,
} from './types';

// Smoke test for the unit layer (Vitest, ADR-009). Real transition/derivation cases
// land in M1 against the store seam (see specs/reference/acceptance-matrix.md).
describe('data model constants', () => {
	it('pins the fixed enum sizes (CND-1, ADR-012, CBT-1)', () => {
		expect(CONDITIONS).toHaveLength(12);
		expect(COLOR_TAGS).toHaveLength(8);
		expect(COMBATANT_TYPES).toHaveLength(3);
	});

	it('pins the hard caps and data version (see specs/reference/limits.md, ADR-013)', () => {
		expect(MAX_COMBATANTS).toBe(30);
		expect(MAX_COMBATS).toBe(100);
		expect(DATA_VERSION).toBe(2);
	});
});
