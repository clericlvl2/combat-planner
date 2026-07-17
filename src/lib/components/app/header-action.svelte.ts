/**
 * Singleton rune-backed slot for a page-specific header action (e.g. Combats home's desktop "+"
 * create button). AppHeader lives in AppShell, a sibling-ish ancestor of the route content
 * in the component tree — not a descendant of it — so Svelte context can't flow from a page down
 * to AppHeader. This module-level `$state` singleton is the seam instead: a route sets `current`
 * on mount and clears it on unmount; AppHeader just reads it.
 */
import type { Snippet } from 'svelte';

class HeaderAction {
	#current = $state<Snippet | null>(null);

	get current(): Snippet | null {
		return this.#current;
	}

	set(snippet: Snippet | null): void {
		this.#current = snippet;
	}
}

export const headerAction = new HeaderAction();
