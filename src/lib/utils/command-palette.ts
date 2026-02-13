export interface CommandPaletteSection {
	id: string;
	title: string;
}

export interface CommandPaletteCommand {
	id: string;
	label: string;
	keywords: string[];
	type: 'navigate' | 'hidden';
	hash?: string;
	output?: string;
	secretId?: string;
	visibleByDefault: boolean;
}

export interface CommandExecutionResult {
	navigateToHash?: string;
	message?: string;
	secretId?: string;
}

const HIDDEN_COMMANDS: CommandPaletteCommand[] = [
	{
		id: 'help',
		label: 'help',
		keywords: ['commands', 'palette', 'assist'],
		type: 'hidden',
		output:
			'Commands: about, tools, projects, experience, open source, testimonials, contact. Hidden: secret, matrix, sudo hire me.',
		visibleByDefault: false
	},
	{
		id: 'secret',
		label: 'secret',
		keywords: ['hidden', 'easter', 'vault'],
		type: 'hidden',
		output: 'No classified intel here. But curiosity looks great on you.',
		secretId: 'terminal-secret',
		visibleByDefault: false
	},
	{
		id: 'matrix',
		label: 'matrix',
		keywords: ['neo', 'red pill', 'wake up'],
		type: 'hidden',
		output: 'Wake up, Neo. The portfolio has you.',
		secretId: 'terminal-secret',
		visibleByDefault: false
	},
	{
		id: 'sudo-hire-me',
		label: 'sudo hire me',
		keywords: ['sudo', 'hire', 'career'],
		type: 'hidden',
		output: 'Permission granted. Drafting the offer letter... done.',
		secretId: 'terminal-secret',
		visibleByDefault: false
	}
];

function normalize(input: string): string {
	return input.trim().toLowerCase();
}

export function createCommandList(
	sections: readonly CommandPaletteSection[]
): CommandPaletteCommand[] {
	const navigationCommands = sections.map<CommandPaletteCommand>((section) => ({
		id: `section-${section.id}`,
		label: section.title,
		keywords: [section.id, section.title.toLowerCase(), `go to ${section.title.toLowerCase()}`],
		type: 'navigate',
		hash: section.id,
		visibleByDefault: true
	}));

	return [...navigationCommands, ...HIDDEN_COMMANDS];
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

	if (command.type === 'hidden' && command.output) {
		return {
			message: command.output,
			secretId: command.secretId
		};
	}

	return {
		message: 'Command recognized, but no action is configured.'
	};
}
