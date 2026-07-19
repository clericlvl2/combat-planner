<!--
  ConfirmDialog (component-inventory.md) — AlertDialog wrapper for the destructive confirms
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
			<AlertDialogTitle class="text-lg font-semibold">{title}</AlertDialogTitle>
			<AlertDialogDescription>{body}</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter class="mx-0 mb-0 flex-row gap-2 rounded-b-none border-t-0 bg-transparent p-0">
			<AlertDialogCancel size="action" class="flex-1">{m['dialogs.cancel']()}</AlertDialogCancel>
			<AlertDialogAction
				variant="destructive"
				size="action"
				class="flex-1 bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90"
				onclick={onConfirm}
			>
				{confirmLabel}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
