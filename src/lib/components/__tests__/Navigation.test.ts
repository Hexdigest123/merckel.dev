import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Navigation from '../Navigation.svelte';

const REQUIRED_LINKS = [
	{ id: 'about', label: 'Über mich' },
	{ id: 'tools', label: 'Werkzeuge' },
	{ id: 'projects', label: 'Projekte' },
	{ id: 'experience', label: 'Erfahrung' },
	{ id: 'opensource', label: 'Open Source' },
	{ id: 'testimonials', label: 'Referenzen' },
	{ id: 'contact', label: 'Kontakt' }
];

describe('Navigation', () => {
	it('renders all required section links with anchor ids', () => {
		const { body } = render(Navigation);

		for (const item of REQUIRED_LINKS) {
			expect(body).toContain(`href="#${item.id}"`);
			expect(body).toContain(`>${item.label}</span>`);
		}
	});

	it('uses desktop-only sticky wrapper classes', () => {
		const { body } = render(Navigation);

		expect(body).toContain('class="hidden lg:sticky lg:top-8 lg:block"');
		expect(body).toContain('aria-label="Section navigation"');
	});

	it('contains intersection observer and hover indicator behavior in implementation', () => {
		const testFile = fileURLToPath(import.meta.url);
		const componentPath = resolve(dirname(testFile), '../Navigation.svelte');
		const source = readFileSync(componentPath, 'utf-8');

		expect(source).toContain('new IntersectionObserver');
		expect(source).toContain("rootMargin: '-35% 0px -45% 0px'");
		expect(source).toContain("hoveredId === item.id ? 'w-9 opacity-100' : 'w-3 opacity-60'");
	});
});
