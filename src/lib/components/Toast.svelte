<script lang="ts">
	export let color: string = 'bg-green-500';
	export let message: string;
	export let loading: boolean = false;
	export let duration: number = 5000;
	$: if (loading) {
		setTimeout(() => {
			loading = false;
		}, duration);
	}
</script>

{#if loading}
	<div
		class={`transition-all duration-300 ease-in-out min-w-32 rounded-xl m-2 p-4 text-white absolute top-0 right-0 text-center ${color} hover:scale-105`}
	>
		<p class="text-xl">{message}</p>
	</div>
{/if}
