<script lang="ts">
	import { createLocaleStore } from '$lib/i18n/locale.svelte';
	import CommandPalette from '../CommandPalette.svelte';
	import type { CommandPaletteSection } from '$lib/utils/command-palette';

	let { sections }: { sections: readonly CommandPaletteSection[] } = $props();

	createLocaleStore('de');
</script>

<CommandPalette {sections} />
