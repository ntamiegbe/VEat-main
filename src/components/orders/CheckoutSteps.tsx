import React from 'react';
import { View } from 'react-native';
import Text from '@/components/ui/Text';

type CheckoutStep = 'order' | 'delivery';

interface CheckoutStepsProps {
    currentStep: CheckoutStep;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
    return (
        <View className="flex-row items-center justify-between px-4 py-3 gap-2">
            <View className="flex-1">
                <Text
                    weight={currentStep === 'order' ? 'medium' : 'regular'}
                    className={`text-center text-sm ${currentStep === 'order'
                        ? 'text-primary-main'
                        : 'text-secondary-caption'
                        }`}
                >
                    Your order
                </Text>
                <View
                    className={`h-2 mt-2 rounded-full ${currentStep === 'order'
                        ? 'bg-primary-main'
                        : 'bg-background-disabled'
                        }`}
                />
            </View>
            <View className="flex-1">
                <Text
                    weight={currentStep === 'delivery' ? 'medium' : 'regular'}
                    className={`text-center text-sm ${currentStep === 'delivery'
                        ? 'text-primary-main'
                        : 'text-secondary-caption'
                        }`}
                >
                    Delivery & Payment
                </Text>
                <View
                    className={`h-2 mt-2 rounded-full ${currentStep === 'delivery'
                        ? 'bg-primary-main'
                        : 'bg-background-disabled'
                        }`}
                />
            </View>
        </View>
    );
}; 