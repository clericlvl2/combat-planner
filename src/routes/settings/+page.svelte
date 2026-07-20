<!--
  Settings — two
  SettingsGroups (Language, Appearance). Export/import rows are dropped from this screen. The
  About link row is intentionally not rendered here — About stays reachable via URL and app nav.
-->
<script lang="ts">
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import type { Locale, Theme } from '$lib/db/types';
	import { getLocale, locales, m, setLocale } from '$lib/i18n';
	import { store } from '$lib/stores';

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
		// Applies immediately (no reload), persists via both the Paraglide runtime and our
		// own Settings record (kept in sync — Settings.language also travels with export/import).
		setLocale(locale, { reload: false });
		store.updateSettings({ language: locale });
	}

	const themeLabel: Record<Theme, () => string> = {
		system: m['settings.theme.system'],
		dark: m['settings.theme.dark'],
		light: m['settings.theme.light'],
	};

	const themes: Theme[] = ['system', 'dark', 'light'];

	function onThemeChange(next: string) {
		if (!next) return;
		store.updateSettings({ theme: next as Theme });
	}
</script>

<h1 class="sr-only">{m['settings.title']()}</h1>

<div class="mx-auto flex w-full max-w-md flex-col gap-2 py-3">
	<section class="rounded-xl border border-border bg-card px-4 py-2">
		<h2 class="my-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
			{m['settings.language']()}
		</h2>
		<Select type="single" value={selectedLocale} onValueChange={onLanguageChange}>
			<SelectTrigger size="action" class="w-full justify-between" aria-label={m['settings.language']()}>
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

	<section class="rounded-xl border border-border bg-card px-4 py-2">
		<h2 class="my-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
			{m['settings.group.appearance']()}
		</h2>
		<Select type="single" value={store.settings.theme} onValueChange={onThemeChange}>
			<SelectTrigger size="action" class="w-full justify-between" aria-label={m['settings.theme']()}>
				{themeLabel[store.settings.theme]()}
			</SelectTrigger>
			<SelectContent>
				{#each themes as theme (theme)}
					<SelectItem value={theme} label={themeLabel[theme]()}>
						{themeLabel[theme]()}
					</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</section>
</div>
