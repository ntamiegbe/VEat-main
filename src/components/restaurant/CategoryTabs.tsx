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
                className={`mr-6 p-2 rounded-full ${activeCategory === category ? 'bg-accent-overlay' : ''}`}
                onPress={() => setActiveCategory(category)}
            >
                <Text
                    weight={activeCategory === category ? 'medium' : 'regular'}
                    className={`text-xs ${activeCategory === category ? 'text-primary-main' : 'text-secondary-caption'}`}
                >
                    {category}
                </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
); 