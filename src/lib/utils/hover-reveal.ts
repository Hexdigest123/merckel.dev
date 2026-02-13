import { browser } from '$app/environment';

export interface HoverRevealOptions {
	duration: number;
	onRevealed: () => void;
}

export function createHoverReveal(element: HTMLElement, options: HoverRevealOptions) {
	if (!browser) return { cleanup: () => {} };

	const { duration, onRevealed } = options;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let revealed = false;

	const handleMouseEnter = () => {
		if (revealed) return;
		timeoutId = setTimeout(() => {
			revealed = true;
			onRevealed();
		}, duration);
	};

	const handleMouseLeave = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	element.addEventListener('mouseenter', handleMouseEnter);
	element.addEventListener('mouseleave', handleMouseLeave);

	const cleanup = () => {
		if (timeoutId) clearTimeout(timeoutId);
		element.removeEventListener('mouseenter', handleMouseEnter);
		element.removeEventListener('mouseleave', handleMouseLeave);
	};

	return { cleanup };
}
