import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
			},
			// ADR-007: client-only SPA. fallback => prerendered shell that hands off to client routing.
			adapter: adapter({ fallback: 'index.html' }),
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			// ADR-005: locale auto-detected from the browser, switchable in Settings, persisted.
			// No URL-based localization (client-only SPA) — keep locale out of the path.
			strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
		}),
		// ADR-004: full-shell precache, prompt-to-reload update flow. Manifest generated here.
		SvelteKitPWA({
			registerType: 'prompt',
			// TODO M-phase: replace placeholder icons with real raster assets (see static/icons/README.md).
			manifest: {
				name: 'Combat Planner',
				short_name: 'Combat Planner',
				description: 'Offline 13th Age initiative tracker. Local-only, private, no accounts.',
				lang: 'en',
				theme_color: '#18181b',
				background_color: '#18181b',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				scope: '/',
				icons: [
					{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
					{
						src: 'icons/icon-maskable.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				// Full app-shell precache => every feature works offline (ADR-004).
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,json}'],
			},
			devOptions: {
				// Keep the SW out of dev/test so it never interferes with HMR or Vitest.
				enabled: false,
			},
		}),
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }],
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
				},
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
		],
	},
});
