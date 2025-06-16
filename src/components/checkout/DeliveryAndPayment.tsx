import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Text from '@/components/ui/Text';
import { useCartStore } from '@/store/cartStore';
import { useUserLocation } from '@/services/location';
import { useInitiatePayment } from '@/services/payment';
import { supabase } from '@/lib/supabase';
import EditIcon from '@assets/icons/EditIcon.svg';
import PromoIcon from '@assets/icons/PromoIcon.svg';

interface DeliveryAndPaymentProps {
    onValidationChange?: (isValid: boolean) => void;
    onPaymentStart?: () => void;
}

export const DeliveryAndPayment: React.FC<DeliveryAndPaymentProps> = ({
    onValidationChange,
    onPaymentStart
}) => {
    const { items, getTotalAmount } = useCartStore();
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const { data: userLocation } = useUserLocation();
    const totalAmount = getTotalAmount();
    const deliveryFee = process.env.EXPO_PUBLIC_DELIVERY_FEE!
    const [selectedPayment, setSelectedPayment] = useState<'online' | null>(null);
    const initPayment = useInitiatePayment();

    // Update validation whenever location or payment changes
    React.useEffect(() => {
        const isValid = !!userLocation && !!selectedPayment;
        onValidationChange?.(isValid);
    }, [userLocation, selectedPayment, onValidationChange]);

    const handleAddressPress = () => {
        router.push('/location');
    };

    const handlePaymentPress = () => {
        setSelectedPayment('online');
    };

    const handlePayment = async () => {
        try {
            onPaymentStart?.();

            // Get user email
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user?.email) throw new Error('User email not found');

            // Initialize payment
            await initPayment.mutateAsync({
                amount: totalAmount + Number(deliveryFee),
                email: user.email
            });
        } catch (error) {
            console.error('Payment error:', error);
            // Handle error (show toast, etc.)
        }
    };

    // Pass handlePayment to parent through validation
    React.useEffect(() => {
        if (!!userLocation && !!selectedPayment) {
            onValidationChange?.(true);
            // @ts-ignore - We'll handle this in the parent component
            onValidationChange?.(true, handlePayment);
        } else {
            onValidationChange?.(false);
        }
    }, [userLocation, selectedPayment, onValidationChange]);

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Delivery Details Header */}
            <View className="bg-gray-50 px-4 py-2">
                <Text weight="medium" className="text-tc-primary">
                    Delivery details
                </Text>
            </View>

            {/* PIN Confirmation Warning */}
            <View className="bg-[#FFF9E7] px-4 py-2">
                <View className="flex-row items-center">
                    <Ionicons name="information-circle-outline" size={18} color="#444444" />
                    <Text className="text-[#3F3300] ml-2 flex-1 text-sm font-medium">
                        Please note that delivery requires PIN confirmation
                    </Text>
                </View>
            </View>

            {/* Address Selection */}
            <View className="px-4 py-5">
                <TouchableOpacity
                    className="flex-row items-center justify-between"
                    onPress={handleAddressPress}
                >
                    <View className="flex-row items-center flex-1">
                        <Ionicons name="location-outline" size={24} color="#020202" />
                        <View className="ml-3 flex-1">
                            {userLocation ? (
                                <>
                                    <Text weight="medium" className="text-tc-primary text-sm font-regular">
                                        {userLocation.name}
                                    </Text>
                                    <Text className="text-secondary-caption text-xs font-regular">
                                        {userLocation.address}
                                    </Text>
                                </>
                            ) : (
                                <Text className="text-secondary-caption">
                                    Select a delivery address
                                </Text>
                            )}
                        </View>
                    </View>
                    <EditIcon />
                </TouchableOpacity>
            </View>

            <View className="mx-4 pb-2 border-b border-secondary-divider" />

            {/* Note for Driver */}
            <View className="px-4 py-5">
                <TouchableOpacity
                    className="flex-row items-center justify-between"
                    onPress={() => {/* Note handler */ }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="bicycle-outline" size={24} color="#8A909C" />
                        <Text className="text-tc-primary ml-3">
                            Note for the driver
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#444444" />
                </TouchableOpacity>
            </View>

            {/* Order Summary Header */}
            <View className="bg-gray-50 px-4 py-3">
                <Text weight="medium" className="text-tc-primary">
                    Order summary
                </Text>
            </View>

            {/* Summary Content */}
            <View className="px-4 py-6">
                {/* Promo Code */}
                <TouchableOpacity
                    className="flex-row items-center justify-between mb-4 border-b border-secondary-divider pb-4"
                    onPress={() => {/* Promo handler */ }}
                >
                    <View className="flex-row items-center">
                        <PromoIcon />
                        <Text className="text-tc-primary text-sm font-regular ml-3">
                            Apply promo code
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#444444" />
                </TouchableOpacity>

                {/* Cost Breakdown */}
                <View className="gap-4">
                    <View className="flex-row justify-between">
                        <Text weight='regular' className="text-tc-primary font-regular">
                            Sub-total ({totalItems} items)
                        </Text>
                        <Text weight='regular' className="text-tc-primary font-regular">
                            ₦{totalAmount.toLocaleString()}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text weight='regular' className="text-tc-primary font-regular">
                            Delivery fee
                        </Text>
                        <Text weight='regular' className="text-tc-primary font-regular">
                            ₦{deliveryFee}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text weight='bold' className="text-tc-primary font-medium">
                            Total
                        </Text>
                        <Text weight='bold' className="text-tc-primary font-medium">
                            ₦{(totalAmount + Number(deliveryFee)).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Payment Method Header */}
            <View className="bg-gray-50 px-4 py-2">
                <Text weight="medium" className="text-tc-primary">
                    Payment Method
                </Text>
            </View>

            {/* Payment Method Content */}
            <View className="px-4 py-6">
                <TouchableOpacity
                    className="flex-row items-center justify-between"
                    onPress={handlePaymentPress}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="globe-outline" size={24} color="#020202" />
                        <Text className="text-tc-primary ml-3">
                            Pay online
                        </Text>
                    </View>
                    <View className={`h-6 w-6 rounded-full border-2 ${selectedPayment === 'online' ? 'bg-primary-main border-primary-main' : 'border-secondary-stroke'}`}>
                        {selectedPayment === 'online' && (
                            <View className="flex-1 items-center justify-center">
                                <View className="w-3 h-3 rounded-full bg-white" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}; 