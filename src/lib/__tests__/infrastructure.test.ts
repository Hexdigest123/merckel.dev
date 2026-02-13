import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Infrastructure', () => {
	const testDir = dirname(fileURLToPath(import.meta.url));
	const projectRoot = resolve(testDir, '../../..');

	it('should have Tailwind @theme directive in layout.css', () => {
		const layoutCssPath = resolve(projectRoot, 'src/routes/layout.css');
		const layoutCss = readFileSync(layoutCssPath, 'utf-8');
		expect(layoutCss).toContain('@theme {');
		expect(layoutCss).toContain('--color-slate-900: #0f172a');
		expect(layoutCss).toContain('--color-purple-500: #8b5cf6');
	});

	it('should have Space Grotesk font imports in root layout', () => {
		const layoutPath = resolve(projectRoot, 'src/routes/+layout.svelte');
		const layoutContent = readFileSync(layoutPath, 'utf-8');
		expect(layoutContent).toContain("import '@fontsource/space-grotesk/latin-400.css'");
		expect(layoutContent).toContain("import '@fontsource/space-grotesk/latin-600.css'");
		expect(layoutContent).toContain("import '@fontsource/space-grotesk/latin-700.css'");
	});

	it('should have JetBrains Mono font import in root layout', () => {
		const layoutPath = resolve(projectRoot, 'src/routes/+layout.svelte');
		const layoutContent = readFileSync(layoutPath, 'utf-8');
		expect(layoutContent).toContain("import '@fontsource/jetbrains-mono/latin-400.css'");
	});

	it('should have scroll-smooth class on html element in app.html', () => {
		const appHtmlPath = resolve(projectRoot, 'src/app.html');
		const appHtml = readFileSync(appHtmlPath, 'utf-8');
		expect(appHtml).toContain('class="scroll-smooth"');
		expect(appHtml).toMatch(/<html[^>]*class="scroll-smooth"/);
	});

	it('should have dark background on body element in app.html', () => {
		const appHtmlPath = resolve(projectRoot, 'src/app.html');
		const appHtml = readFileSync(appHtmlPath, 'utf-8');
		expect(appHtml).toContain('class="bg-slate-900"');
		expect(appHtml).toMatch(/<body[^>]*class="bg-slate-900"/);
	});

	it('should have slate-900 and purple-500 colors defined in theme', () => {
		const layoutCssPath = resolve(projectRoot, 'src/routes/layout.css');
		const layoutCss = readFileSync(layoutCssPath, 'utf-8');
		expect(layoutCss).toMatch(/--color-slate-900:\s*#0f172a/);
		expect(layoutCss).toMatch(/--color-purple-500:\s*#8b5cf6/);
	});

	it('should have font-sans and font-mono defined in theme', () => {
		const layoutCssPath = resolve(projectRoot, 'src/routes/layout.css');
		const layoutCss = readFileSync(layoutCssPath, 'utf-8');
		expect(layoutCss).toContain("--font-sans: 'Space Grotesk', sans-serif");
		expect(layoutCss).toContain("--font-mono: 'JetBrains Mono', monospace");
	});

	it('should have all required lib directories created', () => {
		const libPath = resolve(projectRoot, 'src/lib');
		const directories = [
			'components',
			'components/3d',
			'components/__tests__',
			'components/3d/__tests__',
			'types',
			'data',
			'utils',
			'stores'
		];

		directories.forEach((dir) => {
			const dirPath = resolve(libPath, dir);
			expect(existsSync(dirPath)).toBe(true);
		});
	});
});
