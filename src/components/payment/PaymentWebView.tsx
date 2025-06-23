import { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { router } from 'expo-router';
import Text from '@/components/ui/Text';
import { useUpdateOrderStatus } from '@/services/orders';
import { useCartStore } from '@/store/cartStore';
import Constants from 'expo-constants';
import BackButton from '@/components/global/back-button';

interface PaymentWebViewProps {
    paymentUrl: string;
    reference: string;
    orderId: string;
}

export default function PaymentWebView({ paymentUrl, reference, orderId }: PaymentWebViewProps) {
    const webViewRef = useRef<WebView>(null);
    const updateOrderStatus = useUpdateOrderStatus();
    const clearCart = useCartStore(state => state.clearCart);
    const hasProcessedPayment = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const processedReference = useRef<string | null>(null);

    // Reset payment processing state when payment details change
    useEffect(() => {
        hasProcessedPayment.current = false;
        processedReference.current = null;
    }, [paymentUrl, reference, orderId]);

    const handleCancel = () => {
        router.replace({
            pathname: '/(app)/checkout',
            params: { error: 'payment-cancelled' }
        });
    };

    const handlePaymentSuccess = async (paymentRef: string) => {
        // Check if this specific payment reference has been processed
        if (processedReference.current === paymentRef) {
            console.log('This specific payment reference has already been processed:', paymentRef);
            return;
        }

        try {
            processedReference.current = paymentRef;
            hasProcessedPayment.current = true;

            // Update order status to confirmed
            await updateOrderStatus.mutateAsync({
                orderId,
                status: 'confirmed',
                paymentReference: paymentRef
            });

            // Clear the cart
            clearCart();

            // Redirect to in-progress orders with correct tab parameter
            router.replace('/(app)/orders?tab=in-progress');
        } catch (error) {
            console.error('Error processing successful payment:', error);
            // Reset the processing state on error
            processedReference.current = null;
            hasProcessedPayment.current = false;
            router.replace('/(app)/orders?tab=cart');
        }
    };

    // Inject JavaScript to catch payment events
    const injectedJavaScript = `
        (function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'debug',
                message: 'JavaScript injection successful'
            }));

            function handleMessage(event) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'paystack_event',
                    data: event.data
                }));
            }

            window.addEventListener('message', handleMessage);
            window.addEventListener('error', function(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    message: e.message
                }));
            });
        })();
    `;

    const handleMessage = async (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === 'debug') {
                console.log('Debug message:', data.message);
                return;
            }

            if (data.type === 'error') {
                console.error('WebView error:', data.message);
                setError(data.message);
                return;
            }

            // Handle string data format
            if (typeof data.data === 'string') {
                try {
                    const parsedData = JSON.parse(data.data);
                    if (parsedData.status === 'success') {
                        await handlePaymentSuccess(parsedData.reference);
                        return;
                    }
                } catch (e) {
                    // Not JSON string data, continue to other checks
                }
            }

            // Handle object data format
            if (data.data?.event === 'success' && data.data?.data?.status === 'success') {
                await handlePaymentSuccess(data.data.data.reference);
                return;
            }

        } catch (error) {
            console.error('Error handling WebView message:', error);
        }
    };

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center px-4 py-2">
                    <BackButton onPress={handleCancel} />
                </View>
                <View className="flex-1 items-center justify-center p-4">
                    <Text className="text-red-500 text-center mb-4">An error occurred</Text>
                    <Text className="text-center text-gray-600">{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-2">
                <BackButton onPress={handleCancel} />
            </View>
            {isLoading && (
                <View className="absolute inset-0 flex items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#34AA87" />
                    <Text className="mt-4">Loading payment page...</Text>
                </View>
            )}
            <WebView
                ref={webViewRef}
                source={{ uri: decodeURIComponent(paymentUrl) }}
                onMessage={handleMessage}
                injectedJavaScript={injectedJavaScript}
                onLoadStart={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    setIsLoading(true);
                }}
                onLoadEnd={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    setIsLoading(false);
                }}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error:', nativeEvent);
                    setError(`Failed to load payment page: ${nativeEvent.description}`);
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView HTTP error:', nativeEvent);
                    setError(`HTTP error: ${nativeEvent.statusCode}`);
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                style={{ flex: 1 }}
            />
        </SafeAreaView>
    );
} 