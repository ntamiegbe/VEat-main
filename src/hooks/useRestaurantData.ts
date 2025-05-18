import { useRestaurant, useMenuItems } from '@/services/resturants';

/**
 * Custom hook for fetching and organizing restaurant data
 * @param restaurantId - The ID of the restaurant to fetch data for
 * @returns Restaurant data, menu items, categorized menu items, loading state, and error state
 */
export const useRestaurantData = (restaurantId: string) => {
    // Fetch restaurant details
    const {
        data: restaurant,
        isLoading: isLoadingRestaurant,
        error: restaurantError
    } = useRestaurant(restaurantId);

    // Fetch menu items
    const {
        data: menuItems = [],
        isLoading: isLoadingMenu,
        error: menuError
    } = useMenuItems(restaurantId);

    // Group menu items by category
    const menuCategories = menuItems.reduce((acc, item) => {
        const category = item.category_id ? `Category ${item.category_id}` : 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, typeof menuItems>);

    return {
        restaurant,
        menuItems,
        menuCategories,
        isLoading: isLoadingRestaurant || isLoadingMenu,
        error: restaurantError || menuError
    };
}; 