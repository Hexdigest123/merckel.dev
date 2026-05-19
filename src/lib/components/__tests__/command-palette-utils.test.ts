import { describe, expect, it } from 'vitest';
import {
	createCommandList,
	executeCommand,
	filterCommands
} from '$lib/utils/command-palette';

const sections = [
	{ id: 'about', title: 'About' },
	{ id: 'projects', title: 'Projects' },
	{ id: 'contact', title: 'Contact' }
] as const;

describe('command-palette utils', () => {
	it('shows only section navigation commands by default', () => {
		const commands = createCommandList(sections);
		const filtered = filterCommands(commands, '');

		const sectionLabels = filtered
			.filter((c) => c.type === 'navigate')
			.map((c) => c.label);
		expect(sectionLabels).toEqual(['About', 'Projects', 'Contact']);
	});

	it('returns hash targets for section commands', () => {
		const commands = createCommandList(sections);
		const filtered = filterCommands(commands, 'proj');
		const selected = filtered[0];

		expect(selected.label).toBe('Projects');
		expect(executeCommand(selected)).toEqual({ navigateToHash: 'projects' });
	});

	it('returns url targets for tool commands', () => {
		const commands = createCommandList(sections);
		const filtered = filterCommands(commands, 'url shortener');
		const tool = filtered.find((c) => c.id === 'tool-url-shortener');

		expect(tool).toBeDefined();
		expect(executeCommand(tool!)).toEqual({ navigateToUrl: '/tools/url-shortener' });
	});
});
