<script lang="ts">
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import type { PerspectiveCamera } from 'three';
	import FloatingShape from './FloatingShape.svelte';

	type ShapeConfig = {
		geometry: 'icosahedron' | 'octahedron' | 'dodecahedron';
		position: [number, number, number];
		initialRotation: [number, number, number];
		scale: number;
		rotationSpeed: [number, number, number];
		floatSpeed: number;
		floatAmplitude: number;
		scrollInfluence: [number, number, number];
		color: string;
		emissive: string;
	};

	const SHAPES: ShapeConfig[] = [
		{
			geometry: 'icosahedron',
			position: [-3.6, 1.6, -1.2],
			initialRotation: [0.38, 0.72, 0.19],
			scale: 0.95,
			rotationSpeed: [0.18, 0.26, 0.1],
			floatSpeed: 0.7,
			floatAmplitude: 0.45,
			scrollInfluence: [0.16, -0.52, 0.84],
			color: '#8b5cf6',
			emissive: '#c4b5fd'
		},
		{
			geometry: 'octahedron',
			position: [4.3, 2.7, -5.8],
			initialRotation: [0.92, 0.21, 0.46],
			scale: 1.2,
			rotationSpeed: [0.07, 0.18, 0.08],
			floatSpeed: 0.55,
			floatAmplitude: 0.4,
			scrollInfluence: [-0.2, 0.38, -0.56],
			color: '#a78bfa',
			emissive: '#ddd6fe'
		},
		{
			geometry: 'dodecahedron',
			position: [1.6, -1.8, -3.6],
			initialRotation: [0.26, 1.06, 0.34],
			scale: 0.9,
			rotationSpeed: [0.12, 0.14, 0.21],
			floatSpeed: 0.8,
			floatAmplitude: 0.36,
			scrollInfluence: [0.12, 0.46, 0.64],
			color: '#7c3aed',
			emissive: '#a78bfa'
		},
		{
			geometry: 'icosahedron',
			position: [-1.4, 3.3, -6.6],
			initialRotation: [0.54, 0.36, 0.88],
			scale: 1.35,
			rotationSpeed: [0.08, 0.16, 0.05],
			floatSpeed: 0.45,
			floatAmplitude: 0.32,
			scrollInfluence: [0.14, -0.4, -0.72],
			color: '#8b5cf6',
			emissive: '#ddd6fe'
		},
		{
			geometry: 'octahedron',
			position: [5.1, -0.6, -8.3],
			initialRotation: [0.18, 0.94, 0.52],
			scale: 1.55,
			rotationSpeed: [0.06, 0.08, 0.05],
			floatSpeed: 0.38,
			floatAmplitude: 0.28,
			scrollInfluence: [-0.08, 0.32, -0.9],
			color: '#6d28d9',
			emissive: '#c4b5fd'
		},
		{
			geometry: 'dodecahedron',
			position: [-5.6, -2.2, -8.8],
			initialRotation: [0.74, 0.42, 0.31],
			scale: 1.25,
			rotationSpeed: [0.05, 0.11, 0.05],
			floatSpeed: 0.58,
			floatAmplitude: 0.31,
			scrollInfluence: [0.06, -0.28, -0.88],
			color: '#a78bfa',
			emissive: '#ddd6fe'
		},
		{
			geometry: 'octahedron',
			position: [0.3, -3.7, -2.6],
			initialRotation: [1.02, 0.14, 0.63],
			scale: 0.72,
			rotationSpeed: [0.16, 0.12, 0.2],
			floatSpeed: 0.92,
			floatAmplitude: 0.27,
			scrollInfluence: [-0.18, 0.58, 0.74],
			color: '#8b5cf6',
			emissive: '#c4b5fd'
		}
	];

	let camera: PerspectiveCamera | undefined;
	let reducedQuality = $state(false);
	let dpr = $state(Math.min(window.devicePixelRatio, 1.6));
	let hasLowEndProfile = $state(false);

	let targetMouseX = 0.22;
	let targetMouseY = -0.12;
	let currentMouseX = 0.22;
	let currentMouseY = -0.12;

	let renderShapes = $derived(reducedQuality ? SHAPES.slice(0, 4) : SHAPES);

	function handleLowPerformance() {
		reducedQuality = true;
		dpr = Math.min(dpr, 1);
	}

	$effect(() => {
		if (!browser) {
			return;
		}

		const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

		hasLowEndProfile =
			(typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) ||
			(typeof deviceMemory === 'number' && deviceMemory <= 4);

		if (hasLowEndProfile) {
			reducedQuality = true;
			dpr = 1;
		} else {
			dpr = Math.min(window.devicePixelRatio, 1.6);
		}

		const onPointerMove = (event: PointerEvent) => {
			targetMouseX = ((event.clientX / window.innerWidth) * 2 - 1) * 0.8;
			targetMouseY = ((event.clientY / window.innerHeight) * 2 - 1) * -0.45;
		};

		window.addEventListener('pointermove', onPointerMove, { passive: true });

		let frame = 0;
		let previousFrameTime = window.performance.now();
		let lowFpsFrames = 0;
		const animateCamera = () => {
			const now = window.performance.now();
			const deltaMs = now - previousFrameTime;
			previousFrameTime = now;

			if (!reducedQuality) {
				if (deltaMs > 33) {
					lowFpsFrames += 1;
				} else {
					lowFpsFrames = Math.max(0, lowFpsFrames - 2);
				}

				if (lowFpsFrames > 60) {
					handleLowPerformance();
				}
			}

			if (camera) {
				const maxScrollableDistance = Math.max(
					1,
					document.documentElement.scrollHeight - window.innerHeight
				);
				const scrollRatio = Math.min(window.scrollY / maxScrollableDistance, 1);
				currentMouseX += (targetMouseX - currentMouseX) * 0.04;
				currentMouseY += (targetMouseY - currentMouseY) * 0.04;

				camera.position.x = currentMouseX * 1.25;
				camera.position.y = currentMouseY + scrollRatio * 0.7;
				camera.position.z = 8.4 - scrollRatio * 1.65 + Math.abs(currentMouseX) * 0.2;
				camera.lookAt(0, scrollRatio * 0.18, -4.9);
			}

			frame = window.requestAnimationFrame(animateCamera);
		};

		frame = window.requestAnimationFrame(animateCamera);

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.cancelAnimationFrame(frame);
		};
	});
</script>

<div class="scene-shell" aria-hidden="true">
	{#if browser}
		<Canvas {dpr} colorManagementEnabled={true}>
			<T.PerspectiveCamera ref={camera} makeDefault position={[0.52, -0.08, 8.45]} fov={42} />
			<T.Fog attach="fog" args={['#0f172a', 8, 26]} />

			<T.AmbientLight intensity={0.28} color="#c4b5fd" />
			<T.HemisphereLight args={['#f5f3ff', '#2e1065', 0.82]} />
			<T.DirectionalLight position={[6.5, 8, 5.5]} intensity={1.28} color="#ede9fe" />
			<T.DirectionalLight position={[-7.2, 3.2, -11]} intensity={1.05} color="#c4b5fd" />
			<T.PointLight position={[-5.8, -2.8, -1.5]} intensity={1.8} color="#8b5cf6" distance={26} />
			<T.PointLight position={[2.4, 1.8, -8.2]} intensity={1.55} color="#c4b5fd" distance={22} />

			{#each renderShapes as shape, index (`${shape.geometry}-${index}`)}
				<FloatingShape {...shape} bloom={!reducedQuality} />
			{/each}
		</Canvas>
	{/if}
</div>

<style>
	.scene-shell {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		opacity: 0.96;
		filter: saturate(1.12) contrast(1.08);
	}
</style>
