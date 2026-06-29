# App icons — PLACEHOLDERS

`icon.svg` (any) and `icon-maskable.svg` (maskable, content within the safe zone) are
flagged placeholders referenced by the generated web manifest (vite.config.ts, ADR-004).

TODO M-phase: replace with real artwork and add raster fallbacks for platforms that
ignore SVG manifest icons — typically `pwa-192x192.png`, `pwa-512x512.png`, and a
maskable `pwa-512x512-maskable.png` (e.g. via `@vite-pwa/assets-generator`), then add
them to the manifest `icons` array. Keep everything local — no remote icon CDNs (ADR-010).
