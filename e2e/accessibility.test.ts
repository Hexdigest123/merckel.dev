import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility audit and motion preferences', () => {
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
		const skipLink = page.getByRole('link', { name: 'Skip to main content' });
		await expect(skipLink).toBeVisible();
		await expect(skipLink).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(page.locator('main#main-content')).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', { name: 'Open command palette' })).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Command palette' })).not.toBeVisible();
	});

	test('reduced motion mode disables heavy motion effects', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expect(page.locator('.scene-shell')).toHaveCount(0);

		const hasCustomCursor = await page.evaluate(() =>
			document.documentElement.classList.contains('has-custom-cursor')
		);
		expect(hasCustomCursor).toBe(false);
	});
});
