<script lang="ts">
	import { goto } from '$app/navigation';
	interface ITools {
		name: string;
		categories: string[];
		available: boolean;
		toolURL: string;
	}
	const software: ITools[] = [];
	const filtered_software: ITools[] = software;

	const handleChange = (e: Event) => {
		let searchTerm = (e.target as HTMLInputElement).value;
		software.filter((item) => {
			return item.name.includes(searchTerm);
		});
	};
</script>

<div class="flex gap-2 justify-center mb-6 md:my-8">
	<h1 class="md:text-6xl text-5xl font-indie-flower">Tools</h1>
	<p class="text-2xl md:text-3xl self-end font-indie-flower text-orange-600">i created</p>
</div>
<div>
	<div class="relative float-label-input group mb-4">
		<input
			type="text"
			id="search"
			placeholder=" "
			class="w-full bg-white focus:outline-none focus:shadow-outline border-2 border-gray-300 rounded-md py-3 px-4 appearance-none leading-normal focus:border-primary"
			on:input={handleChange}
		/>
		<label
			for="search"
			class="absolute top-3 left-0 opacity-60 pointer-events-none transition duration-200 px-4 group-focus-within:text-primary"
			>Search</label
		>
	</div>
	{#if filtered_software.length === 0}
		<h2 class="text-xl">There are no tools available!</h2>
	{:else}
		<div class="md:grid md:grid-cols-2 xl:grid-cols-3 md:grid-rows-4 md:gap-4">
			{#each filtered_software as item}
				<button
					class=" mb-6 md:max-w-1/2 shadow-[0_0_2px_0_black] rounded-xl p-4"
					on:click={() => {
						goto(item.toolURL);
					}}
				>
					<div class="flex items-center">
						<h2 class="text-2xl mb-2">{item.name}</h2>
						{#if item.available}
							<div class="ml-auto rounded-xl w-4 h-4 empty:bg-green-500"></div>
						{:else}
							<div class="ml-auto rounded-xl w-4 h-4 empty:bg-red-500"></div>
						{/if}
					</div>
					<ul class="flex gap-2 flex-wrap">
						{#each item.categories as category}
							<li class="bg-gray-500 rounded-xl max-w-fit px-2">
								<span class="text-white">{category}</span>
							</li>
						{/each}
					</ul>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.float-label-input:focus-within label,
	.float-label-input input:not(:placeholder-shown) + label {
		transform: translateY(-1.5rem) scale(0.75);
		background-color: white;
		opacity: 1;
	}
	.float-label-input:focus-within label,
	.float-label-input textarea:not(:placeholder-shown) + label {
		transform: translateY(-1.5rem) scale(0.75);
		background-color: white;
		opacity: 1;
	}
</style>
