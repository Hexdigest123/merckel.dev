import gsap from 'gsap';
import { afterNavigate } from '$app/navigation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type RevealMode = 'section' | 'hero';

export interface RevealOptions {
	mode?: RevealMode;
	triggerStart?: string;
	triggerEnd?: string;
	y?: number;
	duration?: number;
	stagger?: number;
	ease?: string;
	once?: boolean;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let isPluginRegistered = false;
let isScrollRefreshBound = false;
let refreshQueued = false;

function queueScrollTriggerRefresh() {
	if (typeof window === 'undefined' || refreshQueued) {
		return;
	}

	refreshQueued = true;
	window.requestAnimationFrame(() => {
		ScrollTrigger.refresh();
		refreshQueued = false;
	});
}

function getRevealElements(root: HTMLElement) {
	const revealTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
	const revealGroups = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-group]'));
	const heroTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-hero]'));

	return { revealTargets, revealGroups, heroTargets };
}

function showContentImmediately(root: HTMLElement) {
	const nodes = root.querySelectorAll<HTMLElement>(
		'[data-reveal], [data-reveal-item], [data-reveal-hero]'
	);

	if (nodes.length === 0) {
		return;
	}

	ensureGsapRegistered();
	gsap.set(nodes, {
		autoAlpha: 1,
		y: 0,
		clearProps: 'opacity,visibility,transform'
	});
}

export function prefersReducedMotion() {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return false;
	}

	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function ensureGsapRegistered() {
	if (!isPluginRegistered) {
		gsap.registerPlugin(ScrollTrigger);
		isPluginRegistered = true;
	}
}

export function ensureScrollTriggerRefreshOnNavigate() {
	if (typeof window === 'undefined' || isScrollRefreshBound) {
		return;
	}

	ensureGsapRegistered();
	afterNavigate(() => {
		window.requestAnimationFrame(() => ScrollTrigger.refresh());
	});

	isScrollRefreshBound = true;
}

export function createRevealContext(root: HTMLElement, options: RevealOptions = {}) {
	ensureGsapRegistered();
	queueScrollTriggerRefresh();

	if (prefersReducedMotion()) {
		showContentImmediately(root);
		return null;
	}

	const {
		mode = 'section',
		triggerStart = 'top 84%',
		triggerEnd = 'bottom 34%',
		y = 20,
		duration = 0.62,
		stagger = 0.08,
		ease = 'power2.out',
		once = true
	} = options;

	return gsap.context(() => {
		const { revealTargets, revealGroups, heroTargets } = getRevealElements(root);

		if (mode === 'hero' && heroTargets.length > 0) {
			gsap.fromTo(
				heroTargets,
				{ autoAlpha: 0, y: Math.min(y, 16) },
				{
					autoAlpha: 1,
					y: 0,
					duration: Math.max(0.45, duration - 0.08),
					ease,
					stagger,
					clearProps: 'opacity,visibility,transform'
				}
			);
		}

		if (revealTargets.length > 0) {
			gsap.fromTo(
				revealTargets,
				{ autoAlpha: 0, y },
				{
					autoAlpha: 1,
					y: 0,
					duration,
					ease,
					stagger,
					clearProps: 'opacity,visibility,transform',
					scrollTrigger: {
						trigger: root,
						start: triggerStart,
						end: triggerEnd,
						once
					}
				}
			);
		}

		for (const group of revealGroups) {
			const items = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal-item]'));
			if (items.length === 0) {
				continue;
			}

			gsap.fromTo(
				items,
				{ autoAlpha: 0, y: Math.max(10, y * 0.7) },
				{
					autoAlpha: 1,
					y: 0,
					duration: Math.max(0.42, duration - 0.1),
					ease,
					stagger,
					clearProps: 'opacity,visibility,transform',
					scrollTrigger: {
						trigger: group,
						start: 'top 88%',
						once
					}
				}
			);
		}
	}, root);
}

export { gsap, ScrollTrigger };
