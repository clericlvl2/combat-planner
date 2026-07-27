/**
 * Shared primary-nav link list + "is this the current route" check, consumed by both AppHeader
 * (title fallback + mobile burger) and DesktopNav (desktop icon row) so the four entries — and
 * `/library` in particular — exist in exactly one place. A byte-duplicated copy previously
 * omitted `/library` in one of the two, leaving the Library page's header titled "Combats".
 */
import { m } from '$lib/i18n';
import { chromeIcon, type IconComponent } from '$lib/icons';

export interface NavLink {
	href: string;
	label: string;
	icon: IconComponent;
}

/** Called at read time (inside a `$derived`) so labels track the active locale. */
export function navLinks(): NavLink[] {
	return [
		{ href: '/combats', label: m['nav.combats'](), icon: chromeIcon.navCombats },
		{ href: '/library', label: m['nav.library'](), icon: chromeIcon.navLibrary },
		{ href: '/settings', label: m['nav.settings'](), icon: chromeIcon.navSettings },
		{ href: '/about', label: m['nav.about'](), icon: chromeIcon.navAbout },
	];
}

export function isCurrentNavLink(pathname: string, href: string): boolean {
	if (href === '/combats') return pathname === '/' || pathname.startsWith('/combats');
	return pathname.startsWith(href);
}
