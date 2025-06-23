import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUpdateOrderStatus } from '@/services/orders';
import Text from '@/components/ui/Text';
import { Database } from '@/database.types';

type OrderStatus = Database['public']['Enums']['order_status_type'];

export default function PaymentCallbackScreen() {
    const { status, reference, orderId } = useLocalSearchParams<{
        status: string;
        reference: string;
        orderId: string;
    }>();
    const updateOrderStatus = useUpdateOrderStatus();

    useEffect(() => {
        const handlePaymentCallback = async () => {

            if (!reference || !orderId) {
                console.error('Missing payment reference or order ID');
                router.replace('/(app)/orders?tab=cart');
                return;
            }

            try {
                // Update order status based on payment status
                const newStatus = (status === 'success' ? 'confirmed' : 'cancelled') as OrderStatus;

                // Wait for the mutation to complete
                await updateOrderStatus.mutateAsync({
                    orderId,
                    status: newStatus,
                    paymentReference: status === 'success' ? reference : undefined
                });

                // Add a longer delay to ensure query invalidation and refetch completes
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Force a hard navigation to ensure the orders page reloads completely
                const redirectPath = status === 'success'
                    ? '/(app)/orders?tab=in-progress'
                    : '/(app)/orders?tab=cart';

                router.replace(redirectPath);
            } catch (error) {
                console.error('Error updating order status:', error);
                // If there's an error, go to cart tab to let user try again
                router.replace('/(app)/orders?tab=cart');
            }
        };

        handlePaymentCallback();
    }, [status, reference, orderId, updateOrderStatus]);

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#10B981" />
            <Text weight="medium" className="mt-4">Processing your payment...</Text>
        </View>
    );
} 