import { expect, test } from '@playwright/test';

// Smoke E2E (Playwright, ADR-009). Full F1–F5 flows + offline + PWA update + import
// fail-safe land in later milestones.
test('first launch opens the auto-created combat', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/combats\/[^/]+\/?$/);
});
