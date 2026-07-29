import { defineConfig, devices } from '@playwright/test';

// E2E projects: mobile + desktop primary (Test Plan §5). Tablet spot-checks land later.
//
// webServer serves the real adapter-static `build/` output through scripts/serve-build.mjs,
// not `vite preview` — preview emits its own shell with relative asset paths, while
// build/index.html (the artifact Vercel actually deploys, per vercel.json) uses absolute ones.
// Under preview, a deep-link F5 with the service worker active 404s every module to the SPA
// fallback and never boots, so the old config exercised a different artifact than production
// (same class of bug W-035 fixed for SW registration — see
// specs/reports/2026-07-29-boot-flash.md, "out-of-scope findings"). One project, not two: every
// spec in this suite needs a production-representative artifact, there is no case for keeping
// `vite preview` around for anything.
export default defineConfig({
	webServer: {
		command: 'npm run build && node scripts/serve-build.mjs',
		port: 4173,
		reuseExistingServer: !process.env.CI,
	},
	use: { baseURL: 'http://localhost:4173' },
	testMatch: '**/*.e2e.{ts,js}',
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
	],
});
