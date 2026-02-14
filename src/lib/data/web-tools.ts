import type { WebTool } from '$lib/types/content';

export const webTools: WebTool[] = [
	{
		id: 'url-shortener',
		name: 'URL Shortener',
		slug: 'url-shortener',
		description: 'Lange URLs in kurze, teilbare Links umwandeln.',
		icon: 'link',
		category: 'utility',
		path: '/tools/url-shortener'
	},
	{
		id: 'cron-generator',
		name: 'Cron Expression Generator',
		slug: 'cron-generator',
		description: 'Cron-Zeitpläne visuell erstellen mit lesbarer Ausgabe.',
		icon: 'clock',
		category: 'developer',
		path: '/tools/cron-generator'
	},
	{
		id: 'text-diff',
		name: 'Text Diff Checker',
		slug: 'text-diff',
		description: 'Zwei Texte nebeneinander vergleichen mit hervorgehobenen Unterschieden.',
		icon: 'diff',
		category: 'developer',
		path: '/tools/text-diff'
	},
	{
		id: 'image-converter',
		name: 'Image Format Converter',
		slug: 'image-converter',
		description: 'Bilder zwischen PNG, JPG und WebP konvertieren — komplett im Browser.',
		icon: 'image',
		category: 'utility',
		path: '/tools/image-converter'
	},
	{
		id: 'qr-generator',
		name: 'QR Code Generator',
		slug: 'qr-generator',
		description: 'Skalierbare SVG- oder PNG-QR-Codes für jede URL generieren.',
		icon: 'qrcode',
		category: 'utility',
		path: '/tools/qr-generator'
	}
];
