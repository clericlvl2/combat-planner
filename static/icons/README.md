# App icons — PLACEHOLDER ARTWORK

`icon.svg` (any) and `icon-maskable.svg` (maskable, content within the safe zone) are the
source placeholders. `pwa-192x192.png`, `pwa-512x512.png`, and `pwa-512x512-maskable.png` are
rasterized from those same sources via `@vite-pwa/assets-generator` and are wired into the
manifest `icons` array (vite.config.ts, ADR-004) alongside the SVG entries.

TODO M-phase: the raster set is generated, but it is still the placeholder artwork — replace
`icon.svg` / `icon-maskable.svg` with real artwork and regenerate the PNGs from the new sources.
Keep everything local — no remote icon CDNs (ADR-010).
