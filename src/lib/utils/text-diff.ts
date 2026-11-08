import { diffLines } from 'diff';

export type DiffKind = 'added' | 'removed' | 'unchanged';

export interface DiffLine {
	kind: DiffKind;
	text: string;
	prefix: '+' | '-' | ' ';
	/** Line number in the original text (absent for added lines). */
	oldLineNumber?: number;
	/** Line number in the modified text (absent for removed lines). */
	newLineNumber?: number;
	key: string;
}

export interface TextDiffResult {
	lines: DiffLine[];
	additions: number;
	deletions: number;
}

function splitLines(value: string): string[] {
	if (value.length === 0) {
		return [];
	}

	const lines = value.split('\n');
	if (lines.at(-1) === '') {
		lines.pop();
	}

	return lines;
}

/**
 * Line-based diff with separate line numbers for both sides (like a unified diff).
 * Windows line endings and a missing newline at the end of either text are ignored,
 * so they do not show up as changed lines.
 */
export function computeTextDiff(original: string, modified: string): TextDiffResult {
	const chunks = diffLines(original, modified, { stripTrailingCr: true, ignoreNewlineAtEof: true });
	const lines: DiffLine[] = [];
	let oldLineNumber = 1;
	let newLineNumber = 1;
	let additions = 0;
	let deletions = 0;

	for (const chunk of chunks) {
		const kind: DiffKind = chunk.added ? 'added' : chunk.removed ? 'removed' : 'unchanged';
		const prefix = kind === 'added' ? '+' : kind === 'removed' ? '-' : ' ';

		for (const text of splitLines(chunk.value)) {
			const line: DiffLine = { kind, text, prefix, key: `${lines.length}` };

			if (kind !== 'added') line.oldLineNumber = oldLineNumber++;
			if (kind !== 'removed') line.newLineNumber = newLineNumber++;
			if (kind === 'added') additions += 1;
			if (kind === 'removed') deletions += 1;

			lines.push(line);
		}
	}

	return { lines, additions, deletions };
}

/** Plain-text unified representation, e.g. for copying. */
export function formatTextDiff(lines: DiffLine[]): string {
	return lines.map((line) => `${line.prefix} ${line.text}`).join('\n');
}
