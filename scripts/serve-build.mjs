#!/usr/bin/env node
// Serves the adapter-static `build/` output, replicating vercel.json's routing so e2e/capture
// runs exercise the real deployed artifact rather than `vite preview`'s shell (relative asset
// paths, no SPA rewrite) — see specs/reports/2026-07-29-boot-flash.md, "out-of-scope findings".
//
// Mirrors vercel.json:
//   - catch-all rewrite `/(.*)` -> `/index.html` for any path that isn't a real static file
//     (Vercel checks the filesystem before applying a rewrite, so existing assets are served
//     as-is; only unmatched paths fall back to the SPA shell).
//   - `Cache-Control: public, max-age=0, must-revalidate` on `/sw.js`.
//
// No external dependencies — node:http/node:fs/node:path only, same convention as
// scripts/check-i18n-parity.mjs.

import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BUILD_DIR = path.join(__dirname, '..', 'build');

const MIME_TYPES = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.md': 'text/markdown; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.wasm': 'application/wasm',
	'.webmanifest': 'application/manifest+json',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
};

function contentTypeFor(filePath) {
	return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

/** Resolves a request path against buildDir, refusing to escape it via `..` segments. */
function resolveStaticPath(buildDir, pathname) {
	const decoded = decodeURIComponent(pathname);
	const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
	return path.join(buildDir, normalized);
}

export function createServer(buildDir = BUILD_DIR) {
	const indexHtml = path.join(buildDir, 'index.html');

	return http.createServer((req, res) => {
		const url = new URL(req.url ?? '/', 'http://localhost');
		let filePath = resolveStaticPath(buildDir, url.pathname);

		if (existsSync(filePath) && statSync(filePath).isDirectory()) {
			filePath = path.join(filePath, 'index.html');
		}
		if (!existsSync(filePath) || !statSync(filePath).isFile()) {
			// No matching static asset: vercel.json's catch-all rewrite to /index.html.
			filePath = indexHtml;
		}

		if (!existsSync(filePath)) {
			res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
			return;
		}

		const headers = { 'Content-Type': contentTypeFor(filePath) };
		if (path.basename(filePath) === 'sw.js') {
			headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
		}
		res.writeHead(200, headers);
		createReadStream(filePath).pipe(res);
	});
}

function isMain() {
	return process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
}

if (isMain()) {
	const port = Number(process.argv[2] || process.env.PORT || 4173);
	const server = createServer();
	server.listen(port, () => {
		console.log(`Serving ${BUILD_DIR} at http://localhost:${port}`);
	});
}
