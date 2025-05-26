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

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const restaurantId = id as string;
    const [activeCategory, setActiveCategory] = React.useState('');

    const {
        restaurant,
        menuCategories,
        isLoading,
        error
    } = useRestaurantData(restaurantId);

    // Determine categories - must be called in every render
    const categories = React.useMemo(() => {
        return Object.keys(menuCategories).length > 0
            ? Object.keys(menuCategories)
            : ['Deals', 'Combos', 'Yoghurt', 'Toppings', 'Drinks'];
    }, [menuCategories]);

    // Set initial active category if not set
    React.useEffect(() => {
        if (!activeCategory && categories.length > 0) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

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

                {/* Menu Categories Tabs */}
                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                {/* Menu Items Section */}
                <View className="px-4">
                    {/* Active Category Name */}
                    <Text weight="regular" className="text-2xl text-black mt-6 mb-4">
                        {activeCategory}
                    </Text>

                    {/* Menu Items */}
                    {activeCategory && menuCategories[activeCategory] ? (
                        menuCategories[activeCategory].map((item) => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                onAddToCart={() => console.log('Add to cart:', item.name)}
                            />
                        ))
                    ) : (
                        <MenuItem
                            fallback
                            onAddToCart={() => console.log('Add to cart: Pinkberry Buddies')}
                        />
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
        </View>
    );
} 