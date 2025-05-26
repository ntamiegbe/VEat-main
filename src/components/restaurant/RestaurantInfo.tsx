import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '@/types/restaurant';
import Text from '@/components/ui/Text';

interface RestaurantInfoProps {
    restaurant: Restaurant;
}

/**
 * Component to display restaurant details like name, cuisine, ratings, etc.
 */
export const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => (
    <View className="px-4 py-4">
        {/* Categories */}
        <Text weight="regular" className="text-gray-500 text-base">
            {restaurant.cuisine_types ?
                (Array.isArray(restaurant.cuisine_types)
                    ? restaurant.cuisine_types.join(', ')
                    : restaurant.cuisine_types)
                : 'Desserts, Fastfood'}
        </Text>

        {/* Restaurant Name with Arrow */}
        <View className="flex-row items-center justify-between mt-1">
            <Text weight="bold" className="text-2xl text-black">
                {restaurant.name}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#000" />
        </View>

        {/* Rating and Time */}
        <View className="flex-row items-center mt-2">
            <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#000" />
                <Text weight="regular" className="ml-1">
                    {restaurant.average_rating?.toFixed(1) || '4.7'}
                </Text>
            </View>

            <Text weight="regular" className="mx-2 text-gray-400">•</Text>

            <Text weight="regular" className="text-gray-700">
                {restaurant.average_preparation_time ?
                    `${restaurant.average_preparation_time}-${Number(restaurant.average_preparation_time) + 10} min` :
                    '25-35 min'}
            </Text>

            <Text weight="regular" className="mx-2 text-gray-400">•</Text>

            <Text weight="regular" className="text-gray-700" numberOfLines={1}>
                {restaurant.address || 'Agidingbi 101233, Ikeja, Lagos, Nigeria'}
            </Text>
        </View>

        {/* Opening Hours */}
        <Text weight="regular" className="text-gray-700 mt-2">
            Opens today 9am
        </Text>
    </View>
); 