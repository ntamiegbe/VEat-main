import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MenuItem as MenuItemType } from '@/types/restaurant';
import Text from '@/components/ui/Text';

type MenuItemProps = {
    item?: MenuItemType;
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
        id: 'fallback',
        name: 'Pinkberry Buddies',
        description: 'Any midi to-go frozen yoghurt',
        price: 2070,
        image_url: 'https://via.placeholder.com/100',
        original_price: 2300,
        restaurant_id: 'fallback'
    };

    // Use either the provided item or fallback data
    const displayItem = fallback ? fallbackItem : item;

    if (!displayItem) return null;

    // Format price with Naira symbol
    const formatPrice = (price: number) => {
        return `N${price.toLocaleString()}`;
    };

    return (
        <View className="flex-row justify-between items-start py-4 border-b border-gray-100">
            <View className="flex-1 pr-4">
                <Text weight="regular" className="text-lg text-black mb-1">
                    {displayItem.name}
                </Text>
                <Text weight="regular" className="text-gray-500 text-sm mb-2" numberOfLines={2}>
                    {displayItem.description}
                </Text>
                <View className="flex-row items-center">
                    {displayItem.original_price && (
                        <Text weight="regular" className="text-gray-400 line-through mr-2">
                            {formatPrice(displayItem.original_price)}
                        </Text>
                    )}
                    <Text weight="medium" className="text-black">
                        {formatPrice(displayItem.price)}
                    </Text>
                </View>
            </View>

            <View className="relative">
                <Image
                    source={{ uri: displayItem.image_url || 'https://via.placeholder.com/100' }}
                    className="w-24 h-24 rounded-lg"
                    resizeMode="cover"
                />
                <TouchableOpacity
                    onPress={onAddToCart}
                    className="absolute -bottom-3 -right-3 bg-white w-8 h-8 rounded-full items-center justify-center shadow-lg"
                >
                    <Feather name="plus" size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
}; 