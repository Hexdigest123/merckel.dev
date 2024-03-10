<script lang="ts">
	import BaseButton from '$lib/components/BaseButton.svelte';
	interface ISoftware {
		name: string;
		client: string;
		description: string;
		imageURL: string;
		websiteURL: string;
	}
	const software: ISoftware[] = [
		{
			name: 'LogiqIT',
			client: 'Merckel & Witzdam GbR',
			description:
				'We developed the LogiQ IT website to present our innovative approach to software development, highlight our client-centric philosophy, and secure new leads  through a dynamic online presence.',
			imageURL: 'logiqit.webp',
			websiteURL: 'https://logiqit.de'
		},
		{
			name: 'Landhaus Pantförder',
			client: 'Martin Hilbolt',
			description:
				"The redesigned website successfully conveys Med Mobil's dedication to quality care. The improved user experience is likely to attract potential patients.",
			imageURL: 'medmobil.webp',
			websiteURL: 'https://med-mobil.de'
		},
		{
			name: 'Bündnis Recklinghausen',
			client: 'Peter Gerwinat',
			description:
				'The website we created for Mr. Gerwinat should represent his ideas in a futuristic-looking manner to attract the youth and deliver his messages.',
			imageURL: 'buendnis.webp',
			websiteURL: 'https://buendnis-recklinghausen.de'
		}
	];
</script>

<div class="flex gap-2 justify-center mb-6 md:my-8">
	<h1 class="md:text-6xl text-5xl font-indie-flower">Software</h1>
	<p class="text-2xl md:text-3xl self-end font-indie-flower text-orange-600">i work on</p>
</div>
<div>
	<div class="mx-auto max-w-fit">
		<BaseButton id="visit_tools"
			><a href="/software/tools" aria-label="Visit Tools Link">Visit Tools</a></BaseButton
		>
	</div>
	<ul>
		{#each software as item}
			<li class="mx-auto border-b-gray-400 border-b-2 mb-6 md:max-w-5xl">
				<h2 class="text-bold text-2xl">{item.name}</h2>
				<h3 class="opacity-75 text-xl">{item.client}</h3>
				<p class="mb-4">{item.description}</p>
				<BaseButton id={`${item.name.toLowerCase()}`}>
					<a href={item.websiteURL} aria-label={`${item.name} visit`}>Visit {item.name}</a>
				</BaseButton>
				<img src={item.imageURL} alt={`${item.client} website picture`} width="1024" height="567" />
			</li>
		{/each}
	</ul>
</div>
