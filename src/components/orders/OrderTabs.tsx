import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from '@/components/ui/Text';

type TabType = 'cart' | 'in-progress' | 'completed';

interface OrderTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const OrderTabs: React.FC<OrderTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs: { key: TabType; label: string }[] = [
        { key: 'cart', label: 'Cart' },
        { key: 'in-progress', label: 'In progress' },
        { key: 'completed', label: 'Completed' }
    ];

    return (
        <View className="flex-row bg-background-disabled rounded-full p-1.5 mx-4 mb-5">
            {tabs.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    onPress={() => onTabChange(tab.key)}
                    className={`flex-1 py-2.5 px-4 rounded-full ${activeTab === tab.key ? 'bg-black' : ''
                        }`}
                >
                    <Text
                        weight={activeTab === tab.key ? 'medium' : 'regular'}
                        className={`text-center text-sm ${activeTab === tab.key
                            ? 'text-white'
                            : 'text-secondary-caption'
                            }`}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}; 