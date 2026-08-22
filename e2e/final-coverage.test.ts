import { expect, test } from '@playwright/test';

const EXPECTED_SECTIONS = [
	'tools',
	'projects',
	'pentests',
	'experience',
	'opensource',
	'testimonials',
	'contact'
] as const;

async function expectAllSectionsReachable(page: import('@playwright/test').Page) {
	for (const sectionId of EXPECTED_SECTIONS) {
		const section = page.locator(`section#${sectionId}`);
		await expect(section).toBeAttached();
		await section.scrollIntoViewIfNeeded();
		await expect(section).toBeInViewport();
	}
}

test.describe('Final E2E coverage: viewport and rendering behavior', () => {
	test('desktop shows all sections without 3D', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expectAllSectionsReachable(page);
		await expect(page.locator('.scene-shell')).toHaveCount(0);
		await expect(page.locator('canvas')).toHaveCount(0);
	});
});

test.describe('Final E2E coverage: mobile rendering', () => {
	test.use({
		viewport: { width: 390, height: 844 },
		userAgent:
			'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
		isMobile: true,
		hasTouch: true
	});

	test('mobile shows all sections without 3D canvas', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expectAllSectionsReachable(page);
		await expect(page.locator('.scene-shell')).toHaveCount(0);
		await expect(page.locator('canvas')).toHaveCount(0);
	});
});

test.describe('Final E2E coverage: interactions', () => {
	test('command palette opens, filters, and navigates to a section', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');

		await page.getByRole('button', { name: 'Befehlspalette öffnen' }).click();
		const dialog = page.getByRole('dialog', { name: 'Befehlspalette' });
		await expect(dialog).toBeVisible();

		const input = page.getByRole('textbox', { name: 'Befehlseingabe' });
		await input.fill('proj');
		await expect(dialog.getByRole('option', { name: /Projekte/ })).toBeVisible();

		await input.press('Enter');
		await expect(dialog).not.toBeVisible();
		await expect(page).toHaveURL(/#projects$/);
		await expect(page.locator('section#projects')).toBeInViewport();
	});

	test('contact section exposes mailto and social links', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/#contact');

		const contactSection = page.locator('section#contact');
		await contactSection.scrollIntoViewIfNeeded();
		await expect(contactSection).toBeInViewport();
		await expect(contactSection.locator('a[href^="mailto:"]').first()).toBeVisible();
		await expect(contactSection.locator('[data-testid="contact-socials"] a').first()).toBeVisible();
		await expect(contactSection.locator('form')).toHaveCount(0);
	});
});

test.describe('Final E2E coverage: console stability', () => {
	test('core user journey emits no console errors', async ({ page }) => {
		const consoleErrors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		page.on('pageerror', (error) => {
			consoleErrors.push(error.message);
		});

		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Befehlspalette öffnen' }).click();
		const paletteInput = page.getByRole('textbox', { name: 'Befehlseingabe' });
		await paletteInput.fill('contact');
		await paletteInput.press('Enter');
		await expect(page).toHaveURL(/#contact$/);

		const contactSection = page.locator('section#contact');
		await expect(contactSection.locator('a[href^="mailto:"]').first()).toBeVisible();
		await expect(contactSection.locator('[data-testid="contact-socials"] a').first()).toBeVisible();
		await expect(contactSection.locator('form')).toHaveCount(0);

		expect(consoleErrors).toEqual([]);
	});
});
