import React, { useRef, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OrderReview } from '@/components/checkout/OrderReview';
import { DeliveryAndPayment } from '@/components/checkout/DeliveryAndPayment';
import Button from '@/components/global/button';
import Text from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { CheckoutSteps } from '@/components/orders/CheckoutSteps';

type Step = 'order' | 'delivery';

export default function Checkout() {
    const [currentStep, setCurrentStep] = useState<Step>('order');
    const [isLoading, setIsLoading] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const handlePaymentRef = useRef<() => Promise<void> | null>(null);

    const handleBack = () => {
        if (currentStep === 'delivery') {
            // If on delivery step, go back to order review
            setCurrentStep('order');
        } else {
            // If on order review, go back to orders page
            router.replace({
                pathname: '/(app)/orders'
            });
        }
    };

    const handleValidationChange = (valid: boolean, paymentHandler?: () => Promise<void>) => {
        setIsValid(valid);
        if (paymentHandler) {
            handlePaymentRef.current = paymentHandler;
        }
    };

    const handleContinue = async () => {
        if (currentStep === 'order') {
            setCurrentStep('delivery');
        } else {
            // Handle payment
            console.log('Continue button clicked, checking payment handler');
            if (handlePaymentRef.current) {
                try {
                    console.log('Payment handler found, starting payment...');
                    setIsLoading(true);
                    await handlePaymentRef.current();
                } catch (error) {
                    console.error('Payment execution error:', error);
                    // Handle error (show toast, etc.)
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.log('No payment handler found');
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity
                    onPress={handleBack}
                    className="mr-4"
                >
                    <Ionicons name="arrow-back" size={24} color="#020202" />
                </TouchableOpacity>
                <Text weight="medium" className="text-lg flex-1 text-center">
                    Checkout
                </Text>
                <View className="w-8" /> {/* Spacer for alignment */}
            </View>

            {/* Steps Indicator */}
            <CheckoutSteps currentStep={currentStep} />

            {/* Content */}
            {currentStep === 'order' ? (
                <OrderReview />
            ) : (
                <DeliveryAndPayment
                    onValidationChange={handleValidationChange}
                    onPaymentStart={() => setIsLoading(true)}
                />
            )}

            {/* Bottom Buttons */}
            <View className="p-4 border-t border-secondary-divider flex-row">
                {currentStep === 'delivery' && (
                    <Button
                        variant="error"
                        onPress={handleBack}
                        className="flex-1 mr-3"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
                <View className={currentStep === 'delivery' ? 'flex-1' : 'flex-1'}>
                    <Button
                        onPress={handleContinue}
                        disabled={currentStep === 'delivery' && !isValid}
                        isLoading={isLoading}
                    >
                        {currentStep === 'order' ? 'Continue' : 'Confirm order'}
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
} 