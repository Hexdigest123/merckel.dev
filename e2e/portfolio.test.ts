import { expect, test, type Page } from '@playwright/test';

const EXPECTED_SECTIONS = [
	'hero',
	'about',
	'tools',
	'projects',
	'experience',
	'opensource',
	'testimonials',
	'contact'
] as const;

const KONAMI_SEQUENCE = [
	'ArrowUp',
	'ArrowUp',
	'ArrowDown',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowLeft',
	'ArrowRight',
	'b',
	'a'
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

async function triggerKonamiCode(page: Page) {
	for (const key of KONAMI_SEQUENCE) {
		await page.keyboard.press(key);
	}
}

test.describe('Portfolio final coverage', () => {
	test('desktop renders all sections and 3D behavior is desktop-only when supported', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expectSectionCoverage(page);

		const reducedMotion = await page.evaluate(
			() => window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
		const hasWebglSupport = await page.evaluate(() => {
			const canvas = document.createElement('canvas');
			return Boolean(
				canvas.getContext('webgl2') ||
				canvas.getContext('webgl') ||
				canvas.getContext('experimental-webgl')
			);
		});

		const sceneShell = page.locator('.scene-shell');
		if (reducedMotion || !hasWebglSupport) {
			await expect(sceneShell).toHaveCount(0);
			return;
		}

		await expect(sceneShell).toHaveCount(1);
		await expect(sceneShell.locator('canvas')).toBeVisible({ timeout: 15000 });
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
		const dialog = page.getByRole('dialog', { name: 'Command palette' });
		await expect(dialog).toBeVisible();

		const input = page.getByRole('textbox', { name: 'Command input' });
		await input.fill('proj');
		await expect(dialog.getByRole('option', { name: 'Projects' })).toBeVisible();

		await input.press('Enter');
		await expect(dialog).not.toBeVisible();
		await expect(page).toHaveURL(/#projects$/);
		await expect(page.locator('section#projects')).toBeInViewport();
	});

	test('scroll reveal shows projects content in normal motion mode', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const projectsSection = page.locator('section#projects');
		const firstProjectCard = page
			.locator('[data-testid="projects-list"] [data-reveal-item]')
			.first();

		await expect(firstProjectCard).toBeAttached();
		await expect(projectsSection).not.toBeInViewport();

		await projectsSection.scrollIntoViewIfNeeded();
		await expect(projectsSection).toBeInViewport();
		await expect(firstProjectCard).toBeVisible();
		await expect
			.poll(async () => {
				return await firstProjectCard.evaluate((node) => {
					const style = window.getComputedStyle(node);
					return style.visibility !== 'hidden' && Number(style.opacity) > 0.9;
				});
			})
			.toBe(true);
	});

	test('contact form validates and submits with API success response', async ({ page }) => {
		await page.route('**/api/contact', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					message: 'Message sent successfully. I will reply soon.'
				})
			});
		});

		await page.goto('/#contact');
		const contactSection = page.locator('section#contact');
		await contactSection.scrollIntoViewIfNeeded();
		await expect(contactSection).toBeInViewport();
		const form = page.locator('section#contact form[aria-label="Contact form"]');
		await expect(form).toBeVisible();

		await form.getByRole('button', { name: 'Send inquiry' }).click();
		await expect(form.getByText('Name is required.')).toBeVisible();
		await expect(form.getByText('Email is required.')).toBeVisible();
		await expect(form.getByText('Project details are required.')).toBeVisible();

		await form.getByRole('textbox', { name: 'Name' }).fill('Final E2E User');
		await form.getByRole('textbox', { name: 'Email' }).fill('final-e2e@example.com');
		await form
			.getByRole('textbox', { name: 'Project details' })
			.fill('Verify Task 20 submission flow.');
		await form.getByRole('button', { name: 'Send inquiry' }).click();

		await expect(form.getByRole('status')).toContainText(
			'Message sent successfully. I will reply soon.'
		);
		await expect(form.getByRole('textbox', { name: 'Name' })).toHaveValue('');
		await expect(form.getByRole('textbox', { name: 'Email' })).toHaveValue('');
		await expect(form.getByRole('textbox', { name: 'Project details' })).toHaveValue('');
	});

	test('desktop custom cursor responds to pointer and interactive links', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');

		const cursor = page.locator('.custom-cursor');
		await expect(cursor).toBeAttached();

		await page.mouse.move(100, 100);
		await expect
			.poll(async () =>
				page.evaluate(() => document.documentElement.classList.contains('has-custom-cursor'))
			)
			.toBe(true);
		await expect(cursor).toHaveClass(/is-enabled/);

		await page.getByRole('link', { name: 'See Projects' }).hover();
		await expect(cursor).toHaveAttribute('data-variant', 'link');
	});

	test('konami code displays activation message', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await triggerKonamiCode(page);
		await expect(page.getByText(/Konami Code Activated!/)).toBeVisible();
	});

	test('reduced motion disables scene and custom cursor behavior', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expect(page.locator('.scene-shell')).toHaveCount(0);
		await expect
			.poll(async () =>
				page.evaluate(() => document.documentElement.classList.contains('has-custom-cursor'))
			)
			.toBe(false);
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

		await page.route('**/api/contact', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					message: 'Message sent successfully. I will reply soon.'
				})
			});
		});

		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Open command palette' }).click();
		const commandInput = page.getByRole('textbox', { name: 'Command input' });
		await commandInput.fill('contact');
		await commandInput.press('Enter');
		await expect(page).toHaveURL(/#contact$/);

		const form = page.getByRole('form', { name: 'Contact form' });
		await form.getByRole('textbox', { name: 'Name' }).fill('Console Journey');
		await form.getByRole('textbox', { name: 'Email' }).fill('journey@example.com');
		await form
			.getByRole('textbox', { name: 'Project details' })
			.fill('Run full interaction sweep.');
		await form.getByRole('button', { name: 'Send inquiry' }).click();
		await expect(form.getByRole('status')).toContainText(
			'Message sent successfully. I will reply soon.'
		);

		await triggerKonamiCode(page);
		await expect(page.getByText(/Konami Code Activated!/)).toBeVisible();

		expect(errors).toEqual([]);
	});
});
