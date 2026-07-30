import { expect, test, vi } from 'vitest';
import { page as browserPage } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import { createCombat } from '$lib/stores/domain/factories';

// W-054: CombatantForm (→ ResponsiveModal → bits-ui dialog + vaul drawer) is loaded by a dynamic
// `import()` behind add-intent, so its chunk set stays out of `/combats/[id]`'s eager route
// closure — the same closure the first-launch redirect from `/` lands on (W-046's finding).
//
// Same reasoning as CombatsHome.svelte.spec.ts: a closed bits-ui dialog renders nothing, so DOM
// absence alone can't distinguish "never imported" from "mounted with open=false". The mock
// factory below doubles as an import probe — it runs exactly once, the first time anyone imports
// the specifier.
const importProbe = vi.fn();
vi.mock('$lib/components/app/CombatantForm.svelte', async () => {
	importProbe();
	return await vi.importActual('$lib/components/app/CombatantForm.svelte');
});

const goto = vi.fn();
vi.mock('$app/navigation', () => ({ goto }));

const combat = createCombat({ title: 'Ogre Den' });

vi.mock('$app/state', () => ({
	page: { params: { id: combat.id }, url: new URL(`http://localhost/combats/${combat.id}`) },
}));

const store = {
	ready: true,
	combats: [combat],
	libraryEntries: [] as never[],
	getCombat: vi.fn(() => combat),
	rollOne: vi.fn(),
	setInitiative: vi.fn(),
	dealDamage: vi.fn(),
	restoreHp: vi.fn(),
	setTempHp: vi.fn(),
	addCondition: vi.fn(),
	removeCondition: vi.fn(),
	editCombatant: vi.fn(),
	duplicateCombatant: vi.fn(),
	toggleDisabled: vi.fn(),
	removeCombatant: vi.fn(),
	addCombatant: vi.fn(),
	createTemplateFromCombatant: vi.fn(),
	start: vi.fn(),
	advanceTurn: vi.fn(),
	undo: vi.fn(),
	redo: vi.fn(),
	clearCombat: vi.fn(),
	restart: vi.fn(),
	editRound: vi.fn(),
	setEscalation: vi.fn(),
};
vi.mock('$lib/stores', () => ({ store }));

test('CombatantForm is not imported or rendered until the Add control is activated', async () => {
	// The empty-roster Setup state renders both the desktop CTA (`hidden lg:inline-flex`) and the
	// mobile FAB (`lg:hidden`); pin a desktop viewport so the CTA is the visible one of the two.
	await browserPage.viewport(1280, 800);

	const screen = render((await import('./+page.svelte')).default);

	await expect.element(screen.getByText(m['setup.empty.title']())).toBeVisible();
	expect(importProbe).not.toHaveBeenCalled();
	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combatant.add.title']() }))
		.not.toBeInTheDocument();

	await screen.getByRole('button', { name: m['setup.empty.cta']() }).first().click();

	// One activation must both load the module and open it — a load-on-first-tap,
	// open-on-second-tap regression fails here.
	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combatant.add.title']() }))
		.toBeVisible();
	expect(importProbe).toHaveBeenCalledOnce();
});
