import React from 'react';
import { View } from 'react-native';
import Text from '@/components/ui/Text';
import { AuthLayout } from '@/components/layouts/auth-layout';

export default function LocationsScreen() {
    return (
        <AuthLayout>
            <View className="flex-1 justify-center items-center">
                <Text className="text-tc-primary text-[22px] font-medium">
                    Select Your Location
                </Text>
            </View>
        </AuthLayout>
    );
} 