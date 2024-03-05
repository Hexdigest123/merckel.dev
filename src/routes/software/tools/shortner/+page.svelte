<script lang="ts">
	import BaseButton from '$lib/components/BaseButton.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let newURL: string = '';
	$: newURL;

	let toastMessage: string = '';
	$: toastMessage;
	let toastColor: string = '';
	$: toastColor;
	let toastLoading: boolean = false;
	$: toastLoading;

	const formSubmit = async ($event: Event) => {
		$event.preventDefault();
		let url = ($event.target as HTMLFormElement).url.value;
		const response = await fetch('/software/tools/shortner', {
			method: 'POST',
			body: JSON.stringify({
				url
			})
		});
		if (response.ok) {
			newURL = await response.text();
			copyToClipboard(newURL);
			toastMessage = 'Successfully created new URL!';
			toastColor = 'bg-green-500';
			toastLoading = true;
			setTimeout(() => {
				toastLoading = false;
			}, 5000);
		} else {
			toastMessage = `Execution failed! - ${await response.text()}`;
			toastColor = 'bg-red-500';
			toastLoading = true;
			setTimeout(() => {
				toastLoading = false;
			}, 5000);
		}
	};

	const copyToClipboard = async (content: string) => {
		try {
			await navigator.clipboard.writeText(content);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	};
</script>

<div class="flex gap-2 justify-center mb-6 md:my-8">
	<h1 class="md:text-6xl text-5xl font-indie-flower">URL</h1>
	<p class="text-2xl md:text-3xl self-end font-indie-flower text-orange-600">shortner</p>
</div>

<form on:submit={formSubmit} class="md:max-w-2xl md:mx-auto">
	<div class="relative float-label-input group mb-4">
		<input
			type="text"
			id="url"
			placeholder=" "
			class="w-full bg-white focus:outline-none focus:shadow-outline border-2 border-gray-300 rounded-md py-3 px-4 appearance-none leading-normal focus:border-orange-500"
		/>
		<label
			for="url"
			class="absolute top-3 left-0 opacity-60 pointer-events-none transition duration-200 px-4 group-focus-within:text-orange-500"
		>
			URL
		</label>
	</div>
	<BaseButton fullWidth type="submit">Short URL</BaseButton>
</form>

<div class="md:max-w-2xl md:mx-auto mt-4">
	{#if newURL !== ''}
		<div class="flex gap-2 justify-center flex-wrap">
			<p class="text-lg">Your new URL:</p>
			<a class="text-lg" href={newURL}>{newURL}</a>
		</div>
		<BaseButton>Copy</BaseButton>
	{/if}
</div>

<Toast message={toastMessage} color={toastColor} loading={toastLoading} />

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
