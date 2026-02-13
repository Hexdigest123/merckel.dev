import { describe, expect, it } from 'vitest';
import {
	createCommandList,
	executeCommand,
	filterCommands,
	resolveCommandFromInput
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

		expect(filtered).toHaveLength(3);
		expect(filtered.map((command) => command.label)).toEqual(['About', 'Projects', 'Contact']);
	});

	it('matches hidden commands when searching and resolves exact hidden entries', () => {
		const commands = createCommandList(sections);
		const filtered = filterCommands(commands, 'matrix');

		expect(filtered.some((command) => command.label === 'matrix')).toBe(true);
		expect(executeCommand(resolveCommandFromInput(commands, 'help')!)).toEqual({
			message:
				'Commands: about, tools, projects, experience, open source, testimonials, contact. Hidden: secret, matrix, sudo hire me.'
		});
		expect(executeCommand(resolveCommandFromInput(commands, 'secret')!)).toEqual({
			message: 'No classified intel here. But curiosity looks great on you.',
			secretId: 'terminal-secret'
		});
		expect(executeCommand(resolveCommandFromInput(commands, 'matrix')!)).toEqual({
			message: 'Wake up, Neo. The portfolio has you.',
			secretId: 'terminal-secret'
		});

		const exact = resolveCommandFromInput(commands, 'sudo hire me');
		expect(exact?.label).toBe('sudo hire me');
		expect(executeCommand(exact!)).toEqual({
			message: 'Permission granted. Drafting the offer letter... done.',
			secretId: 'terminal-secret'
		});
	});

	it('returns hash targets for section commands', () => {
		const commands = createCommandList(sections);
		const filtered = filterCommands(commands, 'proj');
		const selected = filtered[0];

		expect(selected.label).toBe('Projects');
		expect(executeCommand(selected)).toEqual({ navigateToHash: 'projects' });
	});
});
