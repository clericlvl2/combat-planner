<script lang="ts">
	import './layout.css';

	// TODO M-phase: this becomes AppShell — mounts NavSidebar/AppHeader, Toaster, InstallBanner,
	// ConfirmDialog singletons + the route outlet (Component Inventory §2/§3).
	let { children } = $props();
</script>

{@render children()}
