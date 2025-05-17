import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar } from 'react-native';
import { useHasLocation, useUserLocation } from '@/services/location';
import { router } from 'expo-router';
import FoodCategorySlider from '@/components/ui/FoodCategorySlider';
import { useFoodCategories } from '@/services/foodCategories';

export default function HomeScreen() {
  const {
    isLoading: isLoadingLocation,
    data: hasLocation
  } = useHasLocation();

  const {
    data: userLocation,
    isLoading: isLoadingUserLocation,
    isError: isErrorUserLocation,
    error: userLocationError
  } = useUserLocation();

  const {
    data: foodCategories,
    isLoading: isLoadingCategories,
    isError: isErrorFoodCategories,
    error: foodCategoriesError
  } = useFoodCategories();

  // Redirect if no location is set
  useEffect(() => {
    if (!isLoadingLocation && !hasLocation) {
      router.replace('/location');
    }
  }, [isLoadingLocation, hasLocation]);

  return (
    <SafeAreaView className="flex-1 bg-[#FCFCFC]">
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />

      {/* Header with location */}
      <View className="px-4 pt-6 pb-2">
        <Text className="text-sm text-tc-secondary mt-1">
          Delivering to <Text className="font-medium text-primary-main">{userLocation?.name}</Text>
        </Text>
      </View>

      {/* Food Categories Slider */}
      <FoodCategorySlider
        categories={foodCategories || []}
        location={userLocation?.name}
        isLoading={isLoadingCategories}
      />
    </SafeAreaView>
  );
}