import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant, OpeningHours } from '@/types/restaurant';
import Text from '@/components/ui/Text';

interface RestaurantInfoProps {
    restaurant: Restaurant;
}

type DayOfWeek = keyof OpeningHours;

/**
 * Check if the restaurant is currently open based on opening hours
 */
const isRestaurantOpen = (restaurant: Restaurant): boolean => {
    const now = new Date();
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes; // Convert to minutes

    const todayHours = restaurant.opening_hours?.[today];
    if (!todayHours) return false;

    const { open, close } = todayHours;
    if (!open || !close) return false;

    // Convert opening hours to minutes
    const [openHour, openMinute] = open.split(':').map(Number);
    const [closeHour, closeMinute] = close.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    return currentTime >= openTime && currentTime <= closeTime;
};

/**
 * Format opening hours for display
 */
const formatOpeningHours = (restaurant: Restaurant): string => {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const today = days[now.getDay()];
    const todayHours = restaurant.opening_hours?.[today];

    // If closed today
    if (!todayHours?.open || !todayHours?.close) {
        // Find next opening day
        let nextDay = now.getDay();
        let nextDayHours = null;
        for (let i = 1; i <= 7; i++) {
            nextDay = (now.getDay() + i) % 7;
            nextDayHours = restaurant.opening_hours?.[days[nextDay]];
            if (nextDayHours?.open) break;
        }
        if (nextDayHours?.open) {
            return `Opens ${nextDay === now.getDay() + 1 ? 'tomorrow' : days[nextDay]} at ${nextDayHours.open}`;
        }
        return 'Temporarily closed';
    }

    const { open, close } = todayHours;
    const [openHour, openMinute] = open.split(':').map(Number);
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes;
    const openTime = openHour * 60 + openMinute;

    // If not yet opened today
    if (currentTime < openTime) {
        return `Opens today at ${open}`;
    }

    return `Open until ${close}`;
};

/**
 * Component to display restaurant details like name, cuisine, ratings, etc.
 */
export const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => {
    const isOpen = isRestaurantOpen(restaurant);

    return (
        <View className="px-4 py-4 mt-4">
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
                    {restaurant.location?.name}
                </Text>
            </View>

            {/* Opening Hours */}
            <View className="flex-row items-center mt-2">
                <Text weight="regular" className={`${isOpen ? 'text-green-700' : 'text-red-700'}`}>
                    {formatOpeningHours(restaurant)}
                </Text>
            </View>
        </View>
    );
}; 