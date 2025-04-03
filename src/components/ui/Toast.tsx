import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose?: () => void;
    icon?: React.ReactNode;
}

export default function Toast({ message, isVisible, onClose, icon }: ToastProps) {
    if (!isVisible) return null;

    return (
        <View className="absolute top-12 left-4 right-4 bg-accent-success rounded-lg px-4 py-6 z-50 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                {icon && (
                    <View className="mr-2">
                        {icon}
                    </View>
                )}
                <Text className="text-white flex-1 text-base" weight="medium">
                    {message}
                </Text>
            </View>
            {onClose && (
                <TouchableOpacity onPress={onClose} className="ml-2">
                    <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
} 