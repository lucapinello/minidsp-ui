/**
 * Tailwind CSS utility functions.
 * 
 * Provides utilities for working with Tailwind CSS classes:
 * - Merging class names
 * - Handling conditional classes
 * - Resolving class conflicts
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Merges Tailwind CSS classes intelligently.
 * 
 * Combines clsx and tailwind-merge to:
 * 1. Handle conditional class application
 * 2. Properly merge Tailwind utility classes
 * 3. Remove conflicting classes automatically
 * 
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'bg-red-500')
 * // With condition=true: 'px-2 py-1 bg-blue-500'
 * // With condition=false: 'px-2 py-1 bg-red-500'
 * 
 * @param {...(string|Object)} inputs - Class names or conditional class objects
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
