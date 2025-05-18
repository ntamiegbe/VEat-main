import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface ErrorStateProps {
    error: any;
}

/**
 * Component to display error state when restaurant data fails to load
 */
export const ErrorState = ({ error }: ErrorStateProps) => (
    <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500">
            {error ? 'Failed to load restaurant details' : 'Restaurant not found'}
        </Text>
        <TouchableOpacity
            className="mt-4 py-2 px-4 bg-primary rounded-full"
            onPress={() => router.back()}
        >
            <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
    </View>
); 