export interface CommandPaletteSection {
	id: string;
	title: string;
}

export interface CommandPaletteCommand {
	id: string;
	label: string;
	keywords: string[];
	type: 'navigate' | 'navigate-url' | 'hidden';
	hash?: string;
	url?: string;
	output?: string;
	secretId?: string;
	visibleByDefault: boolean;
}

export interface CommandExecutionResult {
	navigateToHash?: string;
	navigateToUrl?: string;
	message?: string;
	secretId?: string;
}

const TOOL_COMMANDS: CommandPaletteCommand[] = [
	{
		id: 'tool-url-shortener',
		label: 'URL Shortener',
		keywords: ['shorten', 'link', 'url', 'short', 'tool'],
		type: 'navigate-url',
		url: '/tools/url-shortener',
		visibleByDefault: true
	},
	{
		id: 'tool-cron-generator',
		label: 'Cron Expression Generator',
		keywords: ['cron', 'schedule', 'crontab', 'timer', 'tool'],
		type: 'navigate-url',
		url: '/tools/cron-generator',
		visibleByDefault: true
	},
	{
		id: 'tool-text-diff',
		label: 'Text Diff Checker',
		keywords: ['diff', 'compare', 'text', 'difference', 'tool'],
		type: 'navigate-url',
		url: '/tools/text-diff',
		visibleByDefault: true
	},
	{
		id: 'tool-image-converter',
		label: 'Image Format Converter',
		keywords: ['image', 'convert', 'png', 'jpg', 'webp', 'tool'],
		type: 'navigate-url',
		url: '/tools/image-converter',
		visibleByDefault: true
	},
	{
		id: 'tool-qr-generator',
		label: 'QR Code Generator',
		keywords: ['qr', 'qrcode', 'barcode', 'scan', 'tool'],
		type: 'navigate-url',
		url: '/tools/qr-generator',
		visibleByDefault: true
	},
	{
		id: 'tool-markdown-preview',
		label: 'Markdown Preview',
		keywords: ['markdown', 'preview', 'md', 'html', 'editor', 'tool'],
		type: 'navigate-url',
		url: '/tools/markdown-preview',
		visibleByDefault: true
	},
	{
		id: 'tool-css-gradient',
		label: 'CSS Gradient Generator',
		keywords: ['gradient', 'css', 'verlauf', 'background', 'tool'],
		type: 'navigate-url',
		url: '/tools/css-gradient',
		visibleByDefault: true
	},
	{
		id: 'tool-json-formatter',
		label: 'JSON Formatter & Validator',
		keywords: ['json', 'format', 'validate', 'formatieren', 'tool'],
		type: 'navigate-url',
		url: '/tools/json-formatter',
		visibleByDefault: true
	},
	{
		id: 'tool-color-converter',
		label: 'Farbkonverter & Palette',
		keywords: ['color', 'farbe', 'convert', 'palette', 'hex', 'rgb', 'hsl', 'tool'],
		type: 'navigate-url',
		url: '/tools/color-converter',
		visibleByDefault: true
	},
	{
		id: 'tool-regex-tester',
		label: 'Regex Tester',
		keywords: ['regex', 'regexp', 'pattern', 'muster', 'test', 'match', 'tool'],
		type: 'navigate-url',
		url: '/tools/regex-tester',
		visibleByDefault: true
	}
];

const HIDDEN_COMMANDS: CommandPaletteCommand[] = [
	{
		id: 'help',
		label: 'help',
		keywords: ['commands', 'palette', 'assist'],
		type: 'hidden',
		output:
			'Sektionen: über mich, werkzeuge, projekte, erfahrung, open source, referenzen, kontakt. Tools: url shortener, cron, diff, bildkonverter, qr, markdown, css-verlauf, json-formatter, farbkonverter, regex. Versteckt: secret, matrix, sudo hire me.',
		visibleByDefault: false
	},
	{
		id: 'secret',
		label: 'secret',
		keywords: ['hidden', 'easter', 'vault'],
		type: 'hidden',
		output: 'Keine geheimen Informationen hier. Aber Neugier steht dir gut.',
		secretId: 'terminal-secret',
		visibleByDefault: false
	},
	{
		id: 'matrix',
		label: 'matrix',
		keywords: ['neo', 'red pill', 'wake up'],
		type: 'hidden',
		output: 'Wach auf, Neo. Das Portfolio hat dich.',
		secretId: 'terminal-secret',
		visibleByDefault: false
	},
	{
		id: 'sudo-hire-me',
		label: 'sudo hire me',
		keywords: ['sudo', 'hire', 'career'],
		type: 'hidden',
		output: 'Zugriff gewährt. Angebotsschreiben wird erstellt... fertig.',
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

	return [...navigationCommands, ...TOOL_COMMANDS, ...HIDDEN_COMMANDS];
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

	if (command.type === 'hidden' && command.output) {
		return {
			message: command.output,
			secretId: command.secretId
		};
	}

	return {
		message: 'Befehl erkannt, aber keine Aktion konfiguriert.'
	};
}
