import React from 'react';
import { View, Image } from 'react-native';
import Text from '@/components/ui/Text';
import { MenuItem } from '@/store/cartStore';
import { useUserLocation } from '@/services/location';
import { getInitials } from '@/utils/displayHelpers';
import BikeIcon from '@assets/icons/BikeIcon.svg';

interface RestaurantCartGroupProps {
    restaurantName: string;
    restaurantId: string;
    items: MenuItem[];
    restaurantLogo?: string | null;
    showLocation?: boolean;
    showPrice?: boolean;
}

export const RestaurantCartGroup: React.FC<RestaurantCartGroupProps> = ({
    restaurantName,
    restaurantId,
    items,
    restaurantLogo,
    showLocation = true,
    showPrice = true,
}) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const { data: userLocation } = useUserLocation();

    return (
        <View className="flex-row items-center px-4 py-3">
            {/* Restaurant Icon */}
            <View className="border border-secondary-divider rounded-full p-1 size-12">
                <View className="w-full h-full rounded-full items-center justify-center overflow-hidden">
                    {restaurantLogo ? (
                        <Image
                            source={{ uri: restaurantLogo }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Text className="text-white text-lg font-medium">
                            {getInitials(restaurantName)}
                        </Text>
                    )}
                </View>
            </View>

            {/* Restaurant Info */}
            <View className="ml-3 flex-1">
                <Text className="text-tc-primary text-base font-medium">
                    {restaurantName}
                </Text>
                {showPrice && (
                    <Text className="text-secondary-icons text-sm mt-1">
                        {totalItems} items • ₦{items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                    </Text>
                )}
                {!showPrice && totalItems > 0 && (
                    <Text className="text-secondary-icons text-sm mt-1">
                        {totalItems} items
                    </Text>
                )}
                {showLocation && (
                    <View className="flex-row items-center mt-1">
                        <BikeIcon />
                        <Text className="text-tc-primary text-sm font-light ml-1">
                            {userLocation?.name || 'Loading location...'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}; 