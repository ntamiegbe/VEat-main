import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '@/components/ui/Text';
import { CartItem } from '@/components/orders/CartItem';
import { useCartStore } from '@/store/cartStore';
import ShopIcon from '@assets/icons/ShopIcon.svg';

export const OrderReview: React.FC = () => {
    const { items } = useCartStore();

    return (
        <View className="flex-1">
            <View className="p-4">
                <Text weight="medium" className="text-lg mb-4">
                    Review order
                </Text>
                {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                ))}
                <TouchableOpacity
                    className="flex-row items-center mt-4 bg-accent-overlay p-2 rounded-full self-start"
                    onPress={() => {/* Add item handler */ }}
                >
                    <Ionicons name="add" size={16} color="#34AA87" />
                    <Text className="text-primary-main font-medium ml-2">
                        Add another item
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="border-y border-secondary-divider">
                <TouchableOpacity
                    className="flex-row items-center p-4"
                    onPress={() => {/* Message handler */ }}
                >
                    <ShopIcon />
                    <Text className="text-tc-primary text-sm ml-3 flex-1">
                        Leave a message for the restaurant
                    </Text>
                    <Ionicons name="chevron-forward" size={24} color="#6B707A" />
                </TouchableOpacity>
            </View>
        </View>
    );
}; 