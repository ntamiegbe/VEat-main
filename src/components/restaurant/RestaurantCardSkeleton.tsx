import { View } from "react-native";

export const RestaurantCardSkeleton = () => (
    <View className="bg-white rounded-2xl overflow-hidden mb-4 border border-secondary-stroke">
        {/* Banner Skeleton */}
        <View className="w-full h-36 bg-gray-100" />

        {/* Logo Skeleton */}
        <View className="absolute top-24 left-5">
            <View className="bg-white rounded-full p-2">
                <View className="w-16 h-16 rounded-full bg-gray-100" />
            </View>
        </View>

        {/* Content Skeleton */}
        <View className="px-4 pt-8 pb-2">
            {/* Restaurant Name Skeleton */}
            <View className="h-5 w-40 bg-gray-100 rounded-md mb-2" />

            {/* Status and Rating Skeleton */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="h-4 w-16 bg-gray-100 rounded-full" />
                    <View className="h-4 w-20 bg-gray-100 rounded-full" />
                </View>
                <View className="h-6 w-16 bg-gray-100 rounded-full" />
            </View>
        </View>
    </View>
);
