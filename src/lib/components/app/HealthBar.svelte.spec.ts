import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Combatant, HpLogEntry } from '$lib/db/types';
import { createCombatant } from '$lib/stores/domain/factories';
import HealthBar from './HealthBar.svelte';

// Fill/temp-fill percentages per healthStatus band, clamp behavior at -maxHp, and the
// reverse/alarm ("ml-auto" + bg-health-dead) styling that only applies once dead.
function combatant(over: Partial<Combatant> = {}): Combatant {
	return { ...createCombatant({ name: 'Ogre', maxHp: 100 }, 0, () => 'ogre'), ...over };
}

function widthPercent(el: Element): number {
	return Number.parseFloat((el as HTMLElement).style.width);
}

describe('HealthBar', () => {
	it('full band: fills 100%, no temp segment, full color, correct a11y label', async () => {
		const screen = render(HealthBar, { combatant: combatant({ currentHp: 100 }) });

		const bar = screen.getByRole('img').element() as HTMLElement;
		expect(bar.getAttribute('aria-label')).toBe('Ogre: Full, 100 of 100 HP');
		expect(bar.children).toHaveLength(1);

		const fillEl = bar.children[0];
		expect(widthPercent(fillEl)).toBe(100);
		expect(fillEl.className).toContain('bg-health-full');
		expect(fillEl.className).not.toContain('ml-auto');
	});

	it('wounded band: fill/temp-fill scale against maxHp + tempHp', async () => {
		const screen = render(HealthBar, { combatant: combatant({ currentHp: 60, tempHp: 20 }) });

		const bar = screen.getByRole('img').element() as HTMLElement;
		expect(bar.getAttribute('aria-label')).toBe('Ogre: Wounded, 60 of 100 HP');
		expect(bar.children).toHaveLength(2);

		const [fillEl, tempEl] = bar.children;
		// denom = maxHp(100) + tempHp(20) = 120 -> fill 60/120=50%, temp 20/120≈16.67%
		expect(widthPercent(fillEl)).toBe(50);
		expect(fillEl.className).toContain('bg-health-wounded');
		expect(widthPercent(tempEl)).toBeCloseTo(16.6667, 3);
		expect(tempEl.className).toContain('bg-combat-blue');
	});

	it('bloodied band: fill percentage reads currentHp / maxHp with no temp HP', async () => {
		const screen = render(HealthBar, { combatant: combatant({ currentHp: 49 }) });

		const bar = screen.getByRole('img').element() as HTMLElement;
		expect(bar.getAttribute('aria-label')).toBe('Ogre: Bloodied, 49 of 100 HP');
		expect(bar.children).toHaveLength(1);
		expect(widthPercent(bar.children[0])).toBe(49);
		expect(bar.children[0].className).toContain('bg-health-bloodied');
	});

	it('dead band: clamps fill to 100% at exactly -maxHp, hides temp segment, reverses + alarms', async () => {
		const screen = render(HealthBar, {
			combatant: combatant({ currentHp: -100, tempHp: 15 }),
		});

		const bar = screen.getByRole('img').element() as HTMLElement;
		expect(bar.getAttribute('aria-label')).toBe('Ogre: Dead, -100 of 100 HP');
		// tempHp is ignored once dead: no second (temp) segment renders.
		expect(bar.children).toHaveLength(1);

		const fillEl = bar.children[0];
		expect(widthPercent(fillEl)).toBe(100);
		expect(fillEl.className).toContain('bg-health-dead');
		expect(fillEl.className).toContain('ml-auto');
	});

	it('dead band: clamps fill at 100% for currentHp deeper than -maxHp', async () => {
		const screen = render(HealthBar, { combatant: combatant({ currentHp: -250 }) });

		const bar = screen.getByRole('img').element() as HTMLElement;
		expect(bar.getAttribute('aria-label')).toBe('Ogre: Dead, -250 of 100 HP');
		expect(bar.children).toHaveLength(1);
		expect(widthPercent(bar.children[0])).toBe(100);
	});
});

// The direction flash is driven by the last hpLog entry rather than a remembered HP baseline, and
// is read through `{@const}` — which is a derived, so its body re-runs whenever the `combatant`
// prop changes identity. The store hands out a fresh object on every edit to a combatant, so these
// pin the two ways that bit: a swallowed first hit, and a flash torn down by an unrelated edit.
describe('HealthBar damage/heal flash', () => {
	function log(over: Partial<HpLogEntry> = {}): HpLogEntry {
		return {
			id: 'e1',
			type: 'damage',
			delta: -10,
			currentHp: 90,
			tempHp: 0,
			maxHp: 100,
			round: null,
			...over,
		};
	}

	function flash(screen: { getByRole: (r: string) => { element: () => Element } }): Element | null {
		return screen.getByRole('img').element().querySelector('.animate-health-flash');
	}

	it('does not flash on mount, even when the log already holds a hit', async () => {
		const screen = render(HealthBar, {
			combatant: combatant({ currentHp: 90, hpLog: [log()] }),
		});

		expect(flash(screen)).toBeNull();
	});

	it("flashes red on a fresh combatant's very first hit", async () => {
		const screen = render(HealthBar, { combatant: combatant({ currentHp: 100, hpLog: [] }) });
		expect(flash(screen)).toBeNull();

		await screen.rerender({ combatant: combatant({ currentHp: 90, hpLog: [log()] }) });

		expect(flash(screen)?.className).toContain('bg-combat-red');
	});

	it('flashes green on a heal', async () => {
		const screen = render(HealthBar, { combatant: combatant({ currentHp: 90, hpLog: [log()] }) });

		await screen.rerender({
			combatant: combatant({
				currentHp: 100,
				hpLog: [log(), log({ id: 'e2', type: 'heal', delta: 10, currentHp: 100 })],
			}),
		});

		expect(flash(screen)?.className).toContain('bg-combat-green');
	});

	it('survives an unrelated edit that only changes the combatant object identity', async () => {
		const screen = render(HealthBar, { combatant: combatant({ currentHp: 100, hpLog: [] }) });
		await screen.rerender({ combatant: combatant({ currentHp: 90, hpLog: [log()] }) });
		expect(flash(screen)).not.toBeNull();

		// Same HP, same log — only the surrounding record changed, as it does when the DM renames
		// the combatant or toggles a condition mid-fade.
		await screen.rerender({
			combatant: combatant({ name: 'Ogre Chief', currentHp: 90, hpLog: [log()] }),
		});

		expect(flash(screen)).not.toBeNull();
	});
});
