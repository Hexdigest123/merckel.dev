import { describe, expect, it } from 'vitest';
import { createCommandList, executeCommand, filterCommands } from '$lib/utils/command-palette';

const sections = [
	{ id: 'about', title: 'About' },
	{ id: 'projects', title: 'Projects' },
	{ id: 'contact', title: 'Contact' }
] as const;

describe('command-palette utils', () => {
	it('shows only section navigation commands by default', () => {
		const commands = createCommandList(sections);
		const filtered = filterCommands(commands, '');

		const sectionLabels = filtered.filter((c) => c.type === 'navigate').map((c) => c.label);
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

describe('command-palette tool commands', () => {
	it('uses the provided (localized) tool names and keeps search keywords', () => {
		const tools = [
			{
				id: 'color-converter',
				name: 'Color converter & palette',
				path: '/tools/color-converter' as const,
				keywords: ['farbe', 'hex']
			}
		];
		const commands = createCommandList(sections, tools);
		const tool = commands.find((command) => command.id === 'tool-color-converter');

		expect(tool?.label).toBe('Color converter & palette');
		expect(filterCommands(commands, 'farbe').map((command) => command.id)).toContain(
			'tool-color-converter'
		);
		expect(executeCommand(tool!)).toEqual({ navigateToUrl: '/tools/color-converter' });
	});

	it('includes every tool by default', () => {
		const toolCommands = createCommandList(sections).filter((c) => c.type === 'navigate-url');
		expect(toolCommands).toHaveLength(10);
	});
});
