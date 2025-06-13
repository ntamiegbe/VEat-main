/**
 * Utility functions for display purposes
 */

/**
 * Generate a visually appealing pastel color based on a string input
 * @param text String to generate color from (name or ID)
 * @returns CSS rgb color string
 */
export const getPastelColor = (text: string): string => {
    if (!text) return 'rgb(180, 180, 180)';

    let hash = 0;
    // Simple hash function
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate pastel colors by keeping saturation and brightness high
    // Higher baseline (180) with smaller range (75) for lighter colors
    const r = (hash & 0xFF) % 75 + 180;
    const g = ((hash >> 8) & 0xFF) % 75 + 180;
    const b = ((hash >> 16) & 0xFF) % 75 + 180;

    return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Predefined brand colors for specific restaurant names
 */
export const BRAND_COLORS: Record<string, string> = {
    'burger king': 'rgb(239, 68, 68)',   // Red for Burger King
    'mcdonalds': 'rgb(253, 224, 71)',    // Yellow for McDonald's
    'starbucks': 'rgb(5, 150, 105)',     // Green for Starbucks
    'subway': 'rgb(16, 185, 129)',       // Green for Subway
    'kfc': 'rgb(239, 68, 68)',           // Red for KFC
    'pizza hut': 'rgb(239, 68, 68)',     // Red for Pizza Hut
    'dominos': 'rgb(59, 130, 246)',      // Blue for Dominos
};

/**
 * Get brand color or generate pastel color
 * @param name Restaurant name
 * @param id Fallback ID if name is not available
 * @returns CSS color string
 */
export const getBrandOrPastelColor = (name: string, id: string): string => {
    // Use brand color if available
    const lowerName = (name || '').toLowerCase();
    const brandColor = Object.keys(BRAND_COLORS).find(key => lowerName.includes(key));

    if (brandColor) {
        return BRAND_COLORS[brandColor];
    }

    // Otherwise generate pastel color
    return getPastelColor(name || id);
};

/**
 * Extract initials from a string (e.g., restaurant name)
 * @param name String to extract initials from
 * @returns Uppercase initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
    if (!name) return '?';

    // Split by spaces and get first character of each word, max 2 characters
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
}; 