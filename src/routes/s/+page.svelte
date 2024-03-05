<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	function redirectToHome() {
		goto('/');
	}
	onMount(() => {
		redirectToHome();
	});
</script>
