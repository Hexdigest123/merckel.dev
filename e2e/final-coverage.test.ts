import { expect, test } from '@playwright/test';

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

async function expectAllSectionsReachable(page: import('@playwright/test').Page) {
	for (const sectionId of EXPECTED_SECTIONS) {
		const section = page.locator(`section#${sectionId}`);
		await expect(section).toBeAttached();
		await section.scrollIntoViewIfNeeded();
		await expect(section).toBeInViewport();
	}
}

test.describe('Final E2E coverage: viewport and rendering behavior', () => {
	test('desktop shows all sections and handles 3D rendering gracefully', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expectAllSectionsReachable(page);

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
		const canvas = sceneShell.locator('canvas');
		await expect(canvas).toBeVisible({ timeout: 15000 });

		const box = await canvas.boundingBox();
		expect(box).toBeTruthy();
		expect(box?.width ?? 0).toBeGreaterThan(0);
		expect(box?.height ?? 0).toBeGreaterThan(0);
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

test.describe('Final E2E coverage: interactions and accessibility-sensitive flows', () => {
	test('command palette opens, filters, and navigates to a section', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');

		await page.getByRole('button', { name: 'Open command palette' }).click();
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

	test('contact form validates and then submits successfully', async ({ page }) => {
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

		await form.getByRole('textbox', { name: 'Name' }).fill('Test User');
		await form.getByRole('textbox', { name: 'Email' }).fill('not-an-email');
		await form
			.getByRole('textbox', { name: 'Project details' })
			.fill('Build an interactive portfolio.');
		await form.getByRole('button', { name: 'Send inquiry' }).click();
		await expect(form.getByText('Enter a valid email address.')).toBeVisible();

		await form.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
		await form.getByRole('button', { name: 'Send inquiry' }).click();

		await expect(form.getByRole('status')).toContainText(
			'Message sent successfully. I will reply soon.'
		);
		await expect(form.getByRole('textbox', { name: 'Name' })).toHaveValue('');
		await expect(form.getByRole('textbox', { name: 'Email' })).toHaveValue('');
		await expect(form.getByRole('textbox', { name: 'Project details' })).toHaveValue('');
	});

	test('desktop custom cursor enables and reacts to interactive elements', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');

		const cursor = page.locator('.custom-cursor');
		await expect(cursor).toBeAttached();

		await page.mouse.move(80, 80);
		await expect
			.poll(async () =>
				page.evaluate(() => document.documentElement.classList.contains('has-custom-cursor'))
			)
			.toBe(true);
		await expect(cursor).toHaveClass(/is-enabled/);

		await page.getByRole('link', { name: 'See Projects' }).hover();
		await expect(cursor).toHaveAttribute('data-variant', 'link');
	});

	test('konami easter path triggers activation message', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const sequence = [
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

		for (const key of sequence) {
			await page.keyboard.press(key);
		}

		await expect(page.getByText(/Konami Code Activated!/)).toBeVisible();
	});

	test('reduced motion disables heavy effects and custom cursor', async ({ page }) => {
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
		const paletteInput = page.getByRole('textbox', { name: 'Command input' });
		await paletteInput.fill('contact');
		await paletteInput.press('Enter');
		await expect(page).toHaveURL(/#contact$/);

		const form = page.getByRole('form', { name: 'Contact form' });
		await form.getByRole('textbox', { name: 'Name' }).fill('Console Test');
		await form.getByRole('textbox', { name: 'Email' }).fill('console@example.com');
		await form
			.getByRole('textbox', { name: 'Project details' })
			.fill('Run a production-ready interaction verification.');
		await form.getByRole('button', { name: 'Send inquiry' }).click();
		await expect(form.getByRole('status')).toContainText(
			'Message sent successfully. I will reply soon.'
		);

		await page.evaluate(() => {
			const sequence = [
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
			];
			for (const key of sequence) {
				window.dispatchEvent(new KeyboardEvent('keydown', { key }));
			}
		});
		await expect(page.getByText('Konami Code Activated!')).toBeVisible();

		expect(consoleErrors).toEqual([]);
	});
});
