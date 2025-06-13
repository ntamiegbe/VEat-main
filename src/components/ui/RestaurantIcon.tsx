import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import { getInitials, getBrandOrPastelColor } from '@/utils/displayHelpers';

interface RestaurantIconProps {
    name: string;
    id?: string;
    size?: number;
}

export const RestaurantIcon: React.FC<RestaurantIconProps> = ({
    name,
    id = '',
    size = 40
}) => {
    const initials = getInitials(name);
    const backgroundColor = getBrandOrPastelColor(name, id);

    return (
        <View
            style={{
                width: size,
                height: size,
                backgroundColor,
                borderRadius: size / 2,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text
                style={{
                    color: '#FFFFFF',
                    fontSize: size * 0.4,
                    fontWeight: '600',
                }}
            >
                {initials}
            </Text>
        </View>
    );
}; 