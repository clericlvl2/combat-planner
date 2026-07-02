<!--
  NumberField (Component Inventory §10) — labeled numeric input that clamps to its Rules §7 range
  on commit and surfaces the inline clamp hint (UX §8). Clamp uses the domain `clamp` (single source
  of truth — clamp.ts); the store re-clamps authoritatively on mutate, so this is forgiving UX only.
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
</script>

<div class="flex flex-col gap-1">
	<Label for={id}>{label}</Label>
	<Input
		{id}
		type="number"
		inputmode="numeric"
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
	<p class={['min-h-4 text-xs text-muted-foreground', !clamped && 'invisible']}>
		{m['errors.clamp']({ min, max })}
	</p>
</div>
