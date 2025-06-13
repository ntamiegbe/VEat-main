import React from 'react';
import { View } from 'react-native';
import Text from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import CartIcon from '@assets/icons/EmptyCartIcon.svg';
import InProgressIcon from '@assets/icons/EmptyInProgressIcon.svg';
import CompletedIcon from '@assets/icons/EmptyCompletedIcon.svg';

type EmptyStateType = 'cart' | 'in-progress' | 'completed';

interface EmptyStateProps {
    type: EmptyStateType;
}

const getEmptyStateContent = (type: EmptyStateType) => {
    switch (type) {
        case 'cart':
            return {
                icon: CartIcon,
                title: 'Your cart is empty',
                subtitle: 'Add items to get started'
            };
        case 'in-progress':
            return {
                icon: InProgressIcon,
                title: 'No order in progress',
                subtitle: 'Place your first order'
            };
        case 'completed':
            return {
                icon: CompletedIcon,
                title: 'No completed orders',
                subtitle: 'Place your first order'
            };
    }
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
    const content = getEmptyStateContent(type);

    return (
        <View className="flex-1 items-center justify-center p-4">
            <View className="p-6">
                <content.icon />
            </View>
            <Text className="text-base text-tc-primary font-medium mb-2">
                {content.title}
            </Text>
            <Text className="text-secondary-icons text-[13px] font-normal">
                {content.subtitle}
            </Text>
        </View>
    );
}; 