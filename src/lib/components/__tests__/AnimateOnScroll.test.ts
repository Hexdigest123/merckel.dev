import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import AnimateOnScrollFixture from './fixtures/AnimateOnScrollFixture.svelte';

describe('AnimateOnScroll', () => {
	it('renders child content within a reusable animation wrapper', () => {
		const { body } = render(AnimateOnScrollFixture);

		expect(body).toContain('data-animate-on-scroll');
		expect(body).toContain('data-testid="fixture-child"');
		expect(body).toContain('Animated child content');
	});
});
