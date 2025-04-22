import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';
import Text from '@/components/ui/Text';
import Button from '@/components/global/button';
import Input from '@/components/global/input';
import { updatePasswordWithOTP } from '@/lib/edgeFunctions';

type PasswordFormData = {
    password: string;
    confirmPassword: string;
};

export default function NewPasswordScreen() {
    // Get params
    const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast(5000);

    // Check for required params
    useEffect(() => {
        if (!email || !otp) {
            toast.showError('Missing required information');
            router.replace('/(auth)/forgot-password');
        }
    }, [email, otp]);

    // Form setup
    const methods = useForm<PasswordFormData>({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        mode: 'onChange',
    });

    // Handle form submission
    const handleResetPassword = methods.handleSubmit(async (data) => {
        if (!email || !otp) {
            toast.showError('Missing required information');
            return;
        }

        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            methods.setError('confirmPassword', {
                type: 'manual',
                message: 'Passwords do not match',
            });
            return;
        }

        // Validate password length
        if (data.password.length < 8) {
            methods.setError('password', {
                type: 'manual',
                message: 'Password must be at least 8 characters',
            });
            return;
        }

        try {
            setIsLoading(true);
            const response = await updatePasswordWithOTP(email, otp, data.password);

            if (response.success) {
                toast.showSuccess('Password has been reset successfully');

                // Clear form
                methods.reset();

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.replace('/(auth)/login');
                }, 2000);
            } else {
                if (response.code === 'EXPIRED') {
                    toast.showError('Verification code has expired. Please request a new code.');
                    setTimeout(() => {
                        router.replace('/(auth)/forgot-password');
                    }, 2000);
                } else if (response.code === 'UNAUTHORIZED') {
                    toast.showError('Invalid verification code. Please try again.');
                    setTimeout(() => {
                        router.replace('/(auth)/forgot-password');
                    }, 2000);
                } else {
                    toast.showError(response.message || 'Failed to reset password. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error updating password:', error);
            toast.showError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <AuthLayout>
            <Text className="text-tc-primary text-[22px] font-medium mb-6">
                Create new password
            </Text>

            <FormProvider {...methods}>
                <View className="space-y-4 w-full">
                    <Text weight="regular" className="text-secondary-subtext text-sm mb-2">
                        Your identity has been verified. Please set your new password.
                    </Text>

                    <Input
                        label="New Password"
                        name="password"
                        placeholder="Enter new password"
                        secureTextEntry
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters',
                            },
                        }}
                    />

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        secureTextEntry
                        rules={{
                            required: 'Please confirm your password',
                            validate: (value) =>
                                value === methods.watch('password') || 'Passwords do not match',
                        }}
                    />

                    <Button
                        onPress={handleResetPassword}
                        disabled={!methods.formState.isValid || isLoading}
                        isLoading={isLoading}
                        className="mt-4"
                    >
                        Reset Password
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