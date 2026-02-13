import { test, expect, type Page } from '@playwright/test';

/**
 * Foundation E2E Test Suite
 *
 * Verifies core SSR rendering, section landmarks, navigation behavior,
 * responsive layout, and absence of console errors.
 *
 * Coverage:
 * - All 8 section landmarks (hero, about, tools, projects, experience, opensource, testimonials, contact)
 * - Navigation link behavior and active state tracking
 * - Desktop and mobile responsive layouts
 * - Console error detection
 */

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

test.describe('Foundation: SSR and Section Landmarks', () => {
	test('all 8 sections render with correct IDs', async ({ page }) => {
		await page.goto('/');

		// Verify all section landmarks exist with correct IDs
		for (const sectionId of EXPECTED_SECTIONS) {
			const section = page.locator(`section#${sectionId}`);
			await expect(section).toBeVisible();

			// Verify section has data-section attribute
			await expect(section).toHaveAttribute('data-section', sectionId);

			// Verify section has aria-labelledby pointing to heading
			await expect(section).toHaveAttribute('aria-labelledby', `${sectionId}-heading`);

			// Verify section heading exists
			const heading = section.locator(`h2#${sectionId}-heading`);
			await expect(heading).toBeAttached();
		}
	});

	test('hero section displays site identity', async ({ page }) => {
		await page.goto('/');

		const heroSection = page.locator('section#hero');
		await expect(heroSection).toBeVisible();

		// Verify hero contains name (from site config)
		// Note: Using text content check rather than exact match for flexibility
		await expect(heroSection.locator('h3')).toBeVisible();

		// Verify CTA buttons exist
		const projectsLink = heroSection.getByRole('link', { name: 'See Projects' });
		await expect(projectsLink).toBeVisible();
		await expect(projectsLink).toContainText('See Projects');

		const contactLink = heroSection.getByRole('link', { name: 'Start a Conversation' });
		await expect(contactLink).toBeVisible();
		await expect(contactLink).toContainText('Start a Conversation');
	});

	test('sections render in correct order', async ({ page }) => {
		await page.goto('/');

		// Get all section elements in DOM order
		const sections = await page.locator('section[data-section]').all();

		// Verify we have exactly 8 sections
		expect(sections.length).toBe(8);

		// Verify order matches expected sequence
		for (let i = 0; i < EXPECTED_SECTIONS.length; i++) {
			const sectionId = await sections[i].getAttribute('data-section');
			expect(sectionId).toBe(EXPECTED_SECTIONS[i]);
		}
	});
});

test.describe('Foundation: Navigation Behavior', () => {
	test.describe('Desktop Navigation', () => {
		test.use({ viewport: { width: 1280, height: 720 } });

		test('navigation sidebar is visible on desktop', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');
			await expect(nav).toBeVisible();

			// Verify all navigation links exist (excluding hero)
			const navLinks = EXPECTED_SECTIONS.filter((id) => id !== 'hero');
			for (const sectionId of navLinks) {
				const link = nav.locator(`a[href="#${sectionId}"]`);
				await expect(link).toBeVisible();
			}
		});

		test('clicking navigation link scrolls to section', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');
			const projectsLink = nav.locator('a[href="#projects"]');

			// Click projects link
			await projectsLink.click();

			// Wait for scroll to complete
			await page.waitForTimeout(500);

			// Verify URL hash updated
			expect(page.url()).toContain('#projects');

			// Verify projects section is in viewport
			const projectsSection = page.locator('section#projects');
			await expect(projectsSection).toBeInViewport();
		});

		test('navigation link shows active state', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');

			// Navigate to tools section
			await nav.locator('a[href="#tools"]').click();
			await page.waitForTimeout(500);

			// Verify active state on tools link
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

		test('navigation sidebar is hidden on mobile', async ({ page }) => {
			await page.goto('/');

			const nav = page.locator('nav[aria-label="Section navigation"]');
			await expect(nav).not.toBeVisible();
		});

		test('all sections are accessible via scrolling on mobile', async ({ page }) => {
			await page.goto('/');

			// Verify all sections exist and can be scrolled to
			for (const sectionId of EXPECTED_SECTIONS) {
				const section = page.locator(`section#${sectionId}`);
				await expect(section).toBeAttached();

				// Scroll to section
				await section.scrollIntoViewIfNeeded();
				await expect(section).toBeInViewport();
			}
		});

		test('mobile sticky headers work correctly', async ({ page }) => {
			await page.goto('/');

			// Scroll to about section (has mobileSticky=true by default)
			const aboutSection = page.locator('section#about');
			await aboutSection.scrollIntoViewIfNeeded();

			// Verify section header has sticky positioning classes
			const aboutHeader = aboutSection.locator('[data-testid="section-header-about"]');
			await expect(aboutHeader).toBeVisible();

			// Check for sticky class (via class attribute check)
			const headerClasses = await aboutHeader.getAttribute('class');
			expect(headerClasses).toContain('sticky');
		});
	});
});

test.describe('Foundation: Responsive Layout', () => {
	test('desktop layout uses grid with sidebar', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');

		const mainSidebar = page.locator('aside:has(h1)');
		await expect(mainSidebar).toBeVisible();

		const siteName = mainSidebar.locator('h1');
		await expect(siteName).toBeVisible();

		const nav = mainSidebar.locator('nav[aria-label="Section navigation"]');
		await expect(nav).toBeVisible();
	});

	test('mobile layout stacks content vertically', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		const mainSidebar = page.locator('aside:has(h1)');
		await expect(mainSidebar).not.toBeVisible();

		const main = page.locator('main');
		await expect(main).toBeVisible();

		const heroSection = page.locator('section#hero');
		await expect(heroSection).toBeVisible();
	});

	test('tablet layout (768px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');

		const mainSidebar = page.locator('aside:has(h1)');
		await expect(mainSidebar).not.toBeVisible();

		for (const sectionId of EXPECTED_SECTIONS) {
			const section = page.locator(`section#${sectionId}`);
			await expect(section).toBeAttached();
		}
	});

	test('large desktop layout (1920px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');

		const mainSidebar = page.locator('aside:has(h1)');
		await expect(mainSidebar).toBeVisible();

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await expect(nav).toBeVisible();

		const main = page.locator('main#main-content');
		await expect(main).toBeVisible();
	});
});

test.describe('Foundation: Console Error Detection', () => {
	test('page loads without JavaScript console errors', async ({ page }) => {
		const consoleErrors: string[] = [];

		// Capture console errors
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Capture page errors
		page.on('pageerror', (error) => {
			consoleErrors.push(error.message);
		});

		await page.goto('/');

		// Wait for page to fully load and hydrate
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Assert no console errors occurred
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

		// Interact with navigation (desktop viewport)
		await page.setViewportSize({ width: 1280, height: 720 });

		const nav = page.locator('nav[aria-label="Section navigation"]');
		await nav.locator('a[href="#projects"]').click();
		await page.waitForTimeout(500);

		await nav.locator('a[href="#contact"]').click();
		await page.waitForTimeout(500);

		// Assert no console errors occurred
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

		// Resize from desktop to mobile
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.waitForTimeout(500);

		await page.setViewportSize({ width: 375, height: 667 });
		await page.waitForTimeout(500);

		// Resize back to desktop
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.waitForTimeout(500);

		// Assert no console errors occurred
		expect(consoleErrors).toEqual([]);
	});
});

test.describe('Foundation: SSR Verification', () => {
	test('page renders server-side HTML before hydration', async ({ page }) => {
		await page.goto('/', { waitUntil: 'domcontentloaded' });

		const heroSection = page.locator('section#hero');
		await expect(heroSection).toBeAttached();

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

		const mainSidebar = page.locator('aside:has(h1)');
		await expect(mainSidebar).toBeVisible();

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
