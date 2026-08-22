import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility audit', () => {
	test('homepage has no critical or serious axe violations', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const results = await new AxeBuilder({ page }).analyze();
		const blockingViolations = results.violations.filter(
			(violation) => violation.impact === 'critical' || violation.impact === 'serious'
		);

		expect(blockingViolations).toEqual([]);
	});

	test('keyboard users can reach key controls with visible focus', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');

		await page.keyboard.press('Tab');
		const skipLink = page.getByRole('link', { name: 'Zum Hauptinhalt springen' });
		await expect(skipLink).toBeVisible();
		await expect(skipLink).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(page.locator('main#main-content')).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', { name: 'Befehlspalette öffnen' })).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(page.getByRole('dialog', { name: 'Befehlspalette' })).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Befehlspalette' })).not.toBeVisible();
	});
});
