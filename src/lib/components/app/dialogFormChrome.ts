/**
 * Shared Tailwind recipes for CombatFormDialog/CombatantForm's footer + action buttons. Kept as
 * plain strings rather than a `@utility` class: DialogFooter/Button apply their own default
 * recipe via `cn()` (tailwind-merge), which only cancels conflicting utilities it recognizes
 * token-by-token — a single custom class name wouldn't reliably override them.
 */
export const DIALOG_FOOTER_CLASS =
	'mx-0 mb-0 flex-row justify-center gap-2 border-t-0 bg-transparent p-0 pt-1';

export const DIALOG_ACTION_BUTTON_CLASS = 'min-w-0 flex-1 shrink basis-0';
