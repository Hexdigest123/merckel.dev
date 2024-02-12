<script lang="ts">
	import Arrow from '$lib/assets/arrow.svelte';
	import Mail from '$lib/assets/mail.svelte';
	import Twitter from '$lib/assets/twitter.svelte';
	import GitHub from '$lib/assets/github.svelte';

	let descriptions: string[] = [
		'Software Engineer',
		'Web Developer',
		'Backend Developer',
		'Rust Developer',
		'C/C++ Developer',
		'Python Developer',
		'Project Managment'
	];
</script>

<div class="h-[100vh] md:flex md:justify-center">
	<div class="flex flex-col h-3/4 w-full justify-center md:max-w-[50%]">
		<p class="text-xl text-orange-600">
			{descriptions[Math.floor(Math.random() * descriptions.length)]}
		</p>
		<h1 class="text-center text-5xl font-bold my-4">Portfolio</h1>
		<p class="text-end text-xl text-orange-600">
			{descriptions[Math.floor(Math.random() * descriptions.length)]}
		</p>
		<div class="flex justify-center mt-12 animate-bounce">
			<div class="rotate-180">
				<a href="#hello"><Arrow width={36} height={36}></Arrow></a>
			</div>
		</div>
	</div>
</div>
<div class="md:flex md:items-center md:flex-col">
	<div class="flex gap-2">
		<h1 class="text-6xl font-indie-flower" id="hello">Hello</h1>
		<p class=" text-3xl self-end font-indie-flower text-orange-600">i'm Pierre</p>
	</div>
	<h2 class="text-lg font-bold">Welcome to my Portflio</h2>
	<p>
		I'm a 19-year-old software engineer specializing in web development. I primarily build front-end
		applications and also assist with back-end tasks.
		<br />
		My programming journey began with Java, giving me a strong foundation in coding principles.
		<br />
		Through C, I deepened that understanding, and later discovered a passion for creating websites for
		clients.
		<br />
		Feel free to contact me – I'm always happy to connect!
	</p>

	<div class="mt-6 flex gap-x-8">
		<a href="https://twitter.com/MerckelPierre" class="bg-gray-300 p-2 rounded-xl"
			><Twitter width={32} height={32}></Twitter></a
		>
		<a href="https://github.com/Hexdigest123" class="bg-gray-300 p-2 rounded-xl"
			><GitHub width={32} height={32}></GitHub></a
		>
		<a href="mailto:pierre@merckel.dev" class="bg-gray-300 p-2 rounded-xl"
			><Mail width={32} height={32}></Mail></a
		>
	</div>
</div>
