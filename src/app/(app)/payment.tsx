import { useLocalSearchParams } from 'expo-router';
import PaymentWebView from '@/components/payment/PaymentWebView';
import { View } from 'react-native';
import Text from '@/components/ui/Text';

export default function PaymentScreen() {
    const { paymentUrl, reference, orderId } = useLocalSearchParams<{
        paymentUrl: string;
        reference: string;
        orderId: string;
    }>();

    if (!paymentUrl || !reference || !orderId) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-red-500 text-center">
                    Missing required payment information
                </Text>
                <Text className="text-gray-600 text-center mt-2">
                    {!paymentUrl && 'Payment URL is missing\n'}
                    {!reference && 'Payment reference is missing\n'}
                    {!orderId && 'Order ID is missing'}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <PaymentWebView
                paymentUrl={decodeURIComponent(paymentUrl)}
                reference={reference}
                orderId={orderId}
            />
        </View>
    );
} 