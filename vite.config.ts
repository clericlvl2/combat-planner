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
			// ADR-005: first run always defaults to English (baseLocale) — no browser-locale
			// autodetection; switchable in Settings, persisted to localStorage thereafter.
			// No URL-based localization (client-only SPA) — keep locale out of the path.
			strategy: ['localStorage', 'baseLocale'],
		}),
		// ADR-004: full-shell precache, prompt-to-reload update flow. Manifest generated here.
		SvelteKitPWA({
			registerType: 'prompt',
			// W-035: pin the registration to absolute URLs. SvelteKit's `paths.relative` defaults to
			// true, so Vite `base` is './', and vite-plugin-pwa reads its own `base` off `viteConfig.base`
			// (dist/index.js:805) straight into the register template — `register('./sw.js', ...)`.
			// That resolves against the *document* URL: fine at '/' and '/settings', but on
			// '/combats/<id>' (the app's primary screen) it becomes '/combats/sw.js' and registration
			// dies, taking offline, installability and the update toast with it. The same `base` also
			// prefixes the injected `<link rel="manifest">` href (dist/index.js:305), so this fixes that
			// depth bug too. Note this is the *top-level* option, not `kit.base` — the latter only feeds
			// navigateFallback and the manifest transform, and never reaches the register template.
			base: '/',
			scope: '/',
			// adapter-static (ADR-007) writes index.html during its adapt() step, which runs
			// *after* this plugin's closeBundle, so workbox globs a client/ tree where the
			// fallback shell doesn't exist yet. spa + adapterFallback tell the plugin to
			// synthesize the missing precache entry itself, revisioned off
			// client/_app/version.json instead of hashing the (absent) file.
			kit: {
				spa: true,
				adapterFallback: 'index.html',
			},
			// TODO M-phase: replace placeholder artwork with real icons (see static/icons/README.md).
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
					{ src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
					{ src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
					{
						src: 'icons/pwa-512x512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				// Full app-shell precache => every feature works offline (ADR-004).
				// Scoped to client/** (the tree that actually exists at glob time - see the
				// kit.adapterFallback comment above) with the font extensions added back in;
				// the plugin's own client/** default omits woff/woff2.
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,json,webmanifest}'],
				// Client-side deep links resolve offline to the synthesized shell above.
				navigateFallback: '/index.html',
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
