// Thin indirection around the Drawer chunk's dynamic `import()`, split out of NavSidebar.svelte
// (W-049) purely so its failure path is testable: `vi.mock`'s factory-based module mocking in
// vitest-browser's Playwright provider crashes its own mock-resolution RPC when the factory
// itself rejects or throws (a real limitation of the installed toolchain version, not of this
// code) — but mocking this file with a factory that synchronously returns a function reference
// is unaffected, since nothing rejects until that function is actually called at runtime.
export function loadDrawerChunk() {
	return import('$lib/components/ui/drawer');
}
