import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';

// W-046: CombatFormDialog is loaded by a dynamic `import()` behind create-intent, so its
// bits-ui/vaul chunk set stays out of `/` and `/combats`'s eager route closure.
//
// Note on what is asserted and why: a closed bits-ui dialog renders NOTHING, so
// `getByRole('dialog')` is absent whether the component is deferred or statically mounted with
// `open=false` — a DOM-absence assertion alone passes even against a fully eager import and proves
// nothing. The deferral is only observable as a module-graph fact, so the mock factory below
// doubles as an import probe: it runs exactly once, the first time the specifier is imported by
// anyone. `importedAt` therefore records *when the chunk would have been fetched*.
const importProbe = vi.fn();
vi.mock('$lib/components/app/CombatFormDialog.svelte', async () => {
	importProbe();
	return await vi.importActual('$lib/components/app/CombatFormDialog.svelte');
});

const store = {
	ready: true,
	combats: [] as never[],
	getCombat: vi.fn(() => null),
	createCombat: vi.fn(() => null),
	editCombat: vi.fn(),
	deleteCombat: vi.fn(),
	reorderCombats: vi.fn(),
};
vi.mock('$lib/stores', () => ({ store }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

test('CombatFormDialog is not imported or rendered until the create control is activated', async () => {
	// With no combats the empty state renders its desktop CTA (`hidden lg:inline-flex`) and the
	// mobile FAB (`lg:hidden`); pin a desktop viewport so the CTA is the visible one of the two.
	await page.viewport(1280, 800);

	const screen = render((await import('./CombatsHome.svelte')).default);

	await expect.element(screen.getByText(m['combats.empty.title']())).toBeVisible();
	expect(importProbe).not.toHaveBeenCalled();
	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combat.create.title']() }))
		.not.toBeInTheDocument();

	await screen.getByRole('button', { name: m['combats.empty.cta']() }).first().click();

	// One activation must both load the module and open it — a load-on-first-tap,
	// open-on-second-tap regression fails here.
	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combat.create.title']() }))
		.toBeVisible();
	expect(importProbe).toHaveBeenCalledOnce();
});
