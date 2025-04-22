import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/ui/Text';
import Button from '@/components/global/button';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';
import { Ionicons } from '@expo/vector-icons';
import LocationIcon from '@assets/icons/LocationIcon.svg';
import { TextInput } from 'react-native';
import { useLocations, useSetUserLocation, useHasLocation, type Location } from '@/services/location';

export default function LocationScreen() {
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    // Use location hooks
    const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
    const { data: hasLocation } = useHasLocation();
    const { mutate: setLocation, isPending: isSettingLocation } = useSetUserLocation();

    // Redirect if location is already set
    useEffect(() => {
        if (hasLocation) {
            router.replace("/(app)");
        }
    }, [hasLocation]);

    // Handle location selection
    const handleLocationSelect = (locationId: string) => {
        setSelectedLocation(locationId);
    };

    // Save selected location and continue
    const handleContinue = async () => {
        if (!selectedLocation) {
            toast.showError('Please select a delivery location');
            return;
        }

        setLocation(selectedLocation, {
            onSuccess: () => {
                toast.showSuccess('Delivery location set successfully');
                router.replace("/(app)");
            },
            onError: (error) => {
                console.error('Error saving location:', error);
                let errorMessage = 'Failed to save delivery location.';

                if (error instanceof Error) {
                    if (error.message.includes('phone_number')) {
                        errorMessage = 'This phone number is already registered with another account.';
                    } else if (error.message.includes('network')) {
                        errorMessage = 'Network error. Please check your internet connection and try again.';
                    }
                }

                toast.showError(errorMessage);
            }
        });
    };

    // Filter locations based on search query
    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-tc-primary text-xl font-medium mb-4">
                    Select delivery location
                </Text>
                <View className="flex-row items-center bg-[#F5F5F5] rounded-full px-4 py-3">
                    <Ionicons name="search-outline" size={20} color="#666" />
                    <TextInput
                        placeholder="Search for a location"
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-2 text-base text-gray-900"
                    />
                </View>
            </View>

            <ScrollView className="flex-1 px-4">
                {filteredLocations.map((location) => (
                    <TouchableOpacity
                        key={location.id}
                        onPress={() => handleLocationSelect(location.id)}
                        className="flex-row items-center py-4"
                    >
                        <LocationIcon />
                        <View className="flex-1 ml-4">
                            <Text className="text-tc-primary text-sm font-light">
                                {location.name}
                            </Text>
                            {location.description && (
                                <Text className="text-secondary-caption text-xs">
                                    {location.description}
                                </Text>
                            )}
                        </View>
                        {selectedLocation === location.id && (
                            <Ionicons name="checkmark" size={24} color="#34AA87" />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View className="p-4 border-t border-gray-200">
                <Button
                    onPress={handleContinue}
                    disabled={!selectedLocation}
                    isLoading={isSettingLocation}
                >
                    Save and continue
                </Button>
            </View>

            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={toast.hideToast}
                type={toast.type}
            />
        </SafeAreaView>
    );
}
