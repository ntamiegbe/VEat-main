import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

type MenuItemProps = {
    item?: {
        id: string;
        name: string | null;
        description: string | null;
        price: number | null;
        image_url?: string | null;
        [key: string]: any; // Allow additional properties
    };
    fallback?: boolean;
    onAddToCart: () => void;
};

export const MenuItem: React.FC<MenuItemProps> = ({
    item,
    fallback = false,
    onAddToCart,
}) => {
    // Default fallback data
    const fallbackItem = {
        name: 'Pinkberry Buddies',
        description: 'A special yoghurt with mixed berries and granola',
        price: 8.99,
        image_url: 'https://via.placeholder.com/100',
    };

    // Use either the provided item or fallback data
    const displayItem = fallback ? fallbackItem : item;

    if (!displayItem) return null;

    return (
        <View className="flex-row justify-between items-center mb-6 bg-white rounded-xl p-3 shadow-sm">
            <View className="flex-1 pr-4">
                <Text className="text-lg font-bold mb-1">{displayItem.name || 'Unnamed Item'}</Text>
                <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
                    {displayItem.description || 'No description available'}
                </Text>
                <Text className="text-primary-600 font-bold">
                    ${(displayItem.price || 0).toFixed(2)}
                </Text>
            </View>

            <View className="flex-row items-center">
                {displayItem.image_url && (
                    <Image
                        source={{ uri: displayItem.image_url }}
                        className="w-20 h-20 rounded-lg mr-3"
                    />
                )}

                <TouchableOpacity
                    onPress={onAddToCart}
                    className="bg-primary-500 w-8 h-8 rounded-full items-center justify-center"
                >
                    <Feather name="plus" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}; 