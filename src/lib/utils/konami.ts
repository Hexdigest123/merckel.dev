/**
 * Konami Code detector
 * Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
 */

const KONAMI_SEQUENCE = [
	'ArrowUp',
	'ArrowUp',
	'ArrowDown',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowLeft',
	'ArrowRight',
	'b',
	'a'
];

export interface KonamiDetectorOptions {
	onDetected: () => void;
	caseSensitive?: boolean;
}

export function createKonamiDetector(options: KonamiDetectorOptions) {
	const { onDetected, caseSensitive = false } = options;
	let keySequence: string[] = [];

	const handleKeyDown = (event: KeyboardEvent) => {
		let key = event.key;

		// Normalize letter keys to lowercase for comparison
		if (key.length === 1 && !caseSensitive) {
			key = key.toLowerCase();
		}

		keySequence.push(key);

		// Keep only the last N keys (length of Konami sequence)
		if (keySequence.length > KONAMI_SEQUENCE.length) {
			keySequence.shift();
		}

		// Check if current sequence matches Konami code
		if (keySequence.length === KONAMI_SEQUENCE.length) {
			const matches = keySequence.every((k, i) => k === KONAMI_SEQUENCE[i]);
			if (matches) {
				onDetected();
				keySequence = []; // Reset after detection
			}
		}
	};

	const cleanup = () => {
		window.removeEventListener('keydown', handleKeyDown);
	};

	const start = () => {
		window.addEventListener('keydown', handleKeyDown);
	};

	return { start, cleanup };
}
