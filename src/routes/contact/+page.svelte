<script lang="ts">
	import BaseButton from '$lib/components/BaseButton.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let loading: boolean = false;
	$: loading = false;

	let show: boolean = false;
	$: show = false;

	let ToastMessage: string = '';
	$: ToastMessage;

	let ToastColor: string = 'bg-green-500';
	$: ToastColor;

	async function handleSubmit($event: Event) {
		loading = true;
		if ($event === undefined) return;
		$event.preventDefault();
		if ($event.target === null) {
			return;
		}

		let name = ($event.target as HTMLFormElement).realname.value;
		let email = ($event.target as HTMLFormElement).email.value;
		let message = ($event.target as HTMLFormElement).message.value;
		if (name === null || email === null || message === null) return;

		const response = await fetch('contact', {
			method: 'POST',
			body: JSON.stringify({ name, email, message })
		});
		loading = false;
		if (response.status === 200) {
			ToastMessage = 'E-Mail sent!';
			ToastColor = 'bg-green-500';
			show = true;
			setTimeout(() => {
				show = false;
			}, 5000);
			name = '';
			email = '';
			message = '';
		} else {
			const message = await response.text();
			ToastMessage = message;
			ToastColor = 'bg-red-500';
			show = true;
			setTimeout(() => {
				show = false;
			}, 5000);
		}
	}
</script>

<div class="flex gap-2 justify-center mb-6 md:my-8">
	<h1 class="md:text-6xl text-5xl font-indie-flower">Contact</h1>
	<p class="text-2xl md:text-3xl self-end font-indie-flower text-orange-600">me directly!</p>
</div>

<div>
	<form
		method="POST"
		class="flex flex-col justify-center gap-6"
		id="email_form"
		on:submit={handleSubmit}
	>
		<div class="relative float-label-input group">
			<input
				type="text"
				id="realname"
				placeholder=" "
				class="w-full bg-white focus:outline-none focus:shadow-outline border-2 border-gray-300 rounded-md py-3 px-4 appearance-none leading-normal focus:border-primary"
				required
			/>
			<label
				for="realname"
				class="absolute top-3 left-0 opacity-60 pointer-events-none transition duration-200 px-4 group-focus-within:text-primary"
				>Your Name</label
			>
		</div>
		<div class="relative float-label-input group">
			<input
				type="email"
				id="email"
				placeholder=" "
				class="w-full bg-white focus:outline-none focus:shadow-outline border-2 border-gray-300 rounded-md py-3 px-4 appearance-none leading-normal focus:border-primary"
				required
			/>
			<label
				for="email"
				class="absolute top-3 left-0 opacity-60 pointer-events-none transition duration-200 px-4 group-focus-within:text-primary"
				>Your Mail</label
			>
		</div>
		<div class="relative float-label-input group">
			<textarea
				id="message"
				placeholder=" "
				rows="5"
				class="w-full bg-white focus:outline-none focus:shadow-outline border-2 border-gray-300 rounded-md py-3 px-4 appearance-none leading-normal focus:border-primary"
				required
			></textarea>
			<label
				for="message"
				class="absolute top-3 left-0 opacity-60 pointer-events-none transition duration-200 px-4 group-focus-within:text-primary"
				>How can i help you?</label
			>
		</div>
		<BaseButton id="submit" {loading}>Send</BaseButton>
		<Toast color={ToastColor} message={ToastMessage} loading={show} />
	</form>
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
