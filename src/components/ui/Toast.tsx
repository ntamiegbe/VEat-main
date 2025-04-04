import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'warning' | 'error';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose?: () => void;
    icon?: React.ReactNode;
    type?: ToastType;
}

export default function Toast({
    message,
    isVisible,
    onClose,
    icon,
    type = 'success'
}: ToastProps) {
    if (!isVisible) return null;

    // Define styles based on toast type
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-accent-success';
            case 'warning':
                return 'bg-amber-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-accent-success';
        }
    };

    // Default icons if none provided
    const getDefaultIcon = () => {
        if (icon) return icon;

        switch (type) {
            case 'success':
                return <Ionicons name="checkmark-circle" size={20} color="white" />;
            case 'warning':
                return <Ionicons name="alert-circle" size={20} color="white" />;
            case 'error':
                return <Ionicons name="close-circle" size={20} color="white" />;
            default:
                return <Ionicons name="checkmark-circle" size={20} color="white" />;
        }
    };

    return (
        <View className={`absolute top-12 left-4 right-4 ${getBackgroundColor()} rounded-lg px-4 py-6 z-50 flex-row items-center justify-between`}>
            <View className="flex-row items-center flex-1">
                <View className="mr-2">
                    {getDefaultIcon()}
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