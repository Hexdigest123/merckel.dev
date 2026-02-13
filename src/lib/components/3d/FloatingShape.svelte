<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { AdditiveBlending, BackSide, type Group } from 'three';

	type GeometryType = 'icosahedron' | 'octahedron' | 'dodecahedron';
	type Triple = [number, number, number];

	let {
		geometry,
		position,
		initialRotation,
		scale,
		rotationSpeed,
		floatSpeed,
		floatAmplitude,
		scrollInfluence,
		color,
		emissive,
		bloom = true
	}: {
		geometry: GeometryType;
		position: Triple;
		initialRotation: Triple;
		scale: number;
		rotationSpeed: Triple;
		floatSpeed: number;
		floatAmplitude: number;
		scrollInfluence: Triple;
		color: string;
		emissive: string;
		bloom?: boolean;
	} = $props();

	let groupRef: Group | undefined;
	let elapsed = Math.random() * Math.PI * 2;

	useTask((delta) => {
		if (!groupRef) {
			return;
		}

		elapsed += delta;
		groupRef.rotation.x += rotationSpeed[0] * delta;
		groupRef.rotation.y += rotationSpeed[1] * delta;
		groupRef.rotation.z += rotationSpeed[2] * delta;

		if (typeof window !== 'undefined') {
			const maxScrollableDistance = Math.max(
				1,
				document.documentElement.scrollHeight - window.innerHeight
			);
			const scrollRatio = Math.min(window.scrollY / maxScrollableDistance, 1);
			const centeredScroll = scrollRatio - 0.5;
			const lateralFloat = Math.sin(elapsed * floatSpeed * 0.62) * floatAmplitude * 0.24;
			const depthFloat = Math.cos(elapsed * floatSpeed * 0.58) * floatAmplitude * 0.3;

			groupRef.position.x = position[0] + lateralFloat + centeredScroll * scrollInfluence[0];
			groupRef.position.y =
				position[1] +
				Math.sin(elapsed * floatSpeed) * floatAmplitude +
				centeredScroll * scrollInfluence[1];
			groupRef.position.z = position[2] + depthFloat + centeredScroll * scrollInfluence[2];
		}
	});
</script>

<T.Group ref={groupRef} {position} rotation={initialRotation}>
	<T.Mesh scale={[scale, scale, scale]}>
		{#if geometry === 'icosahedron'}
			<T.IcosahedronGeometry args={[1, 1]} />
		{:else if geometry === 'octahedron'}
			<T.OctahedronGeometry args={[1, 0]} />
		{:else}
			<T.DodecahedronGeometry args={[1, 0]} />
		{/if}
		<T.MeshPhysicalMaterial
			{color}
			{emissive}
			emissiveIntensity={0.62}
			roughness={0.24}
			metalness={0.66}
			flatShading
			clearcoat={0.8}
			clearcoatRoughness={0.18}
			reflectivity={0.75}
		/>
	</T.Mesh>

	<T.Mesh scale={[scale * 1.002, scale * 1.002, scale * 1.002]}>
		{#if geometry === 'icosahedron'}
			<T.IcosahedronGeometry args={[1, 1]} />
		{:else if geometry === 'octahedron'}
			<T.OctahedronGeometry args={[1, 0]} />
		{:else}
			<T.DodecahedronGeometry args={[1, 0]} />
		{/if}
		<T.MeshBasicMaterial color="#f5f3ff" transparent opacity={0.08} wireframe />
	</T.Mesh>

	{#if bloom}
		<T.Mesh scale={[scale * 1.35, scale * 1.35, scale * 1.35]}>
			{#if geometry === 'icosahedron'}
				<T.IcosahedronGeometry args={[1, 0]} />
			{:else if geometry === 'octahedron'}
				<T.OctahedronGeometry args={[1, 0]} />
			{:else}
				<T.DodecahedronGeometry args={[1, 0]} />
			{/if}
			<T.MeshBasicMaterial
				color={emissive}
				transparent
				opacity={0.16}
				blending={AdditiveBlending}
				side={BackSide}
			/>
		</T.Mesh>
	{/if}
</T.Group>
