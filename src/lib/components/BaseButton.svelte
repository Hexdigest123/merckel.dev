<script lang="ts">
	export let text: string;
	export let id: string;
</script>

<button
	id={id !== undefined ? `${id}` : ''}
	class="px-10 py-3 bg-primary rounded-xl text-white font-bold text-lg transition-transform hover:scale-[1.02] duration-150 bg-orange-600"
	><span>{text}</span></button
>
