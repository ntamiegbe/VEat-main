import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useRestaurantData } from '@/hooks/useRestaurantData';
import { LoadingState } from '@/components/restaurant/LoadingState';
import { ErrorState } from '@/components/restaurant/ErrorState';
import { RestaurantHeader } from '@/components/restaurant/RestaurantHeader';
import { RestaurantInfo } from '@/components/restaurant/RestaurantInfo';
import { CategoryTabs } from '@/components/restaurant/CategoryTabs';
import { MenuItem } from '@/components/restaurant/MenuItem';
import Text from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import { MenuItem as MenuItemType } from '@/types/restaurant';
import Toast from '@/components/ui/Toast';

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const restaurantId = id as string;
    const [activeCategory, setActiveCategory] = React.useState('');
    const [toastVisible, setToastVisible] = React.useState(false);
    const addItem = useCartStore(state => state.addItem);

    const {
        restaurant,
        menuCategories,
        foodCategories,
        isLoading,
        error
    } = useRestaurantData(restaurantId);

    // Always use food categories for the tabs
    const categories = React.useMemo(() => {
        return foodCategories?.map(cat => cat.name) || [];
    }, [foodCategories]);

    // Set initial active category if not set
    React.useEffect(() => {
        if (!activeCategory && categories.length > 0) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

    // Handle adding item to cart
    const handleAddToCart = (item: MenuItemType) => {
        if (!restaurant) return;

        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            restaurantLogo: restaurant.logo_url,
        });

        // Show toast
        setToastVisible(true);
    };

    // Render empty category state
    const renderEmptyCategory = () => (
        <View className="items-center justify-center py-8">
            <MaterialIcons name="restaurant" size={48} color="#ccc" />
            <Text className="text-gray-500 mt-4 text-center px-4">
                No items available in {activeCategory} category yet
            </Text>
        </View>
    );

    // Prepare the content based on loading/error state
    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }

        if (error || !restaurant) {
            return <ErrorState error={error} />;
        }

        return (
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <RestaurantHeader
                    bannerUrl={restaurant.banner_url}
                    logoUrl={restaurant.logo_url}
                    restaurantName={restaurant.name}
                    restaurantId={restaurant.id}
                />

                {/* Restaurant Info Section */}
                <RestaurantInfo restaurant={restaurant} />

                <View className="mx-4 mb-4 border-b border-secondary-divider" />

                {/* Menu Categories Tabs */}
                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                {/* Menu Items Section */}
                <View className="px-4">
                    {/* Menu Items */}
                    {activeCategory && menuCategories[activeCategory]?.length > 0 ? (
                        menuCategories[activeCategory].map((item) => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                onAddToCart={() => handleAddToCart(item)}
                            />
                        ))
                    ) : (
                        renderEmptyCategory()
                    )}
                </View>

                {/* Bottom padding */}
                <View className="h-20" />
            </ScrollView>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {renderContent()}
            <Toast
                message="Item added to cart"
                isVisible={toastVisible}
                onClose={() => setToastVisible(false)}
                type="success"
            />
        </View>
    );
} 