<script lang="ts">
	import '../app.css'; // required to load tailwindcss
	import Menu from '$lib/assets/menu.svelte';
	import Mail from '$lib/assets/mail.svelte';
	import Twitter from '$lib/assets/twitter.svelte';
	import GitHub from '$lib/assets/github.svelte';
	import Arrow from '$lib/assets/arrow.svelte';

	interface IMenuOption {
		label: string;
		href: string;
	}

	let pageOptions: IMenuOption[] = [
		{ label: 'Homepage', href: '/' },
		{ label: 'Skills', href: '/skills' },
		{ label: 'Software', href: '/software' },
		{ label: 'Contact', href: '/contact' }
	];

	let toolOptions: IMenuOption[] = [];

	let menuOpen = false;
	$: menuOpen;
</script>

{#if menuOpen}
	<div class="absolute w-screen h-screen bg-white p-4">
		<div class="flex justify-end">
			<button
				id="toggle_menu"
				on:click={() => {
					menuOpen = !menuOpen;
				}}
			>
				<Menu></Menu>
			</button>
		</div>
		<h2 class="font-bold text-2xl border-b-2 border-black mb-4">Pages</h2>
		<div class="flex flex-col gap-2 mb-4">
			{#if pageOptions.length > 0}
				{#each pageOptions as option}
					<a
						href={option.href}
						class="hover:underline underline-offset-4 text-2xl"
						on:click={() => {
							menuOpen = !menuOpen;
						}}>{option.label}</a
					>
				{/each}
			{:else}
				<h2 class="text-xl font-bold">Coming soon...</h2>
			{/if}
		</div>
		<h2 class="font-bold text-2xl border-b-2 border-black mb-4">Tools</h2>
		{#if toolOptions.length > 0}
			{#each toolOptions as option}
				<a
					href={option.href}
					class="hover:underline underline-offset-4 text-2xl"
					on:click={() => {
						menuOpen = !menuOpen;
					}}>{option.label}</a
				>
			{/each}
		{:else}
			<h2 class="text-xl font-bold">Coming soon...</h2>
		{/if}
		<div class="mt-8 flex justify-center gap-x-8">
			<a
				href="https://twitter.com/MerckelPierre"
				class="bg-gray-300 p-2 rounded-xl"
				aria-label="Link to Twitter"><Twitter width={32} height={32}></Twitter></a
			>
			<a
				href="https://github.com/Hexdigest123"
				class="bg-gray-300 p-2 rounded-xl"
				aria-label="Link to GitHub"><GitHub width={32} height={32}></GitHub></a
			>
			<a href="mailto:pierre@merckel.dev" class="bg-gray-300 p-2 rounded-xl" aria-label="Mail to me"
				><Mail width={32} height={32}></Mail></a
			>
		</div>
	</div>
{/if}

<header id="header" class="flex justify-between p-4">
	<a href="/contact" class="md:hidden" aria-label="Mail to me">
		<Mail></Mail>
	</a>
	<button
		id="burger_menu_btn"
		on:click={() => {
			menuOpen = !menuOpen;
		}}
		class="md:hidden"><Menu></Menu></button
	>
	<div class="hidden md:flex gap-x-8 mx-auto font-bold text-xl">
		{#each pageOptions as option}
			<a href={option.href} class="hover:underline underline-offset-4">{option.label}</a>
		{/each}
	</div>
</header>
<main class="p-6 min-h-screen">
	{#if !menuOpen}
		<slot />
	{/if}
</main>
<footer class="flex justify-between p-6">
	<p class="my-auto">@Copyright 2024</p>
	<div class="bg-gray-300 p-2 w-min h-min rounded-xl">
		<a href="#header" aria-label="jump to top"><Arrow></Arrow></a>
	</div>
</footer>
