/**
 * i18n seam (ADR-005). Single import point for messages + locale runtime so the
 * rest of the app never reaches into `$lib/paraglide` directly.
 *
 * Dot-namespaced keys (i18n Message Catalog) are accessed via bracket notation:
 *   import { m } from '$lib/i18n';
 *   m['combats.title']();
 *   m['combat.round']({ n: 3 });
 */
export { m } from '$lib/paraglide/messages.js';
export * from '$lib/paraglide/runtime.js';
