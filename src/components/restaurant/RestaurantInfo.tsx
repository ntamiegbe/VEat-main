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
    <View className="pt-16 px-5">
        {/* Categories */}
        <Text weight="regular" className="text-gray-500 text-base">
            {restaurant.cuisine_types ?
                (Array.isArray(restaurant.cuisine_types)
                    ? restaurant.cuisine_types.join(', ')
                    : restaurant.cuisine_types)
                : 'Fast Food'}
        </Text>

        {/* Restaurant Name */}
        <Text weight="bold" className="text-3xl text-black mt-1">
            {restaurant.name}
        </Text>

        {/* Rating, Time, and Location */}
        <View className="flex-row items-center mt-3">
            {restaurant.average_rating && (
                <View className="flex-row items-center">
                    <Ionicons name="star" size={18} color="#000" />
                    <Text weight="medium" className="ml-1 text-base">
                        {restaurant.average_rating.toFixed(1)}
                    </Text>
                </View>
            )}

            <Text weight="regular" className="mx-2 text-gray-400">•</Text>

            <Text weight="regular" className="text-base text-gray-700">
                {restaurant.average_preparation_time ?
                    `${restaurant.average_preparation_time}-${Number(restaurant.average_preparation_time) + 10} min` :
                    '25-35 min'}
            </Text>

            <Text weight="regular" className="mx-2 text-gray-400">•</Text>

            <Text weight="regular" className="text-base text-gray-700 flex-1" numberOfLines={1}>
                {restaurant.address || 'Agidingbi 101233, Ikeja, Lagos, Nigeria'}
            </Text>
        </View>

        {/* Opening Hours */}
        <Text weight="regular" className="text-gray-700 mt-3">
            Opens today 9am
        </Text>
    </View>
); 