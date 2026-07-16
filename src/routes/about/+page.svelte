<!--
  About (specs/reference/component-inventory.md Hierarchy AboutPage, specs/capabilities/settings.md SET-5) — static
  page: app name + version, purpose, and the local-only privacy note, per the approved
  `specs/design/prototype.html` "SCREEN — About" `.about` block.
-->
<script lang="ts">
	import { m } from '$lib/i18n';

	// No build-time version wiring exists yet (out of this phase's owned files) — mirrors
	// package.json's current version.
	const APP_VERSION = '0.0.1';
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
</div>
