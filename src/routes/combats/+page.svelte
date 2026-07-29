<!--
  `/combats` — body moved to CombatsHome.svelte (W-041, boot-flash fix) so `/` can render the
  same subtree in place instead of blocking on a `load` redirect. This route is now a bare
  render with no first-launch decision of its own; `/` owns that.
-->
<script lang="ts">
	import CombatsHome from '$lib/components/app/CombatsHome.svelte';
</script>

<CombatsHome />
