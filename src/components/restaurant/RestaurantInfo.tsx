import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '../../../database.types';

interface RestaurantInfoProps {
    restaurant: Database['public']['Tables']['restaurants']['Row'];
}

/**
 * Component to display restaurant details like name, cuisine, ratings, etc.
 */
export const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => (
    <View className="pt-16 px-5">
        {/* Categories */}
        <Text className="text-gray-500 text-base">
            {restaurant.cuisine_types ?
                (Array.isArray(restaurant.cuisine_types)
                    ? restaurant.cuisine_types.join(', ')
                    : restaurant.cuisine_types)
                : 'Fast Food'}
        </Text>

        {/* Restaurant Name */}
        <Text className="text-3xl font-bold text-black mt-1">
            {restaurant.name}
        </Text>

        {/* Rating, Time, and Location */}
        <View className="flex-row items-center mt-3">
            {restaurant.average_rating && (
                <View className="flex-row items-center">
                    <Ionicons name="star" size={18} color="#000" />
                    <Text className="ml-1 font-medium text-base">
                        {restaurant.average_rating.toFixed(1)}
                    </Text>
                </View>
            )}

            <Text className="mx-2 text-gray-400">•</Text>

            <Text className="text-base text-gray-700">
                {restaurant.average_preparation_time ?
                    `${restaurant.average_preparation_time}-${Number(restaurant.average_preparation_time) + 10} min` :
                    '25-35 min'}
            </Text>

            <Text className="mx-2 text-gray-400">•</Text>

            <Text className="text-base text-gray-700 flex-1" numberOfLines={1}>
                {restaurant.address || 'Agidingbi 101233, Ikeja, Lagos, Nigeria'}
            </Text>
        </View>

        {/* Opening Hours */}
        <Text className="text-gray-700 mt-3">
            Opens today 9am
        </Text>
    </View>
); 