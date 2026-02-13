import { describe, it, expect } from 'vitest';
import type { Project, Experience, Tool, Testimonial, SiteConfig } from '$lib/types/content';
import { projects } from '$lib/data/projects';
import { experience } from '$lib/data/experience';
import { tools } from '$lib/data/tools';
import { testimonials } from '$lib/data/testimonials';
import { siteConfig } from '$lib/data/site-config';

describe('Content Schemas', () => {
	describe('Projects', () => {
		it('should have non-empty projects array', () => {
			expect(projects.length).toBeGreaterThan(0);
		});

		it('should have all required fields in each project', () => {
			projects.forEach((project: Project) => {
				expect(project.id).toBeDefined();
				expect(project.title).toBeDefined();
				expect(project.description).toBeDefined();
				expect(project.tags).toBeDefined();
				expect(Array.isArray(project.tags)).toBe(true);
				expect(project.featured).toBeDefined();
				expect(typeof project.featured).toBe('boolean');
			});
		});

		it('should have at least one featured project', () => {
			const featured = projects.filter((p) => p.featured);
			expect(featured.length).toBeGreaterThan(0);
		});

		it('should have non-empty tags for each project', () => {
			projects.forEach((project: Project) => {
				expect(project.tags.length).toBeGreaterThan(0);
			});
		});
	});

	describe('Experience', () => {
		it('should have non-empty experience array', () => {
			expect(experience.length).toBeGreaterThan(0);
		});

		it('should have all required fields in each experience entry', () => {
			experience.forEach((exp: Experience) => {
				expect(exp.id).toBeDefined();
				expect(exp.role).toBeDefined();
				expect(exp.company).toBeDefined();
				expect(exp.startDate).toBeDefined();
				expect(exp.description).toBeDefined();
				expect(exp.tags).toBeDefined();
				expect(Array.isArray(exp.tags)).toBe(true);
			});
		});

		it('should have non-empty tags for each experience entry', () => {
			experience.forEach((exp: Experience) => {
				expect(exp.tags.length).toBeGreaterThan(0);
			});
		});
	});

	describe('Tools', () => {
		it('should have non-empty tools array', () => {
			expect(tools.length).toBeGreaterThan(0);
		});

		it('should have all required fields in each tool', () => {
			tools.forEach((tool: Tool) => {
				expect(tool.id).toBeDefined();
				expect(tool.name).toBeDefined();
				expect(tool.icon).toBeDefined();
				expect(tool.category).toBeDefined();
				expect(tool.proficiency).toBeDefined();
			});
		});

		it('should have valid category values', () => {
			const validCategories = ['language', 'framework', 'tool', 'platform'];
			tools.forEach((tool: Tool) => {
				expect(validCategories).toContain(tool.category);
			});
		});

		it('should have valid proficiency values', () => {
			const validProficiencies = ['expert', 'proficient', 'familiar'];
			tools.forEach((tool: Tool) => {
				expect(validProficiencies).toContain(tool.proficiency);
			});
		});

		it('should have tools from all categories', () => {
			const categories = new Set(tools.map((t) => t.category));
			expect(categories.has('language')).toBe(true);
			expect(categories.has('framework')).toBe(true);
			expect(categories.has('tool')).toBe(true);
			expect(categories.has('platform')).toBe(true);
		});
	});

	describe('Testimonials', () => {
		it('should have non-empty testimonials array', () => {
			expect(testimonials.length).toBeGreaterThan(0);
		});

		it('should have all required fields in each testimonial', () => {
			testimonials.forEach((testimonial: Testimonial) => {
				expect(testimonial.id).toBeDefined();
				expect(testimonial.quote).toBeDefined();
				expect(testimonial.author).toBeDefined();
				expect(testimonial.role).toBeDefined();
				expect(testimonial.company).toBeDefined();
			});
		});
	});

	describe('Site Config', () => {
		it('should have all required fields', () => {
			expect(siteConfig.name).toBeDefined();
			expect(siteConfig.title).toBeDefined();
			expect(siteConfig.subtitle).toBeDefined();
			expect(siteConfig.bio).toBeDefined();
			expect(siteConfig.email).toBeDefined();
			expect(siteConfig.socials).toBeDefined();
		});

		it('should have non-empty socials array', () => {
			expect(Array.isArray(siteConfig.socials)).toBe(true);
			expect(siteConfig.socials.length).toBeGreaterThan(0);
		});

		it('should have valid social links', () => {
			siteConfig.socials.forEach((social) => {
				expect(social.platform).toBeDefined();
				expect(social.url).toBeDefined();
				expect(social.icon).toBeDefined();
			});
		});
	});
});
