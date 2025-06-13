import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import GreenLocationIcon from '@assets/icons/GreenLocationIcon.svg';
import { MotiView } from 'moti';

interface LocationPickerProps {
    locationName: string | undefined;
    isLoading?: boolean;
}

const LocationPickerSkeleton = () => (
    <MotiView
        from={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
        }}
        className="flex-row items-center"
    >
        <View className="w-5 h-5 rounded-full bg-gray-100" />
        <View className="ml-2 h-4 w-32 bg-gray-100 rounded-md" />
        <View className="ml-1 w-5 h-5 rounded-full bg-gray-100" />
    </MotiView>
);

const LocationPicker: React.FC<LocationPickerProps> = ({
    locationName = "Select location",
    isLoading = false
}) => {
    if (isLoading) {
        return <LocationPickerSkeleton />;
    }

    return (
        <TouchableOpacity
            className="flex-row items-center"
            activeOpacity={0.7}
            onPress={() => router.push('/location')}
            accessibilityRole="button"
            accessibilityLabel="Change delivery location"
        >
            <GreenLocationIcon className='' />
            <Text className="ml-2 text-tc-primary text-sm font-medium">
                {locationName}
            </Text>
            <MaterialIcons
                name="keyboard-arrow-down"
                size={22}
                color="#444"
                style={{ marginLeft: 4 }}
            />
        </TouchableOpacity>
    );
};

export default LocationPicker; 