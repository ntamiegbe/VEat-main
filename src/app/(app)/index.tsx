import React, { useEffect } from 'react';
import { View, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useHasLocation, useUserLocation } from '@/services/location';
import { router } from 'expo-router';
import FoodCategorySlider from '@/components/ui/FoodCategorySlider';
import { useFoodCategories } from '@/services/foodCategories';
import LocationPicker from '@/components/ui/LocationPicker';
import ExploreRestaurantsRow from '@/components/ui/ExploreRestaurantsRow';
import { RestaurantSection } from '@/components/home/RestaurantSection';

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView>
        {/* Header with location */}
        <View className="px-4 pt-6 pb-2">
          <LocationPicker
            locationName={userLocation?.name}
            isLoading={isLoadingUserLocation}
          />
        </View>

        {/* Food Categories Slider */}
        <FoodCategorySlider
          categories={foodCategories || []}
          location={userLocation?.name}
          isLoading={isLoadingCategories}
        />

        {/* Explore Restaurants Row */}
        <ExploreRestaurantsRow title="Explore" maxItems={10} />

        {/* All Restaurants Section */}
        <RestaurantSection title="All Restaurants" />

        {/* Bottom padding */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}