import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface RestaurantHeaderProps {
    bannerUrl?: string | null;
    logoUrl?: string | null;
}

/**
 * Restaurant header component with banner image, logo, and navigation buttons
 */
export const RestaurantHeader = ({ bannerUrl, logoUrl }: RestaurantHeaderProps) => (
    <View className="w-full h-80 relative">
        <Image
            source={{ uri: bannerUrl || 'https://images.unsplash.com/photo-1576506295286-5cda18df9ef5' }}
            className="w-full h-full"
            resizeMode="cover"
        />

        {/* Back Button */}
        <TouchableOpacity
            className="absolute top-12 left-5 bg-white rounded-full w-12 h-12 items-center justify-center shadow-md"
            onPress={() => router.back()}
        >
            <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
            className="absolute top-12 right-5 bg-white rounded-full w-12 h-12 items-center justify-center shadow-md"
            onPress={() => router.push('/search')}
        >
            <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>

        {/* Restaurant Logo */}
        <View className="absolute bottom-0 left-8 w-20 h-20 bg-white rounded-md shadow-md items-center justify-center translate-y-10">
            <Image
                source={{ uri: logoUrl || 'https://via.placeholder.com/80' }}
                className="w-16 h-16"
                resizeMode="contain"
            />
        </View>
    </View>
); 