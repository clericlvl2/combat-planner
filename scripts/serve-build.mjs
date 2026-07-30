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
// Also replicates two things Vercel does that vercel.json doesn't spell out, because they were
// missing from earlier e2e/capture runs and inflated measured transfer size (W-051, see
// specs/reports/2026-07-29-boot-flash.md):
//   - Brotli/gzip content negotiation on the response, honouring `Accept-Encoding` — Vercel's
//     edge serves brotli to any client that offers it, which is every real browser.
//   - `Cache-Control: public, max-age=31536000, immutable` on SvelteKit's hashed build output
//     under `/_app/immutable/` (build confirms every file there — `assets/`, `chunks/`,
//     `entry/`, `nodes/` — is content-hashed, e.g. `BBrfdo3k.js`, `0.CgrFEE3m.css`: the hash
//     changes iff the content does, so it is safe to cache forever).
//
// Compression happens once at startup, not per request. Vercel's edge serves precompressed
// bytes, not brotli-quality-11-on-demand — brotliCompressSync on a large JS chunk costs
// 70-140ms of synchronous, single-threaded latency, which is itself a rig artifact big enough
// to distort cold-boot measurements (see specs/reports/2026-07-29-boot-flash.md, W-051's second
// correction). So the whole build directory is walked once when the server starts, every
// compressible file is compressed for both `br` and `gzip`, and the buffers are held in memory
// keyed by resolved path + encoding; every request is then served from that cache the way a CDN
// would, with `createReadStream` as the fallback only when the client offers no encoding this
// server negotiates.
//
// No external dependencies — node:http/node:fs/node:path/node:zlib only, same convention as
// scripts/check-i18n-parity.mjs.

import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

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

// Extensions worth compressing. Decision is by content type, not a blanket "compress
// everything": .png/.webp/.woff/.woff2/.wasm are already-compressed binary formats (PNG/WebP
// deflate their own pixel data, WOFF/WOFF2 embed a compressed font table, wasm binaries are
// already dense), so running brotli/gzip on them again spends CPU for zero or negative gain.
// .ico is a small binary icon container with the same property. Everything else served here is
// plain text (JS/CSS/HTML/JSON/SVG/MD/TXT/manifest) and compresses well.
const COMPRESSIBLE_EXTENSIONS = new Set([
	'.css',
	'.html',
	'.js',
	'.json',
	'.map',
	'.md',
	'.mjs',
	'.svg',
	'.txt',
	'.webmanifest',
]);

function isCompressible(filePath) {
	return COMPRESSIBLE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

/** Picks the best encoding this client offers, preferring brotli (what Vercel serves). */
function pickEncoding(acceptEncoding) {
	const header = (acceptEncoding ?? '').toLowerCase();
	if (header.includes('br')) return 'br';
	if (header.includes('gzip')) return 'gzip';
	return null;
}

function compress(buffer, encoding) {
	if (encoding === 'br') return brotliCompressSync(buffer);
	if (encoding === 'gzip') return gzipSync(buffer);
	return buffer;
}

/** Recursively lists every file under `dir`, as absolute paths. */
function listFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const entryPath = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...listFiles(entryPath));
		else if (entry.isFile()) files.push(entryPath);
	}
	return files;
}

/**
 * Walks `buildDir` once and pre-compresses every compressible file for both `br` and `gzip`,
 * keyed by `${absolutePath}:${encoding}`. Run at server startup so no request ever pays
 * brotli/gzip's synchronous CPU cost — see the header comment for why that cost is itself a
 * measurement distortion.
 */
function precompress(buildDir) {
	const cache = new Map();
	for (const filePath of listFiles(buildDir)) {
		if (!isCompressible(filePath)) continue;
		const raw = readFileSync(filePath);
		cache.set(`${filePath}:br`, compress(raw, 'br'));
		cache.set(`${filePath}:gzip`, compress(raw, 'gzip'));
	}
	return cache;
}

/** Hashed SvelteKit build output — safe to cache forever; a new build emits new filenames. */
function isImmutableAsset(pathname) {
	return pathname.startsWith('/_app/immutable/');
}

/** Resolves a request path against buildDir, refusing to escape it via `..` segments. */
function resolveStaticPath(buildDir, pathname) {
	const decoded = decodeURIComponent(pathname);
	const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
	return path.join(buildDir, normalized);
}

export function createServer(buildDir = BUILD_DIR) {
	const indexHtml = path.join(buildDir, 'index.html');
	const compressedCache = precompress(buildDir);

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
		} else if (isImmutableAsset(url.pathname) && filePath !== indexHtml) {
			headers['Cache-Control'] = 'public, max-age=31536000, immutable';
		}

		if (isCompressible(filePath)) {
			const encoding = pickEncoding(req.headers['accept-encoding']);
			headers.Vary = 'Accept-Encoding';
			if (encoding) {
				const body = compressedCache.get(`${filePath}:${encoding}`);
				if (body) {
					headers['Content-Encoding'] = encoding;
					res.writeHead(200, headers);
					res.end(body);
					return;
				}
			}
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
