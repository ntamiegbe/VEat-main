import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import GreenLocationIcon from '@assets/icons/GreenLocationIcon.svg';

interface LocationPickerProps {
    locationName: string | undefined;
    isLoading?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
    locationName = "Select location",
    isLoading = false
}) => {
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
                {isLoading ? "Loading..." : locationName}
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