// ADR-007: client-only SPA — no SSR, no server data loading. Everything runs in the browser
// against IndexedDB (ADR-003). adapter-static emits a prerendered shell (fallback: index.html).
export const ssr = false;
export const prerender = false;
