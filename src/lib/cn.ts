import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class lists, deduplicating conflicting utilities.
 *
 *   cn("px-2 py-1", condition && "px-4")   // → "py-1 px-4"
 *
 * Pure function; no domain knowledge. Safe to use anywhere.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
