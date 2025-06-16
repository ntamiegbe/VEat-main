import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '@/components/ui/Text';

export default function PaymentCallbackScreen() {
    const { reference, status } = useLocalSearchParams<{ reference: string; status: string }>();

    useEffect(() => {
        if (status === 'success') {
            // Payment successful, redirect to in-progress orders
            router.replace({
                pathname: '/(app)/orders'
            });
        } else {
            // Payment failed, go back to checkout
            router.replace({
                pathname: '/(app)/checkout'
            });
        }
    }, [status]);

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#34AA87" />
            <Text className="mt-4">Processing payment...</Text>
        </View>
    );
} 