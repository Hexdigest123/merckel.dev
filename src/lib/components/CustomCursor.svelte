<script lang="ts">
	import { browser } from '$app/environment';
	import { gsap, prefersReducedMotion } from '$lib/utils/gsap';

	type CursorVariant = 'default' | 'link' | 'input' | 'text';

	let cursorElement: HTMLDivElement | null = null;
	let ringElement: HTMLSpanElement | null = null;
	let dotElement: HTMLSpanElement | null = null;

	let isEnabled = $state(false);
	let isVisible = $state(false);
	let isPressed = $state(false);
	let variant = $state<CursorVariant>('default');

	$effect(() => {
		if (!browser) {
			return;
		}

		if (!cursorElement || !ringElement || !dotElement) {
			return;
		}

		const hasReducedMotion = prefersReducedMotion();
		const prefersCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
		const hasNoHover = window.matchMedia('(hover: none)').matches;

		if (hasReducedMotion || prefersCoarsePointer || hasNoHover) {
			isEnabled = false;
			return;
		}

		isEnabled = true;
		document.documentElement.classList.add('has-custom-cursor');

		let rafId = 0;
		let targetX = window.innerWidth * 0.5;
		let targetY = window.innerHeight * 0.5;
		let currentX = targetX;
		let currentY = targetY;

		const setCursorX = gsap.quickSetter(cursorElement, 'x', 'px');
		const setCursorY = gsap.quickSetter(cursorElement, 'y', 'px');

		const interactiveFallback =
			'a,button,input,textarea,select,[role="button"],[tabindex]:not([tabindex="-1"])';

		const getVariant = (target: EventTarget | null): CursorVariant => {
			if (!(target instanceof Element)) {
				return 'default';
			}

			const attributedTarget = target.closest<HTMLElement>('[data-cursor]');
			if (attributedTarget) {
				const nextVariant = attributedTarget.dataset.cursor;
				if (nextVariant === 'link' || nextVariant === 'input' || nextVariant === 'text') {
					return nextVariant;
				}
				return 'default';
			}

			if (target.closest(interactiveFallback)) {
				return 'link';
			}

			return 'default';
		};

		const tick = () => {
			currentX += (targetX - currentX) * 0.24;
			currentY += (targetY - currentY) * 0.24;
			setCursorX(currentX);
			setCursorY(currentY);
			rafId = window.requestAnimationFrame(tick);
		};

		const handlePointerMove = (event: PointerEvent) => {
			targetX = event.clientX;
			targetY = event.clientY;
			if (!isVisible) {
				isVisible = true;
			}
			variant = getVariant(event.target);
		};

		const handlePointerOver = (event: PointerEvent) => {
			variant = getVariant(event.target);
		};

		const handleFocusIn = (event: FocusEvent) => {
			variant = getVariant(event.target);
			isVisible = true;
		};

		const handlePointerLeave = () => {
			isVisible = false;
			variant = 'default';
		};

		const handlePointerDown = () => {
			isPressed = true;
		};

		const handlePointerUp = () => {
			isPressed = false;
		};

		document.addEventListener('pointermove', handlePointerMove, { passive: true });
		document.addEventListener('pointerover', handlePointerOver, { passive: true });
		document.addEventListener('focusin', handleFocusIn);
		document.addEventListener('pointerleave', handlePointerLeave);
		document.addEventListener('pointerdown', handlePointerDown, { passive: true });
		document.addEventListener('pointerup', handlePointerUp, { passive: true });

		rafId = window.requestAnimationFrame(tick);

		return () => {
			window.cancelAnimationFrame(rafId);
			document.removeEventListener('pointermove', handlePointerMove);
			document.removeEventListener('pointerover', handlePointerOver);
			document.removeEventListener('focusin', handleFocusIn);
			document.removeEventListener('pointerleave', handlePointerLeave);
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('pointerup', handlePointerUp);
			document.documentElement.classList.remove('has-custom-cursor');
			isEnabled = false;
			isVisible = false;
			isPressed = false;
			variant = 'default';
		};
	});
</script>

<div
	bind:this={cursorElement}
	class="custom-cursor"
	class:is-enabled={isEnabled}
	class:is-visible={isVisible}
	class:is-pressed={isPressed}
	data-variant={variant}
	aria-hidden="true"
>
	<span bind:this={ringElement} class="custom-cursor__ring"></span>
	<span bind:this={dotElement} class="custom-cursor__dot"></span>
</div>

<style>
	.custom-cursor {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 120;
		opacity: 0;
		transform: translate3d(-999px, -999px, 0);
		pointer-events: none;
		transition: opacity 180ms ease;
	}

	.custom-cursor.is-enabled.is-visible {
		opacity: 1;
	}

	.custom-cursor__ring,
	.custom-cursor__dot {
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 999px;
		transform: translate(-50%, -50%);
		will-change: transform, opacity;
		transition:
			transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 220ms ease,
			background-color 220ms ease,
			border-color 220ms ease;
	}

	.custom-cursor__ring {
		width: 30px;
		height: 30px;
		border: 1px solid rgb(139 92 246 / 0.55);
		background: radial-gradient(circle at 30% 30%, rgb(139 92 246 / 0.16), transparent 72%);
		box-shadow:
			0 0 0 1px rgb(15 23 42 / 0.42),
			0 0 18px rgb(139 92 246 / 0.16);
	}

	.custom-cursor__dot {
		width: 6px;
		height: 6px;
		background: rgb(196 181 253 / 0.95);
		box-shadow: 0 0 10px rgb(196 181 253 / 0.28);
	}

	.custom-cursor[data-variant='link'] .custom-cursor__ring {
		transform: translate(-50%, -50%) scale(1.28);
		border-color: rgb(196 181 253 / 0.85);
		background: radial-gradient(circle at 50% 50%, rgb(167 139 250 / 0.22), transparent 74%);
	}

	.custom-cursor[data-variant='input'] .custom-cursor__ring,
	.custom-cursor[data-variant='text'] .custom-cursor__ring {
		width: 24px;
		height: 24px;
		border-color: rgb(148 163 184 / 0.8);
		background: rgb(15 23 42 / 0.5);
	}

	.custom-cursor.is-pressed .custom-cursor__ring {
		transform: translate(-50%, -50%) scale(0.9);
		opacity: 0.8;
	}

	.custom-cursor.is-pressed .custom-cursor__dot {
		transform: translate(-50%, -50%) scale(0.84);
	}

	:global(html.has-custom-cursor),
	:global(html.has-custom-cursor body),
	:global(html.has-custom-cursor a),
	:global(html.has-custom-cursor button),
	:global(html.has-custom-cursor input),
	:global(html.has-custom-cursor textarea),
	:global(html.has-custom-cursor select),
	:global(html.has-custom-cursor [role='button']) {
		cursor: none;
	}

	@media (max-width: 1023px), (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
		.custom-cursor {
			display: none;
		}
	}
</style>
