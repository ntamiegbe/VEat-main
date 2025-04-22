import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';
import Text from '@/components/ui/Text';
import Button from '@/components/global/button';
import Input from '@/components/global/input';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { requestPasswordResetOTP } from '@/lib/edgeFunctions';

export default function ForgotPasswordScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast(5000);

    // Form for reset request (email)
    const methods = useForm({
        defaultValues: {
            email: '',
        },
        mode: 'onChange',
    });

    // Handle requesting password reset
    const handleRequestReset = methods.handleSubmit(async (data) => {
        try {
            setIsLoading(true);

            // Validate email format
            if (!/^\S+@\S+\.\S+$/.test(data.email)) {
                toast.showError('Please enter a valid email address');
                setIsLoading(false);
                return;
            }

            const response = await requestPasswordResetOTP(data.email);

            if (response.success) {
                toast.showSuccess(response.message || 'Verification code sent to your email');

                // Navigate to verify OTP screen with email
                router.push({
                    pathname: '/(auth)/verify-reset-otp',
                    params: { email: data.email }
                });
            } else {
                // Show error message
                toast.showError(response.message || 'Failed to request password reset');
            }
        } catch (error) {
            console.error('Error requesting password reset:', error);
            toast.showError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <AuthLayout>
            <Text className="text-tc-primary text-[22px] font-medium mb-6">
                Forgot Password
            </Text>

            <FormProvider {...methods}>
                <View className="space-y-4 w-full">
                    <Text weight="regular" className="text-secondary-subtext text-sm mb-2">
                        Enter your email address and we'll send you a verification code to reset your password
                    </Text>

                    <Input
                        label="Email"
                        name="email"
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        rules={['required', 'email']}
                    />

                    <Button
                        onPress={handleRequestReset}
                        disabled={!methods.formState.isValid || isLoading}
                        isLoading={isLoading}
                        className="mt-4"
                    >
                        Send Verification Code
                    </Button>

                    <View className="items-center pt-4">
                        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                            <Text weight="medium" className="text-primary-main text-sm">
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </FormProvider>

            {/* Toast Component */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={toast.hideToast}
                icon={toast.icon}
                type={toast.type}
            />
        </AuthLayout>
    );
} 