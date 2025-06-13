import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { InitialsPlaceholder } from '@/components/global/InitialsPlaceholder';
import { getBrandOrPastelColor } from '@/utils/displayHelpers';
import { Restaurant } from '@/types/restaurant';

type RestaurantCardProps = {
    restaurant: Restaurant;
};

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    const router = useRouter();
    const [logoError, setLogoError] = useState(false);
    const [bannerError, setBannerError] = useState(false);

    const navigateToRestaurant = () => {
        router.push(`/restaurant/${restaurant.id}`);
    };

    // Background color for banner placeholder
    const bannerColor = getBrandOrPastelColor(restaurant.name, restaurant.id);

    // Determine if restaurant is open (using is_active as fallback)
    const isOpen = restaurant.is_active ?? true; // Default to true if not specified

    // Calculate delivery time range based on preparation time
    const prepTime = restaurant.average_preparation_time || 15; // Default to 15 min
    const deliveryTimeMin = Math.max(10, prepTime - 5);
    const deliveryTimeMax = prepTime + 10;

    // Get rating with fallback
    const rating = restaurant.average_rating || 4.0;

    return (
        <TouchableOpacity
            onPress={navigateToRestaurant}
            className="bg-white rounded-2xl overflow-hidden mb-4 border border-secondary-stroke"
            style={styles.cardShadow}
        >
            {/* Banner Image or Placeholder */}
            {!bannerError && restaurant.banner_url ? (
                <Image
                    source={{ uri: restaurant.banner_url }}
                    className="w-full h-36"
                    resizeMode="cover"
                    onError={(error) => {
                        setBannerError(true);
                    }}
                />
            ) : (
                <View
                    style={{
                        height: 144, // 36rem = 144px
                        backgroundColor: bannerColor,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text className="text-white text-xl font-bold">
                        {restaurant.name}
                    </Text>
                </View>
            )}

            {/* Logo or Initials Placeholder */}
            <View className="absolute top-24 left-5">
                <View className="bg-white rounded-full p-2">
                    {!logoError && restaurant.logo_url ? (
                        <Image
                            source={{ uri: restaurant.logo_url }}
                            className="w-16 h-16 rounded-full object-contain"
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <InitialsPlaceholder
                            name={restaurant.name}
                            id={restaurant.id}
                            size={64} // 16rem = 64px
                        />
                    )}
                </View>
            </View>

            {/* Content */}
            <View className="px-4 pt-8 pb-2">
                {/* Restaurant Name */}
                <Text className="text-base font-medium">{restaurant.name}</Text>

                {/* Status, Delivery Time and Rating */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                        <Text className={`font-medium text-xs ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            {isOpen ? 'Open now' : 'Closed'}
                        </Text>
                        <Text className="text-tc-primary">•</Text>
                        <Text className="text-tc-primary text-xs font-light">
                            {deliveryTimeMin}-{deliveryTimeMax} mins
                        </Text>
                    </View>

                    <View className="bg-gray-100 px-3 py-1 rounded-full flex-row items-center">
                        <Feather name="star" size={16} color="black" />
                        <Text className="ml-1 font-medium">{rating.toFixed(1)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
}); 