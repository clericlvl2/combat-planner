<!--
  NumberField (component-inventory.md) — labeled numeric input that clamps to its limits.md range
  on commit and surfaces the inline clamp hint. Clamp uses the domain `clamp` (single source
  of truth — clamp.ts); the store re-clamps authoritatively on mutate, so this is forgiving UX only.
  Styled as a bordered/rounded stepper shell
  around the value input, Decrease → value → Increase order. The value input is `type="text"`
  (not `type="number"`) so no native browser spinner arrows render, and typed entry is sanitized
  on `oninput` to digits + a single leading `-` — this keeps a lone `-`/`1e`/`1.` from blanking the
  field, and exposes a minus key on mobile (`inputmode="text"`) for negative-capable fields. The
  stepper buttons carry `aria-label`s from `a11y.numField.decrease`/`a11y.numField.increase`,
  which does not collide with `getByLabelText(fieldLabel)` resolving to the value input alone.
-->
<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { m } from '$lib/i18n';
	import { clamp } from '$lib/stores/domain/clamp';
	import { fieldLabelClass } from './Field.svelte';

	let {
		id,
		label,
		value = $bindable(),
		min,
		max,
		placeholder,
		required = false,
		inline = false,
	}: {
		id: string;
		label: string;
		value: number | null;
		min: number;
		max: number;
		placeholder?: string;
		required?: boolean;
		/** Opt-in label-left inline row; default false keeps the stacked label-above look
		    that the combat-header round/escalation popovers rely on. */
		inline?: boolean;
	} = $props();

	let clamped = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);
	const digitCap = $derived(Math.max(String(Math.abs(min)).length, String(Math.abs(max)).length));

	// Canonical write-back: the DOM is also written imperatively (onTypedInput/onPaste), so when
	// commit()/step() clamp back to the value already in state, Svelte's set_value short-circuits
	// on its cached attribute and the rejected text would otherwise stick in the DOM.
	function syncDom() {
		if (inputEl) inputEl.value = value === null ? '' : String(value);
	}

	// No touch-action override here (W-029/W-031): a plain button has no native caret/selection
	// gesture to fight, so vaul's shouldDrag already reads it like plain drawer content — dragging
	// the stepper scrolls the form, and closing from scrollTop 0 still works.
	const stepBtnClass =
		'flex min-h-11 w-11 shrink-0 items-center justify-center text-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:z-10 lg:focus-visible:ring-3 lg:focus-visible:ring-ring/50 active:bg-muted active:text-foreground transition-colors';
	// Stepper divider uses --border-strong, not the default --border token.
	const stepBorderClass = 'border-[var(--border-strong)]';

	// Allowed typed character set: digits + a single leading '-'. Keeps intermediate-invalid
	// states (a lone '-', trailing letters) from blanking the field mid-entry.
	function sanitize(raw: string): string {
		const sign = raw.startsWith('-') ? '-' : '';
		const digits = raw.replace(/-/g, '').replace(/[^0-9]/g, '');
		return sign + digits;
	}

	// Typed entry (oninput): sanitize to the allowed set, then cap to digitCap so a keyboard can't
	// type more digits than the range needs.
	function onTypedInput(e: Event) {
		clamped = false;
		const el = e.currentTarget as HTMLInputElement;
		const sanitized = sanitize(el.value);
		const digits = sanitized.replace('-', '');
		const sign = sanitized.startsWith('-') ? '-' : '';
		el.value = digits.length > digitCap ? sign + digits.slice(0, digitCap) : sanitized;
	}

	// Paste / programmatic-set path (B-013): sanitize but deliberately bypass digitCap so an
	// overflowing value survives to commit()/clamp() instead of being truncated pre-commit.
	function onPaste(e: ClipboardEvent) {
		e.preventDefault();
		const el = e.currentTarget as HTMLInputElement;
		const pasted = e.clipboardData?.getData('text') ?? '';
		el.value = sanitize(el.value.slice(0, el.selectionStart ?? 0) + pasted + el.value.slice(el.selectionEnd ?? el.value.length));
	}

	function commit(e: Event) {
		const raw = (e.currentTarget as HTMLInputElement).value.trim();
		if (raw === '' || raw === '-') {
			value = null;
			clamped = false;
			syncDom();
			return;
		}
		const n = Number(raw);
		const c = clamp(n, min, max);
		clamped = c !== n;
		value = c;
		syncDom();
	}

	function step(delta: number) {
		const target = (value ?? 0) + delta;
		const c = clamp(target, min, max);
		clamped = c !== target;
		value = c;
		syncDom();
	}

	// Spinbutton keyboard contract (role="spinbutton" requires it): Arrow ±1, PageUp/Down ±10,
	// Home/End jump to min/max.
	function onKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp':
				e.preventDefault();
				step(1);
				return;
			case 'ArrowDown':
				e.preventDefault();
				step(-1);
				return;
			case 'PageUp':
				e.preventDefault();
				step(10);
				return;
			case 'PageDown':
				e.preventDefault();
				step(-10);
				return;
			case 'Home':
				e.preventDefault();
				clamped = false;
				value = min;
				syncDom();
				return;
			case 'End':
				e.preventDefault();
				clamped = false;
				value = max;
				syncDom();
				return;
		}
	}
</script>

<div class={inline ? 'grid grid-cols-[6rem_1fr] items-center gap-x-3' : 'flex flex-col gap-1'}>
	<Label for={id} class={fieldLabelClass}>{label}</Label>
	<div
		class={[
			'lg:focus-within:border-ring lg:focus-within:ring-3 lg:focus-within:ring-ring/50 flex w-full items-stretch overflow-hidden rounded-sm border bg-secondary',
			stepBorderClass,
			clamped && 'border-destructive ring-3 ring-destructive/50',
		]}
	>
		<button
			type="button"
			class={[stepBtnClass, 'border-r', stepBorderClass]}
			aria-label={m['a11y.numField.decrease']()}
			onclick={() => step(-1)}
		>
			−
		</button>
		<Input
			bind:ref={inputEl}
			{id}
			type="text"
			inputmode="text"
			role="spinbutton"
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={value ?? undefined}
			aria-describedby={clamped ? `${id}-hint` : undefined}
			size="action"
			class="flex-1 rounded-none border-0 bg-transparent text-[13px] text-center tabular-nums shadow-none focus-visible:ring-0 dark:bg-transparent"
			value={value ?? ''}
			{placeholder}
			{required}
			aria-invalid={clamped}
			onchange={commit}
			oninput={onTypedInput}
			onpaste={onPaste}
			onkeydown={onKeydown}
		/>
		<button
			type="button"
			class={[stepBtnClass, 'border-l', stepBorderClass]}
			aria-label={m['a11y.numField.increase']()}
			onclick={() => step(1)}
		>
			+
		</button>
	</div>
	{#if clamped}
		<p id="{id}-hint" class="text-xs text-destructive">
			{m['forms.field.clampedTo']({ value: value ?? 0 })}
		</p>
	{/if}
</div>
