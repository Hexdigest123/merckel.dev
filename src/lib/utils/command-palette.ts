import type { Pathname } from '$app/types';
import { webTools } from '$lib/data/web-tools';
import type { WebTool } from '$lib/types/content';

export interface CommandPaletteSection {
	id: string;
	title: string;
}

export interface CommandPaletteCommand {
	id: string;
	label: string;
	keywords: string[];
	type: 'navigate' | 'navigate-url';
	hash?: string;
	url?: Pathname;
	visibleByDefault: boolean;
}

export interface CommandExecutionResult {
	navigateToHash?: string;
	navigateToUrl?: Pathname;
	message?: string;
}

type CommandPaletteTool = Pick<WebTool, 'id' | 'name' | 'path' | 'keywords'>;

function normalize(input: string): string {
	return input.trim().toLowerCase();
}

/**
 * Builds the command list: one command per home-page section followed by one per tool.
 * Pass localized tools so the labels follow the active language.
 */
export function createCommandList(
	sections: readonly CommandPaletteSection[],
	tools: readonly CommandPaletteTool[] = webTools
): CommandPaletteCommand[] {
	const navigationCommands = sections.map<CommandPaletteCommand>((section) => ({
		id: `section-${section.id}`,
		label: section.title,
		keywords: [section.id, section.title.toLowerCase(), `go to ${section.title.toLowerCase()}`],
		type: 'navigate',
		hash: section.id,
		visibleByDefault: true
	}));

	const toolCommands = tools.map<CommandPaletteCommand>((tool) => ({
		id: `tool-${tool.id}`,
		label: tool.name,
		keywords: [...tool.keywords, tool.id.replaceAll('-', ' ')],
		type: 'navigate-url',
		url: tool.path,
		visibleByDefault: true
	}));

	return [...navigationCommands, ...toolCommands];
}

export function filterCommands(
	commands: readonly CommandPaletteCommand[],
	query: string
): CommandPaletteCommand[] {
	const normalizedQuery = normalize(query);

	if (!normalizedQuery) {
		return commands.filter((command) => command.visibleByDefault);
	}

	return commands.filter((command) => {
		if (normalize(command.label).includes(normalizedQuery)) {
			return true;
		}

		return command.keywords.some((keyword) => normalize(keyword).includes(normalizedQuery));
	});
}

export function resolveCommandFromInput(
	commands: readonly CommandPaletteCommand[],
	query: string,
	selectedCommand?: CommandPaletteCommand
): CommandPaletteCommand | undefined {
	if (selectedCommand) {
		return selectedCommand;
	}

	const normalizedQuery = normalize(query);
	if (!normalizedQuery) {
		return undefined;
	}

	return commands.find((command) => normalize(command.label) === normalizedQuery);
}

export function executeCommand(command: CommandPaletteCommand): CommandExecutionResult {
	if (command.type === 'navigate' && command.hash) {
		return {
			navigateToHash: command.hash
		};
	}

	if (command.type === 'navigate-url' && command.url) {
		return {
			navigateToUrl: command.url
		};
	}

	return {
		message: 'Command recognized, but no action is configured.'
	};
}
