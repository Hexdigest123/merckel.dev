<script lang="ts">
	import BaseButton from '$lib/components/BaseButton.svelte';
	interface ISoftware {
		name: string;
		client: string;
		description: string;
		imageURL: string;
	}
	const software: ISoftware[] = [
		{
			name: 'LogiqIT',
			client: 'Merckel & Witzdam GbR',
			description:
				'We developed the LogiQ IT website to present our innovative approach to software development, highlight our client-centric philosophy, and secure new leads  through a dynamic online presence.',
			imageURL: 'logiqit.webp'
		},
		{
			name: 'Landhaus Pantförder',
			client: 'Martin Hilbolt',
			description:
				"The redesigned website successfully conveys Med Mobil's dedication to quality care. The improved user experience is likely to attract potential patients.",
			imageURL: 'medmobil.webp'
		}
	];
</script>

<div class="flex gap-2 justify-center mb-6 md:my-8">
	<h1 class="md:text-6xl text-5xl font-indie-flower">Software</h1>
	<p class="text-2xl md:text-3xl self-end font-indie-flower text-orange-600">i work on</p>
</div>
<div>
	<div class="mx-auto max-w-fit">
		<BaseButton><a href="/software/tools">Visit Tools</a></BaseButton>
	</div>
	<ul>
		{#each software as item}
			<li class="mx-auto border-b-gray-400 border-b-2 mb-6 md:max-w-5xl">
				<h2 class="text-bold text-2xl">{item.name}</h2>
				<h3 class="opacity-75 text-xl">{item.client}</h3>
				<p>{item.description}</p>
				<img src={item.imageURL} alt={`${item.client} website picture`} />
			</li>
		{/each}
	</ul>
</div>
