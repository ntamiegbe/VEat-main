import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
    message: string;
    onDismiss?: () => void;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    onDismiss,
    className = ''
}) => {
    return (
        <View className={`bg-red-50 border border-red-200 rounded-lg p-4 flex-row items-center ${className}`}>
            <Ionicons name="close" size={20} color="#EF4444" />
            <Text className="text-red-600 flex-1">{message}</Text>
            {onDismiss && (
                <Text
                    className="text-red-600 text-sm font-medium"
                    onPress={onDismiss}
                >
                    Dismiss
                </Text>
            )}
        </View>
    );
}; 