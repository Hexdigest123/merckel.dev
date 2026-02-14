import type { SiteConfig } from '$lib/types/content';

export const siteConfig: SiteConfig = {
	name: 'Pierre-Maurice Merckel',
	title: 'Geschäftsführer und Softwareentwickler',
	subtitle: 'Erstellung branchenspezifischer Software für Endkunden aller Art.',
	bio: 'Ich entwickle Software, die wirklich benutzt wird und nicht nur schön aussieht. Seit über vier Jahren arbeite ich als Softwareentwickler und begleite Projekte von der ersten Idee bis zum laufenden Betrieb. Dabei habe ich mit Technologien wie Next.js, Svelte, PostgreSQL und verschiedenen DevOps-Tools gearbeitet und gelernt, was in der Praxis funktioniert und was nur auf Slides gut aussieht. Als Geschäftsführer verbinde ich Technik mit Verantwortung. Ich baue Teams auf, priorisiere Projekte sinnvoll und sorge dafür, dass aus Anforderungen funktionierende Produkte werden. Mir geht es nicht um Buzzwords, sondern um saubere Lösungen, die Unternehmen im Alltag weiterbringen.',
	email: 'pierre@merckel.dev',
	socials: [
		{
			platform: 'GitHub',
			url: 'https://github.com/Hexdigest123',
			icon: 'github'
		},
		{
			platform: 'Gitea',
			url: 'https://git.merckel.dev',
			icon: 'github'
		},
		{
			platform: 'Email',
			url: 'mailto:pierre@merckel.dev',
			icon: 'email'
		}
	]
};
