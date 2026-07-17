/**
 * Per-combat undo/redo history: a bounded (10-deep) two-way stack.
 *
 * Mechanism: a uniform deep **snapshot** of the combat's reversible state (everything except the
 * two stacks) taken before each reversible action ("a roster snapshot",
 * "a pre-Start snapshot", …); a single snapshot scheme reverses every action correctly — including
 * popping an hpLog entry on undo of an HP action, since the snapshot carries the log.
 */
import type { Combat, CombatSnapshot, UndoableAction, UndoEntry } from '../../db/types';

export const UNDO_LIMIT = 10;

function snapshot(c: Combat): CombatSnapshot {
	const { undoStack: _u, redoStack: _r, ...rest } = c;
	return structuredClone(rest);
}

/** Cap to the last UNDO_LIMIT entries (oldest dropped past the cap). */
function capped(stack: UndoEntry[]): UndoEntry[] {
	return stack.length > UNDO_LIMIT ? stack.slice(stack.length - UNDO_LIMIT) : stack;
}

/**
 * Push a pre-action snapshot and clear the redo branch (a new action invalidates redo).
 * Call BEFORE applying the mutation.
 */
export function pushUndo(c: Combat, action: UndoableAction): Combat {
	const entry: UndoEntry = { action, snapshot: snapshot(c) };
	return { ...c, undoStack: capped([...c.undoStack, entry]), redoStack: [] };
}

export const canUndo = (c: Combat): boolean => c.undoStack.length > 0;
export const canRedo = (c: Combat): boolean => c.redoStack.length > 0;

/** Reverse the last action; pushes the current state onto redo. No-op at the stack's end. */
export function undo(c: Combat): Combat {
	const last = c.undoStack.at(-1);
	if (!last) return c;
	const redoEntry: UndoEntry = { action: last.action, snapshot: snapshot(c) };
	return {
		...last.snapshot,
		undoStack: c.undoStack.slice(0, -1),
		redoStack: capped([...c.redoStack, redoEntry]),
	};
}

/** Re-apply the last undone action; pushes the current state back onto undo. No-op at the end. */
export function redo(c: Combat): Combat {
	const last = c.redoStack.at(-1);
	if (!last) return c;
	const undoEntry: UndoEntry = { action: last.action, snapshot: snapshot(c) };
	return {
		...last.snapshot,
		redoStack: c.redoStack.slice(0, -1),
		undoStack: capped([...c.undoStack, undoEntry]),
	};
}
