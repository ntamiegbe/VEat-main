import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RestaurantCard } from '../restaurant/RestaurantCard';
import { useRestaurants } from '@/services/resturants';
import { Restaurant } from '@/types/restaurant';
import { RestaurantCardSkeleton } from '../restaurant/RestaurantCardSkeleton';

type RestaurantSectionProps = {
    title: string;
    maxItems?: number;
};


export const RestaurantSection: React.FC<RestaurantSectionProps> = ({
    title,
    maxItems
}) => {
    const { data: restaurants = [], isLoading, isError } = useRestaurants();

    // Show loading state
    if (isLoading) {
        return (
            <View className="mt-6 px-4">
                <Text className="text-xl font-semibold text-tc-primary mb-4">{title}</Text>
                {[1, 2, 3].map((_, index) => (
                    <RestaurantCardSkeleton key={index} />
                ))}
            </View>
        );
    }

    // Handle error state
    if (isError || !restaurants || restaurants.length === 0) {
        return (
            <View className="mt-6 px-4">
                <Text className="text-xl font-semibold text-tc-primary mb-4">{title}</Text>
                <View className="items-center justify-center py-8">
                    <MaterialIcons name="restaurant" size={48} color="#ccc" />
                    <Text className="text-gray-500 mt-4 text-center">
                        No restaurants available yet
                    </Text>
                </View>
            </View>
        );
    }

    // Limit the number of restaurants displayed if maxItems is specified
    const displayedRestaurants = maxItems ? restaurants.slice(0, maxItems) : restaurants;

    return (
        <View className="mt-6">
            <Text className="text-xl font-semibold text-tc-primary mb-4 px-4">{title}</Text>

            <FlatList
                data={displayedRestaurants as Restaurant[]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RestaurantCard restaurant={item} />}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
        </View>
    );
}; 