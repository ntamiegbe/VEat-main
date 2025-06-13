import React from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/ui/Text';
import { CheckoutSteps } from '@/components/orders/CheckoutSteps';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/global/button';
import { OrderReview } from '@/components/checkout/OrderReview';
import { DeliveryAndPayment } from '@/components/checkout/DeliveryAndPayment';

type CheckoutStep = 'order' | 'delivery';

export default function CheckoutScreen() {
    const [currentStep, setCurrentStep] = React.useState<CheckoutStep>('order');

    const handleBack = () => {
        if (currentStep === 'delivery') {
            // If on delivery step, go back to order review
            setCurrentStep('order');
        } else {
            // If on order review, go back to orders page
            router.push('/(app)/orders');
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
            {currentStep === 'order' ? <OrderReview /> : <DeliveryAndPayment />}

            {/* Bottom Buttons */}
            <View className="p-4 border-t border-secondary-divider flex-row">
                {currentStep === 'delivery' && (
                    <Button
                        variant="error"
                        onPress={handleBack}
                        className="flex-1 mr-3"
                    >
                        Cancel
                    </Button>
                )}
                <View className={currentStep === 'delivery' ? 'flex-1' : 'flex-1'}>
                    <Button
                        onPress={() => {
                            if (currentStep === 'order') {
                                setCurrentStep('delivery');
                            } else {
                                // Handle order confirmation
                            }
                        }}
                    >
                        {currentStep === 'order' ? 'Make payment' : 'Confirm order'}
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
} 