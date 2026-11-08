import { browser } from '$app/environment';

const trackedTools = new Set<string>();

/**
 * Records a single usage of a tool for the "most used tools" ranking.
 *
 * Only the first call per tool and browser session is sent, so tools that react to
 * every keystroke do not inflate the counter. Failures are ignored on purpose: usage
 * statistics must never break a tool.
 */
export function trackToolUsage(toolId: string): void {
	if (!browser || trackedTools.has(toolId)) {
		return;
	}

	trackedTools.add(toolId);
	void fetch('/api/tools/usage', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ toolId })
	}).catch(() => undefined);
}
