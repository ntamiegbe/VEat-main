import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const QUERY_KEYS = {
    RESTAURANTS: 'restaurants',
    MENU_ITEMS: 'menu-items',
    ORDERS: 'orders',
    USER_PROFILE: 'user-profile',
} as const;

// Process image URLs from storage
const processImageUrl = (imageUrl: string | null, type: 'banner' | 'logo'): string | null => {

    if (!imageUrl) {
        return null;
    }

    // If it's already a full Supabase storage URL, return it as is
    if (imageUrl.includes('supabase.co/storage/v1/object/public')) {
        return imageUrl;
    }

    // If it's already a full URL but not HTTPS, convert to HTTPS
    if (imageUrl.startsWith('http:')) {
        return imageUrl.replace('http:', 'https:');
    }

    // Handle storage paths
    if (imageUrl.startsWith('storage/')) {
        const storagePath = imageUrl.replace('storage/', '');
        const url = supabase.storage
            .from('restaurant-images')
            .getPublicUrl(storagePath)
            .data.publicUrl;
        return url;
    }

    // For relative paths within the bucket
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
        const restaurantId = imageUrl.split('-')[0];
        const bucketPath = `restaurants/${restaurantId}/${imageUrl}`;
        const url = supabase.storage
            .from('restaurant-images')
            .getPublicUrl(bucketPath)
            .data.publicUrl;
        return url;
    }

    return imageUrl;
};

// Fetch restaurants
export function useRestaurants() {
    return useQuery({
        queryKey: [QUERY_KEYS.RESTAURANTS],
        queryFn: async () => {
            // First try to get all restaurants without the is_active filter for debugging
            const { data: allData, error: allError } = await supabase
                .from('restaurants')
                .select('*');

            // Now get only active restaurants as per original logic
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;

            // Process image URLs for each restaurant
            const processedData = data.map(restaurant => ({
                ...restaurant,
                banner_url: processImageUrl(restaurant.banner_url, 'banner'),
                logo_url: processImageUrl(restaurant.logo_url, 'logo')
            }));

            return processedData;
        },
    });
}

// Fetch single restaurant with menu items
export function useRestaurant(id: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.RESTAURANTS, id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('restaurants')
                .select(`
                    *,
                    menu_items (*),
                    location:locations (
                        id,
                        name,
                        address,
                        description,
                        is_active,
                        is_campus
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            // Process image URLs
            return {
                ...data,
                banner_url: processImageUrl(data.banner_url, 'banner'),
                logo_url: processImageUrl(data.logo_url, 'logo')
            };
        },
    });
}

// Fetch menu items for a restaurant
export function useMenuItems(restaurantId: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.MENU_ITEMS, restaurantId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('is_available', true);

            if (error) throw error;
            return data;
        },
    });
}

// mutation for adding a favorite
export function useFavoriteMenuItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ menuItemId, userId }: { menuItemId: string; userId: string }) => {
            const { data, error } = await supabase
                .from('user_favorites')
                .insert([{ menu_item_id: menuItemId, user_id: userId }]);

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MENU_ITEMS] });
        },
    });
}

export function useOrders(userId: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.ORDERS, userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          restaurant:restaurants (
            name,
            logo_url
          ),
          order_items (
            *,
            menu_item:menu_items (
              name,
              price
            )
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });
}