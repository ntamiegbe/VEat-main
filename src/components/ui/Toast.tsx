import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose?: () => void;
    icon?: React.ReactNode;
    type?: ToastType;
}

export default function Toast({ message, isVisible, onClose, icon, type = 'info' }: ToastProps) {
    if (!isVisible) return null;

    // Choose background color based on type
    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-primary-main';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-800';
        }
    };

    // Default icons by type if none provided
    const getIcon = () => {
        if (icon) return icon;

        switch (type) {
            case 'success':
                return <Ionicons name="checkmark-circle" size={24} color="white" />;
            case 'error':
                return <Ionicons name="alert-circle" size={24} color="white" />;
            default:
                return <Ionicons name="information-circle" size={24} color="white" />;
        }
    };

    return (
        <View className={`absolute top-10 left-4 right-4 ${getBgColor()} rounded-lg px-4 py-6 z-50 flex-row items-center justify-between`}>
            <View className="flex-row items-center flex-1">
                <View className="mr-2">
                    {getIcon()}
                </View>
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