import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn-svelte class merge helper. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Prop-type helpers used by the vendored shadcn-svelte primitives (ui/). Standard shadcn-svelte
// boilerplate — the CLI expects these in utils; added here since utils.ts predated the vendoring.
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
