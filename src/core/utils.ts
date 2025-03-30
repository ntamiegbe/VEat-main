import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines clsx and tailwind-merge to handle className merging.
 * This simplifies conditional class application while avoiding Tailwind conflicts.
 * 
 * @param inputs - Any number of class values that will be combined
 * @returns A string of merged Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
} 