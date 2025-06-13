import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '@/components/ui/Text';
import { useCartStore } from '@/store/cartStore';

export const DeliveryAndPayment: React.FC = () => {
    const { items, getTotalAmount } = useCartStore();
    const totalAmount = getTotalAmount();
    const deliveryFee = process.env.EXPO_PUBLIC_DELIVERY_FEE!

    return (
        <ScrollView className="flex-1">
            <View className="p-4">
                {/* Delivery Details Section */}
                <Text weight="medium" className="text-sm mb-4 text-tc-primary">
                    Delivery details
                </Text>

                {/* PIN Confirmation Warning */}
                <View className="bg-[#FFF9E7] p-4 rounded-lg mb-4 flex-row items-start justify-center">
                    <Ionicons name="information-circle" size={24} color="#6B4D00" />
                    <Text className="text-[#6B4D00] ml-2 flex-1">
                        Please note that delivery requires PIN confirmation
                    </Text>
                </View>

                {/* Address Selection */}
                <View className="mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4 bg-white rounded-lg border border-secondary-stroke"
                        onPress={() => {/* Address handler */ }}
                    >
                        <View className="flex-row items-center flex-1">
                            <Ionicons name="location-outline" size={24} color="#020202" />
                            <View className="ml-3 flex-1">
                                <Text weight="medium" className="text-tc-primary">
                                    Boys Hostel 1
                                </Text>
                                <Text className="text-secondary-caption">
                                    Menlo Park, CA, USA
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="create-outline" size={24} color="#6B707A" />
                    </TouchableOpacity>
                </View>

                {/* Note for Driver */}
                <TouchableOpacity
                    className="flex-row items-center justify-between mb-6"
                    onPress={() => {/* Note handler */ }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="bicycle-outline" size={24} color="#020202" />
                        <Text className="text-tc-primary ml-3">
                            Note for the driver
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#6B707A" />
                </TouchableOpacity>

                {/* Summary Section */}
                <View className="mb-6">
                    <Text weight="medium" className="text-2xl mb-4">
                        Summary
                    </Text>

                    {/* Promo Code */}
                    <TouchableOpacity
                        className="flex-row items-center justify-between mb-4"
                        onPress={() => {/* Promo handler */ }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="pricetag-outline" size={24} color="#34AA87" />
                            <Text className="text-primary-main ml-3">
                                Apply promo code
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#6B707A" />
                    </TouchableOpacity>

                    {/* Cost Breakdown */}
                    <View className="space-y-4">
                        <View className="flex-row justify-between">
                            <Text className="text-tc-primary">
                                Sub-total ({items.length} items)
                            </Text>
                            <Text weight="medium" className="text-tc-primary">
                                ₦{totalAmount.toLocaleString()}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-tc-primary">
                                Delivery fee
                            </Text>
                            <Text weight="medium" className="text-tc-primary">
                                ₦{deliveryFee.toLocaleString()}
                            </Text>
                        </View>
                        <View className="flex-row justify-between pt-4 border-t border-secondary-divider">
                            <Text weight="medium" className="text-tc-primary">
                                Total
                            </Text>
                            <Text weight="medium" className="text-tc-primary">
                                ₦{(totalAmount + deliveryFee).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Method Section */}
                <View>
                    <Text weight="medium" className="text-2xl mb-4">
                        Payment Method
                    </Text>
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4 bg-white rounded-lg border border-secondary-stroke"
                        onPress={() => {/* Payment handler */ }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="globe-outline" size={24} color="#020202" />
                            <Text className="text-tc-primary ml-3">
                                Pay online
                            </Text>
                        </View>
                        <View className="h-6 w-6 rounded-full border-2 border-secondary-stroke" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}; 