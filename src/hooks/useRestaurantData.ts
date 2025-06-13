import { useRestaurant, useMenuItems } from '@/services/resturants';
import { Restaurant, MenuItem, MenuCategories } from '@/types/restaurant';
import { useFoodCategories } from '@/services/foodCategories';
import { useLocation } from '@/services/location';

/**
 * Custom hook for fetching and organizing restaurant data
 * @param restaurantId - The ID of the restaurant to fetch data for
 * @returns Restaurant data, menu items, categorized menu items, loading state, and error state
 */
export const useRestaurantData = (restaurantId: string) => {
    // Fetch restaurant details
    const {
        data: restaurantData,
        isLoading: isLoadingRestaurant,
        error: restaurantError
    } = useRestaurant(restaurantId);

    // Fetch location data
    const locationId = restaurantData?.location_id ?? null;
    const {
        data: location,
        isLoading: isLoadingLocation,
        error: locationError
    } = useLocation(locationId);

    // Fetch menu items
    const {
        data: menuItems = [],
        isLoading: isLoadingMenu,
        error: menuError
    } = useMenuItems(restaurantId);

    // Fetch food categories
    const {
        data: foodCategories = [],
        isLoading: isLoadingCategories,
        error: categoriesError
    } = useFoodCategories();

    // Group menu items by food category
    const menuCategories = menuItems.reduce((acc, item) => {
        // Get the food category name from the food categories list
        const foodCategory = foodCategories.find(cat => cat.id === item.food_category_id);
        const categoryName = foodCategory ? foodCategory.name : 'Other';

        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    // Combine restaurant data with location
    const restaurant = restaurantData ? {
        ...restaurantData,
        location: location || undefined
    } : undefined;

    return {
        restaurant: restaurant as Restaurant | undefined,
        menuItems: menuItems as MenuItem[],
        menuCategories,
        foodCategories,
        isLoading: isLoadingRestaurant || isLoadingMenu || isLoadingCategories || isLoadingLocation,
        error: restaurantError || menuError || categoriesError || locationError
    };
}; 