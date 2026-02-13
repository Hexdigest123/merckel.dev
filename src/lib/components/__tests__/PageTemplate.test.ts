import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { experience } from '$lib/data/experience';
import { projects } from '$lib/data/projects';
import { siteConfig } from '$lib/data/site-config';
import { testimonials } from '$lib/data/testimonials';
import { tools } from '$lib/data/tools';
import Page from '../../../routes/+page.svelte';

const openSourceFixture = {
	source: 'fallback' as const,
	profileUrl: 'https://github.com/example',
	profileLabel: 'Visit GitHub profile',
	note: 'Fixture note',
	stats: [
		{ label: 'Public repositories', value: '8' },
		{ label: 'Featured builds', value: '4' },
		{ label: 'Linked channels', value: '4' }
	],
	contributions: [
		{
			id: 'fixture-1',
			title: 'Fixture Repository',
			description: 'Fixture repository description',
			tags: ['svelte', 'typescript'],
			url: 'https://github.com/example/fixture-repository'
		}
	]
};

function renderPage() {
	return render(Page, { props: { data: { openSource: openSourceFixture } } });
}

describe('Portfolio page templates', () => {
	it('renders all 8 required sections with shared section wrapper headers', () => {
		const { body } = renderPage();

		const sectionIds = [
			'hero',
			'about',
			'tools',
			'projects',
			'experience',
			'opensource',
			'testimonials',
			'contact'
		];

		for (const id of sectionIds) {
			expect(body).toContain(`id="${id}"`);
			expect(body).toContain(`data-testid="section-header-${id}"`);
		}
	});

	it('renders hero and about content from site configuration', () => {
		const { body } = renderPage();
		const bioLead = siteConfig.bio.split('. ')[0];

		expect(body).toContain(siteConfig.name);
		expect(body).toContain(siteConfig.title);
		expect(body).toContain('See Projects');
		expect(body).toContain('Start a Conversation');
		expect(body).toContain('Scroll Down');
		expect(body).toContain('aria-label="Hero section indicators"');
		expect(body).toContain('href="#projects"');
		expect(body).toContain(bioLead);
		expect(body).toContain('Who Am I');
		expect(body).toContain(siteConfig.email);
		expect(body).toContain('Connect points');
		expect(body).toContain(siteConfig.socials[0].url);
	});

	it('renders tools by grouped categories with proficiency pills and responsive grid classes', () => {
		const { body } = renderPage();
		const firstToolLink = tools.find((tool) => tool.url)?.url;

		expect(body).toContain('data-testid="tools-category-grid"');
		expect(body).toContain('grid-cols-1');
		expect(body).toContain('sm:grid-cols-2');
		expect(body).toContain('xl:grid-cols-4');
		expect(body).toContain('Languages');
		expect(body).toContain('Frameworks');
		expect(body).toContain('Tools');
		expect(body).toContain('Platforms');
		expect(body).toContain(tools[0].name);
		expect(body).toContain('Expert');
		expect(firstToolLink).toBeDefined();
		expect(body).toContain(firstToolLink as string);
		expect(body).toContain('bg-purple-500/15');
	});

	it('renders project cards with stable structure, purple tech pills, and accessible links', () => {
		const { body } = renderPage();

		expect(body).toContain('data-testid="projects-list"');
		expect(body).toContain('id="projects"');
		expect(body).toContain('transition-all duration-200');
		expect(body).toContain('opacity-100');
		expect(body).toContain('bg-slate-800/35');

		for (const project of projects) {
			expect(body).toContain(project.title);
			expect(body).toContain(project.description);
			expect(body).toContain(project.tags[0]);
			if (project.url) {
				expect(body).toContain(project.url);
				expect(body).toContain(`aria-label="Open live demo for ${project.title}"`);
			}
			if (project.github) {
				expect(body).toContain(project.github);
				expect(body).toContain(`aria-label="Open source code for ${project.title}"`);
			}
		}

		expect(body).toContain('Live demo');
		expect(body).toContain('Source code');
		expect(body).toContain('rounded-full border border-purple-400/45 bg-purple-500/15');
	});

	it('renders experience timeline entries with dates, linked company, tags, and resume profile link', () => {
		const { body } = renderPage();
		const linkedInProfile = siteConfig.socials.find(
			(social) => social.platform.toLowerCase() === 'linkedin'
		)?.url;

		expect(body).toContain('data-testid="experience-timeline"');
		expect(body).toContain('View Full Resume');
		expect(linkedInProfile).toBeDefined();
		expect(body).toContain(linkedInProfile as string);
		expect(body).toContain('sm:grid-cols-8');

		for (const entry of experience) {
			expect(body).toContain(entry.role);
			expect(body).toContain(entry.company);
			expect(body).toContain(entry.tags[0]);
			expect(body).toContain(entry.startDate.split('-')[0]);
			if (entry.endDate) {
				expect(body).toContain(entry.endDate.split('-')[0]);
			} else {
				expect(body).toContain('Present');
			}
			if (entry.companyUrl) {
				expect(body).toContain(entry.companyUrl);
			}
		}

		expect(body).toContain('data-testid="testimonials-list"');
		expect(body).toContain(testimonials[0].author);
		expect(body).toContain(testimonials[0].quote);
	});

	it('renders contact form skeleton fields and social links', () => {
		const { body } = renderPage();

		expect(body).toContain('aria-label="Contact form"');
		expect(body).toContain('name="name"');
		expect(body).toContain('name="email"');
		expect(body).toContain('name="message"');
		expect(body).toContain('data-testid="contact-socials"');
		expect(body).toContain(siteConfig.socials[0].platform);
	});

	it('renders open source section from load data with fallback badge and contribution links', () => {
		const { body } = renderPage();

		expect(body).toContain('data-testid="section-header-opensource"');
		expect(body).toContain('Fallback');
		expect(body).toContain(openSourceFixture.note);
		expect(body).toContain(openSourceFixture.contributions[0].title);
		expect(body).toContain(openSourceFixture.contributions[0].description);
		expect(body).toContain(openSourceFixture.contributions[0].url);
	});
});
