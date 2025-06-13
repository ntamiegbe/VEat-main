import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

/**
 * Component to display a loading indicator for restaurant data
 */
export const LoadingState = () => (
    <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#008751" />
        <Text className="mt-4 text-gray-600">Loading restaurant details...</Text>
    </View>
); 