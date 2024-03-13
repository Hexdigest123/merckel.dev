<script lang="ts">
	interface IExperience {
		name: string;
		date: string;
		job: string;
		location: string;
	}
	interface ISkill {
		name: string;
		description: string;
	}
	interface IEducation {
		name: string;
		course: string;
	}
	const Knowledge: IExperience[] = [
		{
			name: 'ITZ Bund',
			date: '2019-2020',
			job: 'Internship Software Engineering',
			location: 'Düsseldorf, Germany'
		},
		{
			name: 'LogiqIT',
			date: '2022-Today',
			job: 'Software Engineer & Customer Relationship',
			location: 'Gelsenkrichen'
		}
	];
	const Skills: ISkill[] = [
		{
			name: 'TypeScript',
			description:
				'Developing for LogiqIT required me to gain deep knowledge in using TypeScript for Frontend / Backend.'
		},
		{
			name: 'Rust',
			description:
				'Developing GUI tools safely but performant is often not easy that is why i learned Rust'
		},
		{
			name: 'Astro',
			description:
				"I have been using Astro to significantly improve my clients' website performance, while also applying principles from other frameworks to enhance my Astro infrastructure."
		},
		{
			name: 'Svelte',
			description:
				'I have been using Svelte to significantly improve my time to delivery due to its easy-to-use yet performant infrastructure.'
		}
	];
	const Education: IEducation[] = [
		{
			name: 'Berufskolleg Gelsenkirchen',
			course: 'High School Diploma / Abitur'
		},
		{
			name: 'University of Duisburg-Essen (UDE)',
			course: 'Bachelor of Science, Software Engineering'
		}
	];
</script>

<div class="flex gap-2 justify-center mb-6 md:my-8">
	<h1 class="md:text-6xl text-5xl font-indie-flower">Knowledge</h1>
	<p class="text-2xl md:text-3xl self-end font-indie-flower text-orange-600">i gathered</p>
</div>
<div class="md:flex md:flex-col md:items-center md:max-w-1/2 mb-6">
	<h2 class="md:text-4xl text-3xl font-indie-flower">Skills</h2>
	<ul>
		{#each Skills as item}
			<li class="my-4">
				<h3 class="font-bold">{item.name}</h3>
				<p class="md:text-pretty md:max-w-96">{item.description}</p>
			</li>
		{/each}
	</ul>
</div>
<div class="md:flex md:flex-col md:items-center md:max-w-1/2 mb-6">
	<h2 class="md:text-4xl text-3xl font-indie-flower">Experience</h2>
	<ul>
		{#each Knowledge as item}
			<li class="my-4">
				<h3 class="font-bold">{item.name}</h3>
				<p>{item.date}</p>
				<p>{item.job}</p>
				<p>{item.location}</p>
			</li>
		{/each}
	</ul>
</div>
<div class="md:flex md:flex-col md:items-center md:max-w-1/2 mb-6">
	<h2 class="md:text-4xl text-3xl font-indie-flower">Education</h2>
	<ul>
		{#each Education as item}
			<li class="my-4">
				<h3 class="font-bold">{item.name}</h3>
				<p>{item.course}</p>
			</li>
		{/each}
	</ul>
</div>

<style></style>
