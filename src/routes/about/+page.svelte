<!--
  About — static page: app name + version, purpose, and the local-only privacy note.
-->
<script lang="ts">
	import { m } from '$lib/i18n';

	// No build-time version wiring exists yet (out of this phase's owned files) — mirrors
	// package.json's current version.
	const APP_VERSION = '0.0.1';

	// Credits — handles/URLs are proper nouns, kept in code; only the role labels are localized.
	const CREDITS = [
		{ label: m['about.credits.developer'], handle: 'clericlvl2', url: 'https://github.com/clericlvl2' },
		{ label: m['about.credits.design'], handle: 'xomnsn', url: 'https://github.com/xomnsn' },
	];
</script>

<h1 class="sr-only">{m['about.title']()}</h1>

<div class="mx-auto flex w-full max-w-[640px] flex-col gap-3 py-6">
	<h2 class="text-xl font-semibold">{m['about.appName']()}</h2>
	<span class="text-sm tabular-nums text-muted-foreground">
		{m['about.version']({ version: APP_VERSION })}
	</span>
	<p class="text-sm leading-relaxed text-muted-foreground">{m['about.description']()}</p>
	<div class="rounded-lg border border-border bg-card p-3 text-sm">
		{m['about.privacy']()}
	</div>

	<div class="flex flex-col gap-2">
		<h3 class="text-sm font-medium">{m['about.credits.title']()}</h3>
		<div class="flex flex-col gap-1 text-sm">
			{#each CREDITS as credit (credit.url)}
				<div class="flex items-baseline gap-2">
					<span class="text-muted-foreground">{credit.label()}</span>
					<a
						href={credit.url}
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium underline underline-offset-2 hover:text-primary"
					>
						{credit.handle}
					</a>
				</div>
			{/each}
		</div>
	</div>
</div>
