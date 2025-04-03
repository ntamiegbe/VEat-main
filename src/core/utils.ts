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

/**
 * Formats a number with commas as thousand separators
 * 
 * @param value - The value to format
 * @returns A string with formatted number (e.g., "1,000")
 */
export function numberWithCommas(value: string | number): string {
    if (!value && value !== 0) return '';

    if (typeof value === 'number') {
        value = value.toString();
    }

    // Handle decimal numbers
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
} 