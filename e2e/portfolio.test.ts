import { expect, test, type Page } from '@playwright/test';

const EXPECTED_SECTIONS = [
	'tools',
	'projects',
	'pentests',
	'experience',
	'opensource',
	'testimonials',
	'contact'
] as const;

const MOBILE_CONFIG = {
	viewport: { width: 390, height: 844 },
	userAgent:
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
	isMobile: true,
	hasTouch: true
} as const;

async function expectSectionCoverage(page: Page) {
	for (const sectionId of EXPECTED_SECTIONS) {
		const section = page.locator(`section#${sectionId}`);
		await expect(section).toBeAttached();
		await section.scrollIntoViewIfNeeded();
		await expect(section).toBeInViewport();
	}
}

test.describe('Portfolio coverage', () => {
	test('desktop renders identity and all core sections without 3D', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expect(page.getByRole('heading', { level: 1 })).toContainText('Pierre-Maurice Merckel');
		await expect(
			page
				.locator('header[aria-label="Site identity"]')
				.getByText('Geschäftsführer und Softwareentwickler')
		).toBeVisible();
		await expect(page.locator('section#about')).toHaveCount(0);
		await expect(page.locator('.scene-shell')).toHaveCount(0);
		await expect(page.locator('canvas')).toHaveCount(0);
		await expectSectionCoverage(page);
	});

	test.describe('mobile viewport', () => {
		test.use(MOBILE_CONFIG);

		test('mobile shows all sections without 3D canvas', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			await expectSectionCoverage(page);
			await expect(page.locator('.scene-shell')).toHaveCount(0);
			await expect(page.locator('canvas')).toHaveCount(0);
		});
	});

	test('command palette opens with keyboard shortcut and navigates to projects', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await page.keyboard.press('ControlOrMeta+K');
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

	test('contact section shows mailto and social links', async ({ page }) => {
		await page.goto('/#contact');
		const contactSection = page.locator('section#contact');
		await contactSection.scrollIntoViewIfNeeded();
		await expect(contactSection).toBeInViewport();
		await expect(contactSection.locator('a[href^="mailto:"]').first()).toBeVisible();
		await expect(contactSection.locator('[data-testid="contact-socials"] a').first()).toBeVisible();
		await expect(contactSection.locator('form')).toHaveCount(0);
	});

	test('realistic user journey emits no console or page errors', async ({ page }) => {
		const errors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		page.on('pageerror', (error) => {
			errors.push(error.message);
		});

		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Befehlspalette öffnen' }).click();
		const commandInput = page.getByRole('textbox', { name: 'Befehlseingabe' });
		await commandInput.fill('contact');
		await commandInput.press('Enter');
		await expect(page).toHaveURL(/#contact$/);

		const contactSection = page.locator('section#contact');
		await expect(contactSection.locator('a[href^="mailto:"]').first()).toBeVisible();
		await expect(contactSection.locator('[data-testid="contact-socials"] a').first()).toBeVisible();
		await expect(contactSection.locator('form')).toHaveCount(0);

		expect(errors).toEqual([]);
	});
});
