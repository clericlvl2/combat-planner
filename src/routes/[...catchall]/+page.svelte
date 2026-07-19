<!--
  Root catch-all — matches only paths with no other route match (e.g. `/combat`, `/foo`);
  SvelteKit route specificity means real routes (`/combats`, `/combats/<id>`, `/settings`,
  `/about`) and the combat screen's own bad-id not-found screen are never shadowed by this route. Handles
  no-route-match only — thrown errors still surface the `+error.svelte` boundary.
-->
<script lang="ts">
    import {goto} from '$app/navigation';
    import EmptyState from '$lib/components/app/EmptyState.svelte';
    import {Button} from '$lib/components/ui/button';
    import {m} from '$lib/i18n';
    import {chromeIcon} from '$lib/icons';

    const Search = chromeIcon.search;
</script>

<div class="flex min-h-dvh flex-col">
    <EmptyState icon={Search} title={m['route.notFound.title']()} description={m['route.notFound.description']()}>
        <Button size="action" aria-label={m['route.notFound.back']()} onclick={() => goto('/combats')}>
            {m['route.notFound.back']()}
        </Button>
    </EmptyState>
</div>
