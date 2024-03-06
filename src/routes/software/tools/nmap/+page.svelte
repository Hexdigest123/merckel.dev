<script lang="ts">
	import BaseButton from '$lib/components/BaseButton.svelte';

	interface ISetting {
		name: string;
		key: string;
		id: string;
	}
	const nmapSettings: ISetting[] = [
		{ name: 'Service scan', key: '-sV', id: 'service' },
		{ name: 'Ping scan', key: '-sP', id: 'ping' },
		{ name: 'TCP Connect', key: '-sT', id: 'tcpconnect' }
	];

	let content = 'Please start the scan!';
	$: content;

	function getKey(settingID: string): string | undefined {
		return nmapSettings.find((setting) => setting.id === settingID)?.key;
	}

	const submitForm = async (event: Event) => {
		let command: string = '';
		event.preventDefault();
		const host = (event.target as HTMLFormElement).host.value;
		const service = (event.target as HTMLFormElement).service.checked;
		const ping = (event.target as HTMLFormElement).ping.checked;
		const tcpconnect = (event.target as HTMLFormElement).tcpconnect.checked;

		if (host === '') {
			content = 'Please provide a valid IP/Hostname!';
			return;
		}
		if (service) {
			command += `${getKey('service')} `;
		}
		if (ping) {
			command += `${getKey('ping')} `;
		}
		if (tcpconnect) {
			command += `${getKey('tcpconnect')} `;
		}

		content = '';
		const response = await fetch('/software/tools/nmap', {
			method: 'POST',
			body: JSON.stringify({
				host,
				command
			})
		});
		content = await response.text();
	};
</script>

<div class="flex gap-2 justify-center mb-6 md:my-8">
	<h1 class="md:text-6xl text-5xl font-indie-flower">Nmap</h1>
	<p class="text-2xl md:text-3xl self-end font-indie-flower text-orange-600">Interface</p>
</div>

<form on:submit={submitForm}>
	<p class="text-3xl md:text-4xl self-end font-indie-flower text-orange-600 mb-4">Settings</p>
	<div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
		{#each nmapSettings as setting}
			<div class="relative float-label-input group mb-4">
				<input type="checkbox" id={setting.id} />
				<label for={setting.name}>{setting.name}</label>
			</div>
		{/each}
	</div>
	<div class="relative float-label-input group mb-4">
		<input
			type="text"
			id="host"
			placeholder=" "
			class="w-full bg-white focus:outline-none focus:shadow-outline border-2 border-gray-300 rounded-md py-3 px-4 appearance-none leading-normal focus:border-primary"
			required
		/>
		<label
			for="host"
			class="absolute top-3 left-0 opacity-60 pointer-events-none transition duration-200 px-4 group-focus-within:text-primary"
			>IP/Hostname</label
		>
	</div>
	<BaseButton fullWidth type="submit">Scan</BaseButton>
</form>

<div class="mt-8">
	<p class="text-3xl md:text-4xl self-end font-indie-flower text-orange-600 mb-4">Output</p>
	{#if content}
		<p>{@html content}</p>
	{:else}
		<span>
			<svg
				aria-hidden="true"
				class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
				viewBox="0 0 100 101"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
					fill="white"
				/>
				<path
					d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
					fill="light_blue"
				/>
			</svg>
		</span>
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
