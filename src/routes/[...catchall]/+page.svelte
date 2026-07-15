<!--
  Root catch-all (PLT-12) — matches only paths with no other route match (e.g. `/combat`, `/foo`);
  SvelteKit route specificity means real routes (`/combats`, `/combats/<id>`, `/settings`,
  `/about`) and CLS-5's own bad-id not-found screen are never shadowed by this route. Handles
  no-route-match only — thrown errors still surface the PLT-10 `+error.svelte` boundary.
-->
<script lang="ts">
    import {goto} from '$app/navigation';
    import {Button} from '$lib/components/ui/button';
    import {m} from '$lib/i18n';
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-3 p-4 text-center text-muted-foreground">
    <p class="text-lg font-semibold text-foreground">{m['route.notFound.title']()}</p>
    <Button aria-label={m['route.notFound.back']()} onclick={() => goto('/combats')}>
        {m['route.notFound.back']()}
    </Button>
</div>
