<script>
	import { page } from '$app/stores';
	import BaseButton from '$lib/components/BaseButton.svelte';
</script>

<div class="flex gap-2 mx-auto max-w-fit mb-8">
	<h1 class="text-6xl font-indie-flower" id="hello">Oh no</h1>
	<p class=" text-3xl self-end font-indie-flower text-orange-600">you're lost</p>
</div>
<div class="mx-auto max-w-fit mb-8">
	<p class="text-2xl text-center">
		You tried to visit <br /><span class="text-orange-600">{$page.url.pathname}</span>
	</p>
</div>

<div class="mx-auto max-w-fit">
	<BaseButton id="return_home"><a href="/" aria-label="go home">Go home</a></BaseButton>
</div>
