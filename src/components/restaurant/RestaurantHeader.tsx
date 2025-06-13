import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getBrandOrPastelColor, getInitials } from '@/utils/displayHelpers';
import Text from '@/components/ui/Text';

interface RestaurantHeaderProps {
    bannerUrl?: string | null;
    logoUrl?: string | null;
    restaurantName: string;
    restaurantId: string;
}

/**
 * Restaurant header component with banner image, logo, and navigation buttons
 */
export const RestaurantHeader = ({
    bannerUrl,
    logoUrl,
    restaurantName,
    restaurantId
}: RestaurantHeaderProps) => {
    const [bannerError, setBannerError] = useState(false);
    const [logoError, setLogoError] = useState(false);

    // Get background color for fallbacks
    const backgroundColor = getBrandOrPastelColor(restaurantName, restaurantId);
    const initials = getInitials(restaurantName);

    return (
        <View className="w-full h-80 relative">
            {!bannerError && bannerUrl ? (
                <Image
                    source={{ uri: bannerUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={(error) => {
                        setBannerError(true);
                    }}
                />
            ) : (
                <View
                    className="w-full h-full items-center justify-center"
                    style={{ backgroundColor }}
                >
                    <Text className="text-white text-4xl font-bold">
                        {restaurantName}
                    </Text>
                </View>
            )}

            {/* Back Button */}
            <TouchableOpacity
                className="absolute top-12 left-5 bg-white rounded-full w-12 h-12 items-center justify-center"
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity
                className="absolute top-12 right-5 bg-white rounded-full w-12 h-12 items-center justify-center"
                onPress={() => router.push('/search')}
            >
                <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>

            {/* Restaurant Logo */}
            <View className="absolute bottom-0 left-8 size-20 bg-white rounded-full p-2 items-center justify-center translate-y-10">
                {!logoError && logoUrl ? (
                    <Image
                        source={{ uri: logoUrl }}
                        className="size-12"
                        resizeMode="contain"
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <View
                        className="size-12 rounded-md items-center justify-center"
                        style={{ backgroundColor }}
                    >
                        <Text className="text-white text-xl font-bold">
                            {initials}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}; 