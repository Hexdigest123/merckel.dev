const FEEDBACK_DURATION_MS = 1800;

/**
 * Tracks which value was copied last so buttons can briefly show "Copied".
 * Call {@link CopyFeedback.dispose} when the owning component is destroyed.
 */
export class CopyFeedback {
	copiedKey = $state<string | null>(null);
	#timer: ReturnType<typeof setTimeout> | undefined;

	/** Copies `text`; resolves to `false` if the Clipboard API is unavailable or denied. */
	async copy(text: string, key = 'default'): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return false;
		}

		this.copiedKey = key;
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.copiedKey = null;
		}, FEEDBACK_DURATION_MS);
		return true;
	}

	isCopied(key = 'default'): boolean {
		return this.copiedKey === key;
	}

	reset() {
		clearTimeout(this.#timer);
		this.copiedKey = null;
	}

	dispose() {
		clearTimeout(this.#timer);
	}
}
