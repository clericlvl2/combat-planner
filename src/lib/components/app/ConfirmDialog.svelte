<!--
  ConfirmDialog (Component Inventory §3) — AlertDialog wrapper for the destructive confirms
  (clear / restart here; delete / reset-all are M3/M5). Open is controlled by the parent.
-->
<script lang="ts">
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
	} from '$lib/components/ui/alert-dialog';
	import { m } from '$lib/i18n';

	let {
		open = $bindable(false),
		title,
		body,
		confirmLabel,
		onConfirm,
	}: {
		open?: boolean;
		title: string;
		body: string;
		confirmLabel: string;
		onConfirm: () => void;
	} = $props();
</script>

<AlertDialog bind:open>
	<AlertDialogContent class="data-[size=default]:sm:max-w-lg">
		<AlertDialogHeader>
			<AlertDialogTitle>{title}</AlertDialogTitle>
			<AlertDialogDescription>{body}</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>{m['dialogs.cancel']()}</AlertDialogCancel>
			<AlertDialogAction variant="destructive" onclick={onConfirm}>{confirmLabel}</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
