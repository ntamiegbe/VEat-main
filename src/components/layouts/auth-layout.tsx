import React from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import BackButton from '@/components/global/back-button';
import Button from '@/components/global/button';

interface AuthLayoutProps {
    children: React.ReactNode;
    contentContainerStyle?: any;
    continueButton?: {
        onPress: () => void;
        disabled?: boolean;
        isLoading?: boolean;
        text?: string;
    };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    contentContainerStyle,
    continueButton
}) => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
                    keyboardShouldPersistTaps="handled"
                >
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        className="flex-1 px-6 pt-6"
                    >
                        {children}
                    </MotiView>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Fixed position buttons - completely outside KeyboardAvoidingView */}
            <View className="absolute left-0 right-0 bottom-0 px-6 pb-8 flex-row justify-between items-center bg-white">
                <View>
                    <BackButton />
                </View>
                {continueButton && (
                    <View>
                        <Button
                            onPress={continueButton.onPress}
                            disabled={continueButton.disabled}
                            isLoading={continueButton.isLoading}
                            className="w-[115px]"
                        >
                            {continueButton.text || 'Continue'}
                        </Button>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}; 