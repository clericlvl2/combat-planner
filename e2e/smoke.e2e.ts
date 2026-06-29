import { expect, test } from '@playwright/test';

// Smoke E2E (Playwright, ADR-009). Full F1–F5 flows + offline + PWA update + import
// fail-safe land in later milestones (Test Plan §5).
test('first launch lands on the Combats home', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/combats\/?$/);
	await expect(page.getByRole('heading', { name: 'Combats' })).toBeVisible();
});
