import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const QUERY_KEYS = {
    RESTAURANTS: 'restaurants',
    MENU_ITEMS: 'menu-items',
    ORDERS: 'orders',
    USER_PROFILE: 'user-profile',
} as const;

// Fetch restaurants
export function useRestaurants() {
    return useQuery({
        queryKey: [QUERY_KEYS.RESTAURANTS],
        queryFn: async () => {
            // First try to get all restaurants without the is_active filter for debugging
            const { data: allData, error: allError } = await supabase
                .from('restaurants')
                .select('*');

            console.log('All restaurants (unfiltered):', allData);

            // Now get only active restaurants as per original logic
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('is_active', true);

            console.log('Active restaurants only:', data);

            if (error) throw error;
            return data;
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
          menu_items (*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
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