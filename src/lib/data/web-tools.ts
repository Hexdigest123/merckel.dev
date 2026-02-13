import type { WebTool } from '$lib/types/content';

export const webTools: WebTool[] = [
	{
		id: 'url-shortener',
		name: 'URL Shortener',
		slug: 'url-shortener',
		description: 'Shorten long URLs into clean, shareable links.',
		icon: 'link',
		category: 'utility',
		path: '/tools/url-shortener'
	},
	{
		id: 'cron-generator',
		name: 'Cron Expression Generator',
		slug: 'cron-generator',
		description: 'Build cron schedules visually with human-readable output.',
		icon: 'clock',
		category: 'developer',
		path: '/tools/cron-generator'
	},
	{
		id: 'text-diff',
		name: 'Text Diff Checker',
		slug: 'text-diff',
		description: 'Compare two texts side-by-side with highlighted differences.',
		icon: 'diff',
		category: 'developer',
		path: '/tools/text-diff'
	},
	{
		id: 'image-converter',
		name: 'Image Format Converter',
		slug: 'image-converter',
		description: 'Convert images between PNG, JPG, and WebP — entirely in your browser.',
		icon: 'image',
		category: 'utility',
		path: '/tools/image-converter'
	},
	{
		id: 'qr-generator',
		name: 'QR Code Generator',
		slug: 'qr-generator',
		description: 'Generate scalable SVG or PNG QR codes for any URL.',
		icon: 'qrcode',
		category: 'utility',
		path: '/tools/qr-generator'
	}
];
