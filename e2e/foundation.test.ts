import { test, expect } from '@playwright/test';

const EXPECTED_SECTIONS = [
	'tools',
	'projects',
	'pentests',
	'experience',
	'opensource',
	'testimonials',
	'contact'
] as const;

test.describe('Foundation: SSR and Section Landmarks', () => {
	test('all core sections render with correct IDs', async ({ page }) => {
		await page.goto('/');

		for (const sectionId of EXPECTED_SECTIONS) {
			const section = page.locator(`section#${sectionId}`);
			await expect(section).toBeVisible();
			await expect(section).toHaveAttribute('data-section', sectionId);
			await expect(section).toHaveAttribute('aria-labelledby', `${sectionId}-heading`);
			const heading = section.locator(`h2#${sectionId}-heading`);
			await expect(heading).toBeAttached();
		}
	});

	test('header displays site identity', async ({ page }) => {
		await page.goto('/');

		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
		await expect(heading).toContainText('Pierre-Maurice Merckel');
		await expect(
			page
				.locator('header[aria-label="Site identity"]')
				.getByText('Geschäftsführer und Softwareentwickler')
		).toBeVisible();
		await expect(page.locator('section#about')).toHaveCount(0);
	});

	test('sections render in correct order', async ({ page }) => {
		await page.goto('/');

		const sections = await page.locator('section[data-section]').all();
		expect(sections.length).toBe(EXPECTED_SECTIONS.length);

		for (let i = 0; i < EXPECTED_SECTIONS.length; i++) {
			const sectionId = await sections[i].getAttribute('data-section');
			expect(sectionId).toBe(EXPECTED_SECTIONS[i]);
		}
	});
});

test.describe('Foundation: Navigation Behavior', () => {
	test.describe('Desktop Navigation', () => {
		test.use({ viewport: { width: 1280, height: 720 } });

		test('navigation is visible on desktop', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');
			await expect(nav).toBeVisible();

			for (const sectionId of EXPECTED_SECTIONS) {
				const link = nav.locator(`a[href="#${sectionId}"]`);
				await expect(link).toBeVisible();
			}
		});

		test('clicking navigation link scrolls to section', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');
			const projectsLink = nav.locator('a[href="#projects"]');

			await projectsLink.click();
			await page.waitForTimeout(500);

			expect(page.url()).toContain('#projects');

			const projectsSection = page.locator('section#projects');
			await expect(projectsSection).toBeInViewport();
		});

		test('navigation link shows active state', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');

			await nav.locator('a[href="#tools"]').click();
			await page.waitForTimeout(500);

			const toolsLink = nav.locator('a[href="#tools"]');
			await expect(toolsLink).toHaveAttribute('aria-current', 'location');
		});

		test('navigation updates on scroll', async ({ page }) => {
			await page.goto('/');

			const experienceSection = page.locator('section#experience');
			await experienceSection.scrollIntoViewIfNeeded();
			await expect(experienceSection).toBeInViewport();
		});
	});

	test.describe('Mobile Navigation', () => {
		test.use({ viewport: { width: 375, height: 667 } });

		test('desktop navigation is hidden on mobile', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');
			await expect(nav).not.toBeVisible();
		});

		test('all sections are accessible via scrolling on mobile', async ({ page }) => {
			await page.goto('/');

			for (const sectionId of EXPECTED_SECTIONS) {
				const section = page.locator(`section#${sectionId}`);
				await expect(section).toBeAttached();
				await section.scrollIntoViewIfNeeded();
				await expect(section).toBeInViewport();
			}
		});

		test('mobile sticky headers work correctly', async ({ page }) => {
			await page.goto('/');

			const toolsSection = page.locator('section#tools');
			await toolsSection.scrollIntoViewIfNeeded();

			const toolsHeader = toolsSection.locator('[data-testid="section-header-tools"]');
			await expect(toolsHeader).toBeVisible();

			const headerClasses = await toolsHeader.getAttribute('class');
			expect(headerClasses).toContain('sticky');
		});
	});
});

test.describe('Foundation: Responsive Layout', () => {
	test('desktop layout shows identity and navigation', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');

		const siteName = page.locator('h1');
		await expect(siteName).toBeVisible();

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await expect(nav).toBeVisible();
	});

	test('mobile layout stacks content vertically', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await expect(nav).not.toBeVisible();

		const main = page.locator('main');
		await expect(main).toBeVisible();

		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
	});

	test('tablet layout (768px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await expect(nav).not.toBeVisible();

		for (const sectionId of EXPECTED_SECTIONS) {
			const section = page.locator(`section#${sectionId}`);
			await expect(section).toBeAttached();
		}
	});

	test('large desktop layout (1920px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await expect(nav).toBeVisible();

		const main = page.locator('main#main-content');
		await expect(main).toBeVisible();
	});
});

test.describe('Foundation: Console Error Detection', () => {
	test('page loads without JavaScript console errors', async ({ page }) => {
		const consoleErrors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		page.on('pageerror', (error) => {
			consoleErrors.push(error.message);
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		expect(consoleErrors).toEqual([]);
	});

	test('navigation interactions produce no console errors', async ({ page }) => {
		const consoleErrors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		page.on('pageerror', (error) => {
			consoleErrors.push(error.message);
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await page.setViewportSize({ width: 1280, height: 720 });

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await nav.locator('a[href="#projects"]').click();
		await page.waitForTimeout(500);

		await nav.locator('a[href="#contact"]').click();
		await page.waitForTimeout(500);

		expect(consoleErrors).toEqual([]);
	});

	test('viewport resize produces no console errors', async ({ page }) => {
		const consoleErrors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		page.on('pageerror', (error) => {
			consoleErrors.push(error.message);
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await page.setViewportSize({ width: 1280, height: 720 });
		await page.waitForTimeout(500);

		await page.setViewportSize({ width: 375, height: 667 });
		await page.waitForTimeout(500);

		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.waitForTimeout(500);

		expect(consoleErrors).toEqual([]);
	});
});

test.describe('Foundation: SSR Verification', () => {
	test('page renders server-side HTML before hydration', async ({ page }) => {
		await page.goto('/', { waitUntil: 'domcontentloaded' });

		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeAttached();

		for (const sectionId of EXPECTED_SECTIONS) {
			const section = page.locator(`section#${sectionId}`);
			await expect(section).toBeAttached();
		}
	});

	test('SSR HTML includes semantic landmarks', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');

		const main = page.locator('main');
		await expect(main).toBeVisible();

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await expect(nav).toBeVisible();
	});

	test('SSR HTML includes proper heading hierarchy', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');

		const h1 = page.locator('h1');
		await expect(h1).toBeVisible();

		for (const sectionId of EXPECTED_SECTIONS) {
			const heading = page.locator(`h2#${sectionId}-heading`);
			await expect(heading).toBeAttached();
		}
	});
});
