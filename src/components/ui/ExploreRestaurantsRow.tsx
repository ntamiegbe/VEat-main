import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { useRestaurants } from '@/services/resturants';
import { MaterialIcons } from '@expo/vector-icons';

// Generate random color based on restaurant name or ID
const getColorFromName = (name: string, id: string): string => {
    // Use either name or id to seed the color (ensures consistent color for the same restaurant)
    const seed = (name || id).toLowerCase();
    let hash = 0;

    // Simple hash function
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to RGB color
    const r = (hash & 0xFF) % 200 + 55; // Keep it bright (55-255)
    const g = ((hash >> 8) & 0xFF) % 200 + 55;
    const b = ((hash >> 16) & 0xFF) % 200 + 55;

    return `rgb(${r}, ${g}, ${b})`;
};

// Get initials from a restaurant name
const getInitials = (name: string): string => {
    if (!name) return '?';

    // Split by spaces and get first character of each word, max 2 characters
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

interface RestaurantItem {
    id: string;
    name: string;
    logo_url?: string | null;
    [key: string]: any; // For other properties from the database
}

interface ExploreRestaurantsRowProps {
    title?: string;
    maxItems?: number;
}

const RestaurantImagePlaceholder: React.FC<{ restaurant: RestaurantItem }> = ({ restaurant }) => {
    const backgroundColor = getColorFromName(restaurant.name, restaurant.id);
    const initials = getInitials(restaurant.name);

    return (
        <View
            className="w-full h-full items-center justify-center"
            style={{ backgroundColor }}
        >
            <Text className="text-white font-bold text-base">
                {initials}
            </Text>
        </View>
    );
};

const RestaurantItem: React.FC<{ restaurant: RestaurantItem; index: number }> = ({ restaurant, index }) => {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 50 + index * 50 }}
            className="items-center mx-2"
        >
            <TouchableOpacity
                className="items-center"
                onPress={() => router.push(`/(app)/restaurant/${restaurant.id}`)}
                activeOpacity={0.7}
            >
                <View className="w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                    {restaurant.logo_url ? (
                        <Image
                            source={{ uri: restaurant.logo_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                            onError={() => {
                                console.log(`Failed to load image for ${restaurant.name}`);
                            }}
                        />
                    ) : (
                        <RestaurantImagePlaceholder restaurant={restaurant} />
                    )}
                </View>
                <Text className="mt-2 text-xs text-tc-primary text-center font-medium" numberOfLines={1}>
                    {restaurant.name}
                </Text>
            </TouchableOpacity>
        </MotiView>
    );
};

const ExploreRestaurantsRow: React.FC<ExploreRestaurantsRowProps> = ({
    title = "Explore",
    maxItems = 10
}) => {
    const { data: restaurants = [], isLoading, isError } = useRestaurants();

    // Show loading state (placeholder shimmer effect)
    if (isLoading) {
        return (
            <View className="mt-6">
                <Text className="text-xl font-semibold text-tc-primary mb-4 px-4">
                    {title}
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <View key={index} className="items-center mx-2">
                            <View className="w-20 h-20 rounded-md bg-gray-200" />
                            <View className="mt-2 h-3 w-16 bg-gray-200 rounded-md" />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    // Handle error state
    if (isError || !restaurants || restaurants.length === 0) {
        return (
            <View className="mt-6">
                <Text className="text-xl font-semibold text-tc-primary mb-4 px-4">
                    {title}
                </Text>
                <View className="items-center justify-center py-8 px-4">
                    <MaterialIcons name="restaurant" size={48} color="#ccc" />
                    <Text className="text-tc-secondary mt-2 text-center">
                        No restaurants available yet
                    </Text>
                </View>
            </View>
        );
    }

    // Limit the number of restaurants displayed
    const displayedRestaurants = restaurants.slice(0, maxItems);

    return (
        <View className="mt-10">
            <Text className="text-xl font-semibold text-tc-primary mb-4 px-4">
                {title}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {displayedRestaurants.map((restaurant, index) => (
                    <RestaurantItem
                        key={restaurant.id}
                        restaurant={restaurant}
                        index={index}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default ExploreRestaurantsRow; 