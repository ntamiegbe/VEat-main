import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from '@/components/ui/Text';
import { MenuItem, useCartStore } from '@/store/cartStore';
import { Ionicons } from '@expo/vector-icons';

interface CartItemProps {
    item: MenuItem;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeItem } = useCartStore();

    const handleIncrement = () => {
        updateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        } else {
            removeItem(item.id);
        }
    };

    return (
        <View className="flex-row items-center justify-between py-4">
            <View className="flex-1 pr-4">
                <Text weight="medium" className="text-tc-primary mb-1">
                    {item.name}
                </Text>
                <Text className="text-tc-primary">
                    ₦{item.price.toLocaleString()}
                </Text>
            </View>

            <View className="flex-row items-center border border-secondary-stroke rounded-full px-1">
                <TouchableOpacity
                    onPress={handleDecrement}
                    className="size-8 items-center justify-center"
                >
                    <Ionicons name="remove" size={20} color="#6B707A" />
                </TouchableOpacity>

                <Text weight="medium" className="text-tc-primary mx-4 min-w-[20px] text-center">
                    {item.quantity}
                </Text>

                <TouchableOpacity
                    onPress={handleIncrement}
                    className="size-8 items-center justify-center"
                >
                    <Ionicons name="add" size={20} color="#6B707A" />
                </TouchableOpacity>
            </View>
        </View>
    );
}; 