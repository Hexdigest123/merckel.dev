import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Section from '../Section.svelte';

describe('Section', () => {
	it('renders section id, title, and description', () => {
		const { body } = render(Section, {
			props: {
				id: 'about',
				title: 'About',
				description: 'Personal background'
			}
		});

		expect(body).toContain('id="about"');
		expect(body).toContain('data-section="about"');
		expect(body).toContain('id="about-heading"');
		expect(body).toContain('Personal background');
	});

	it('enables sticky mobile heading by default', () => {
		const { body } = render(Section, {
			props: {
				id: 'tools',
				title: 'Tools'
			}
		});

		expect(body).toContain('data-testid="section-header-tools"');
		expect(body).toContain('sticky top-0 z-20');
	});

	it('can disable sticky heading', () => {
		const { body } = render(Section, {
			props: {
				id: 'contact',
				title: 'Contact',
				mobileSticky: false
			}
		});

		expect(body).toContain('data-testid="section-header-contact"');
		expect(body).not.toContain('sticky top-0 z-20');
	});
});
