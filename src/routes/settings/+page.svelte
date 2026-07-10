<!--
  Settings (Component Inventory §Hierarchy, specs/capabilities/settings.md SET-1..5) — three
  SettingsGroups (Language, Appearance, Data) + a headingless About link row, per the approved
  `specs/design/prototype.html` "SCREEN — Settings". Export/import rows are dropped from this
  screen (see component-inventory: "DataActions (Reset-all only)"). Reset-all is confirm-gated
  (SET-3) via the shared ConfirmDialog.
-->
<script lang="ts">
	import ConfirmDialog from '$lib/components/app/ConfirmDialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import type { Locale, Theme } from '$lib/db/types';
	import { getLocale, locales, m, setLocale } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { store } from '$lib/stores';

	const ChevronIcon = chromeIcon.advance;

	// Bracket-indexing `m` with a runtime key isn't type-safe (see labels.ts) — pin each locale to
	// its message fn once.
	const languageLabel: Record<Locale, () => string> = {
		en: m['settings.language.en'],
		de: m['settings.language.de'],
		es: m['settings.language.es'],
		fr: m['settings.language.fr'],
		ja: m['settings.language.ja'],
		ru: m['settings.language.ru'],
	};

	let selectedLocale = $state(getLocale() as Locale);

	function onLanguageChange(next: string) {
		if (!next) return;
		const locale = next as Locale;
		selectedLocale = locale;
		// SET-1: applies immediately (no reload), persists via both the Paraglide runtime and our
		// own Settings record (kept in sync — Settings.language also travels with export/import).
		setLocale(locale, { reload: false });
		store.updateSettings({ language: locale });
	}

	function onThemeChange(next: string) {
		if (!next) return;
		store.updateSettings({ theme: next as Theme });
	}

	let resetConfirmOpen = $state(false);
</script>

<h1 class="sr-only">{m['settings.title']()}</h1>

<div class="mx-auto flex w-full max-w-md flex-col gap-3 p-3">
	<section class="rounded-lg border border-border bg-card px-4 py-2">
		<h2 class="my-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			{m['settings.language']()}
		</h2>
		<Select type="single" value={selectedLocale} onValueChange={onLanguageChange}>
			<SelectTrigger class="h-11 w-full justify-between" aria-label={m['settings.language']()}>
				{languageLabel[selectedLocale]()}
			</SelectTrigger>
			<SelectContent>
				{#each locales as loc (loc)}
					<SelectItem value={loc} label={languageLabel[loc as Locale]()}>
						{languageLabel[loc as Locale]()}
					</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</section>

	<section class="rounded-lg border border-border bg-card px-4 py-2">
		<h2 class="my-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			{m['settings.group.appearance']()}
		</h2>
		<div class="flex items-center justify-between gap-3 py-2">
			<span class="shrink-0 text-sm">{m['settings.theme']()}</span>
			<ToggleGroup
				type="single"
				variant="outline"
				value={store.settings.theme}
				onValueChange={onThemeChange}
				class="flex-1"
				aria-label={m['settings.theme']()}
			>
				<ToggleGroupItem value="system" class="h-11 flex-1">
					{m['settings.theme.system']()}
				</ToggleGroupItem>
				<ToggleGroupItem value="dark" class="h-11 flex-1">
					{m['settings.theme.dark']()}
				</ToggleGroupItem>
				<ToggleGroupItem value="light" class="h-11 flex-1">
					{m['settings.theme.light']()}
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	</section>

	<section class="rounded-lg border border-border bg-card px-4 py-2">
		<h2 class="my-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			{m['settings.group.data']()}
		</h2>
		<div class="flex items-center justify-end py-2">
			<Button
				type="button"
				variant="destructive"
				size="lg"
				class="h-11 w-full"
				onclick={() => (resetConfirmOpen = true)}
			>
				{m['settings.data.resetAll']()}
			</Button>
		</div>
	</section>

	<a
		href="/about"
		class="focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none focus-visible:ring-3"
	>
		{m['settings.group.about']()}
		<ChevronIcon class="size-4 text-muted-foreground" aria-hidden="true" />
	</a>
</div>

<ConfirmDialog
	bind:open={resetConfirmOpen}
	title={m['dialogs.resetAll.title']()}
	body={m['dialogs.resetAll.body']()}
	confirmLabel={m['dialogs.resetAll.confirm']()}
	onConfirm={() => {
		void store.resetAll();
	}}
/>
