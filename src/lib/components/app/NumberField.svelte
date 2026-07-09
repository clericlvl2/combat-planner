<!--
  NumberField (Component Inventory §10) — labeled numeric input that clamps to its Rules §7 range
  on commit and surfaces the inline clamp hint (UX §8). Clamp uses the domain `clamp` (single source
  of truth — clamp.ts); the store re-clamps authoritatively on mutate, so this is forgiving UX only.
  Styled to the `.numfield` recipe (specs/design/prototype.html): bordered/rounded stepper shell
  around the value input, Decrease → value → Increase order. The stepper buttons carry no
  aria-label (no Decrease/Increase message keys exist yet — messages/*.json is out of scope for
  this phase); their accessible name comes from their own visible +/− glyph text instead, which
  also keeps `getByLabelText(fieldLabel)` queries resolving to the input alone, unchanged.
-->
<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { m } from '$lib/i18n';
	import { clamp } from '$lib/stores/domain/clamp';

	let {
		id,
		label,
		value = $bindable(),
		min,
		max,
		placeholder,
		required = false,
	}: {
		id: string;
		label: string;
		value: number | null;
		min: number;
		max: number;
		placeholder?: string;
		required?: boolean;
	} = $props();

	let clamped = $state(false);
	const digitCap = $derived(Math.max(String(Math.abs(min)).length, String(Math.abs(max)).length));

	// Prototype .field-label recipe (specs/design/prototype.html) — uppercase, muted, small caps.
	const fieldLabelClass = 'text-xs font-medium uppercase tracking-wide text-muted-foreground';
	const stepBtnClass =
		'flex min-h-11 w-11 shrink-0 items-center justify-center text-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50';

	function capDigits(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		const digits = el.value.replace('-', '');
		if (digits.length > digitCap) {
			const sign = el.value.startsWith('-') ? '-' : '';
			el.value = sign + digits.slice(0, digitCap);
		}
	}

	function commit(e: Event) {
		const raw = (e.currentTarget as HTMLInputElement).value.trim();
		if (raw === '') {
			value = null;
			clamped = false;
			return;
		}
		const n = Number(raw);
		const c = clamp(n, min, max);
		clamped = c !== n;
		value = c;
	}

	function step(delta: number) {
		const target = (value ?? 0) + delta;
		const c = clamp(target, min, max);
		clamped = c !== target;
		value = c;
	}
</script>

<div class="flex flex-col gap-1">
	<Label for={id} class={fieldLabelClass}>{label}</Label>
	<div
		class="focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 flex items-stretch overflow-hidden rounded-md border border-border bg-secondary"
	>
		<button type="button" class={[stepBtnClass, 'border-r border-border']} onclick={() => step(-1)}>
			−
		</button>
		<Input
			{id}
			type="number"
			inputmode="numeric"
			class="min-h-11 flex-1 rounded-none border-0 bg-transparent text-center tabular-nums shadow-none focus-visible:ring-0"
			value={value ?? ''}
			{min}
			{max}
			{placeholder}
			{required}
			aria-invalid={clamped}
			onchange={commit}
			onblur={commit}
			oninput={capDigits}
		/>
		<button type="button" class={[stepBtnClass, 'border-l border-border']} onclick={() => step(1)}>
			+
		</button>
	</div>
	<p class={['min-h-4 text-xs text-muted-foreground', !clamped && 'invisible']}>
		{m['errors.clamp']({ min, max })}
	</p>
</div>
