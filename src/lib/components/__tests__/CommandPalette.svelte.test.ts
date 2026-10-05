import { describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import CommandPaletteLocaleWrapper from './CommandPaletteLocaleWrapper.svelte';

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

function getDialog(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
}

describe('CommandPalette interactions', () => {
	it('opens with Cmd/Ctrl+K and closes with Escape', async () => {
		const app = mount(CommandPaletteLocaleWrapper, { target: document.body, props: { sections } });
		await nextFrame();
		expect(getDialog()).toBeNull();

		pressGlobalKey('k', { metaKey: true });
		await nextFrame();

		expect(getDialog()?.getAttribute('aria-label')).toBe('Befehlspalette');

		pressGlobalKey('Escape');
		await nextFrame();

		expect(getDialog()).toBeNull();
		await unmount(app);
	});

	it('filters typed commands and navigates on Enter', async () => {
		const target = document.createElement('section');
		target.id = 'projects';
		target.scrollIntoView = () => {};
		document.body.append(target);

		const app = mount(CommandPaletteLocaleWrapper, { target: document.body, props: { sections } });
		await nextFrame();
		pressGlobalKey('k', { ctrlKey: true });
		await nextFrame();

		const input = document.getElementById('command-palette-input');
		expect(input?.getAttribute('aria-label')).toBe('Befehlseingabe');

		if (input instanceof HTMLInputElement) {
			input.value = 'projects';
			input.dispatchEvent(new Event('input', { bubbles: true }));
		}
		await nextFrame();

		const listbox = document.querySelector('[role="listbox"]');
		expect(listbox?.textContent).toContain('Projects');

		input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await nextFrame();

		expect(window.location.hash).toBe('#projects');
		expect(getDialog()).toBeNull();

		await unmount(app);
		target.remove();
		window.history.replaceState(null, '', window.location.pathname);
	});
});
