import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import Text from '@/components/ui/Text';

interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

/**
 * Horizontal scrollable tabs for food categories
 */
export const CategoryTabs = ({ categories, activeCategory, setActiveCategory }: CategoryTabsProps) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        className="px-5"
    >
        {categories.map((category) => (
            <TouchableOpacity
                key={category}
                className={`mr-6 pb-2 ${activeCategory === category ? 'border-b-2 border-green-700' : ''}`}
                onPress={() => setActiveCategory(category)}
            >
                <Text
                    weight={activeCategory === category ? 'medium' : 'regular'}
                    className={`text-lg ${activeCategory === category ? 'text-green-700' : 'text-gray-500'}`}
                >
                    {category}
                </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
); 