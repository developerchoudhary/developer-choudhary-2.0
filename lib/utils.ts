import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join class names and resolve conflicts.
 *
 * @param {ClassValue[]} inputs - List of class names or conditional class objects.
 * @returns {string} - A merged string of class names with conflicts resolved.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
