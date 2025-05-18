import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { FoodCategory } from '@/services/foodCategories';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import FoodCategoryImage from './FoodCategoryImage';
import { MaterialIcons } from '@expo/vector-icons';

interface FoodCategoryItemProps {
    item: FoodCategory;
    index: number;
}

const FoodCategoryItem: React.FC<FoodCategoryItemProps> = ({ item, index }) => {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
                type: 'timing',
                duration: 350,
                delay: 50 + index * 40
            }}
            className="items-center w-24"
        >
            <TouchableOpacity
                className="items-center"
                onPress={() => router.push({
                    pathname: "/(app)/search",
                    params: { categoryId: item.id }
                })}
                activeOpacity={0.7}
            >
                <FoodCategoryImage
                    imageUrl={item.image}
                    name={item.name}
                    size={52}
                />
                <Text className="mt-2 text-sm font-medium text-tc-primary text-center">
                    {item.name}
                </Text>
            </TouchableOpacity>
        </MotiView>
    );
};

interface FoodCategorySliderProps {
    categories: FoodCategory[];
    location?: string;
    isLoading?: boolean;
}

const FoodCategorySlider: React.FC<FoodCategorySliderProps> = ({
    categories = [],
    location,
    isLoading = false
}) => {
    // Show loading state
    if (isLoading) {
        return (
            <View className="mt-4 px-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="py-2"
                    contentContainerStyle={{
                        paddingRight: 10,
                    }}
                >
                    {[1, 2, 3, 4].map((_, index) => (
                        <View key={index} className="mr-4 items-center w-24">
                            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center" />
                            <View className="mt-2 h-4 w-16 bg-gray-100 rounded-md" />
                        </View>
                    ))
                    }
                </ScrollView >
            </View >
        );
    }

    // Don't render if no categories
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <View className="mt-4">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-2"
            >
                {categories.map((item, index) => (
                    <FoodCategoryItem key={item.id || index} item={item} index={index} />
                ))}
                <TouchableOpacity
                    className="items-center"
                    onPress={() => router.push('/(app)/search')}
                    style={{
                        marginLeft: 10,
                    }}
                >
                    <View className="size-[52px] rounded-full bg-green-50 items-center justify-center">
                        <MaterialIcons name="arrow-forward" size={20} color="#0E8345" />
                    </View>
                    <Text className="mt-2 text-sm font-medium text-primary-main text-center">
                        See all
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default FoodCategorySlider; 