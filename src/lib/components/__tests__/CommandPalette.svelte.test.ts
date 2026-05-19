import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CommandPalette from '../CommandPalette.svelte';

const sections = [
	{ id: 'about', title: 'About' },
	{ id: 'projects', title: 'Projects' },
	{ id: 'contact', title: 'Contact' }
];

function pressGlobalKey(key: string, options: { metaKey?: boolean; ctrlKey?: boolean } = {}) {
	window.dispatchEvent(
		new KeyboardEvent('keydown', {
			key,
			metaKey: options.metaKey,
			ctrlKey: options.ctrlKey,
			bubbles: true,
			cancelable: true
		})
	);
}

async function nextFrame() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('CommandPalette interactions', () => {
	it('opens with Cmd/Ctrl+K and closes with Escape', async () => {
		render(CommandPalette, { props: { sections } });

		pressGlobalKey('k', { metaKey: true });
		await nextFrame();

		const dialog = page.getByRole('dialog', { name: 'Befehlspalette' });
		await expect.element(dialog).toBeInTheDocument();

		pressGlobalKey('Escape');
		await nextFrame();

		await expect.element(dialog).not.toBeInTheDocument();
	});

	it('filters typed commands and navigates on Enter', async () => {
		const target = document.createElement('section');
		target.id = 'projects';
		document.body.append(target);

		render(CommandPalette, { props: { sections } });
		pressGlobalKey('k', { ctrlKey: true });
		await nextFrame();

		const input = page.getByLabelText('Befehlseingabe');
		await input.fill('projects');

		await expect
			.element(page.getByRole('option', { name: 'Projects Sektion' }))
			.toBeInTheDocument();

		document
			.getElementById('command-palette-input')
			?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await nextFrame();

		expect(window.location.hash).toBe('#projects');
		await expect
			.element(page.getByRole('dialog', { name: 'Befehlspalette' }))
			.not.toBeInTheDocument();

		target.remove();
		window.history.replaceState(null, '', window.location.pathname);
	});
});
