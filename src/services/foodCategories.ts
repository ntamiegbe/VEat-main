import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Define the food category type
export interface FoodCategory {
    id: string;
    name: string;
    image: string;
}

export const QUERY_KEYS = {
    FOOD_CATEGORIES: 'food-categories',
} as const;

// Function to fetch food categories from food_categories table
async function fetchFoodCategories(): Promise<FoodCategory[]> {
    try {
        const { data, error } = await supabase
            .from('food_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching food categories:', error);
            return [];
        }

        if (!data || data.length === 0) {
            console.log('No food categories found');
            return [];
        }


        // Map the data and ensure URLs are properly formatted
        const categories = data.map((category) => {
            let finalImage = category.image_url;

            // Make sure we have a valid image URL
            if (!finalImage) {
                finalImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random`;
            }
            else {
                // Handle storage paths that need to be converted to public URLs
                if (finalImage.startsWith('storage/')) {
                    // Extract the path after 'storage/'
                    const storagePath = finalImage.replace('storage/', '');

                    // First try with 'public' bucket
                    let publicUrl = supabase.storage
                        .from('public')
                        .getPublicUrl(storagePath)
                        .data.publicUrl;

                    finalImage = publicUrl;
                }

                // For relative paths within the bucket (without full URL)
                else if (!finalImage.startsWith('http') && !finalImage.startsWith('https')) {
                    // First try to see if the image is in the food-categories folder
                    let bucketPath = `menu-images/food-categories/${finalImage}`;

                    // Try with 'public' bucket first
                    let publicUrl = supabase.storage
                        .from('public')
                        .getPublicUrl(bucketPath)
                        .data.publicUrl;

                    finalImage = publicUrl;
                }

                // If it's already a full URL, ensure it uses HTTPS
                else if (finalImage.startsWith('http:')) {
                    finalImage = finalImage.replace('http:', 'https:');
                }

                // Special handling for SVGs if needed
                if (finalImage.toLowerCase().endsWith('.svg')) {
                }
            }

            return {
                id: category.id,
                name: category.name,
                image: finalImage
            };
        });

        return categories;
    } catch (error) {
        console.error('Error in fetchFoodCategories:', error);
        return [];
    }
}

// Hook to use food categories data
export function useFoodCategories() {
    return useQuery({
        queryKey: [QUERY_KEYS.FOOD_CATEGORIES],
        queryFn: fetchFoodCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
