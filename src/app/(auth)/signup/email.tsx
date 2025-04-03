import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import Text from '@/components/ui/Text';
import Button from '@/components/global/button';
import Input from '@/components/global/input';
import GoogleIcon from '@assets/icons/GoogleIcon.svg';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { sendOTPEmail } from '@/lib/email';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';

// Register for the authentication callback
WebBrowser.maybeCompleteAuthSession();

export default function EmailSignUpScreen() {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast(4000); // 4 seconds duration

    const methods = useForm({
        defaultValues: {
            email: '',
        },
        mode: 'onChange',
    });

    const { handleSubmit, watch, formState } = methods;
    const email = watch('email');
    const isFormValid = formState.isValid;

    // Continue with email
    const handleContinue = handleSubmit(async (data) => {
        try {
            setIsLoading(true);

            // Validate email format
            if (!/^\S+@\S+\.\S+$/.test(data.email)) {
                toast.showToast('Please enter a valid email address');
                return;
            }

            // Generate OTP - Ensure exactly 4 digits (1000-9999)
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            try {
                // Store OTP in Supabase for verification
                const { error: otpError } = await supabase
                    .from('email_verification')
                    .insert({
                        email: data.email,
                        otp,
                        created_at: new Date().toISOString(),
                        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes expiry
                    });

                if (otpError) {
                    console.error('OTP storage error:', otpError);
                    toast.showToast(otpError.message || 'Failed to store verification code');
                    throw otpError;
                }

                // Send OTP via Zeptomail
                await sendOTPEmail(data.email);

                toast.showToast('Verification code sent to your email');

                // Navigate to verification screen
                router.push({
                    pathname: '/(auth)/signup/verify',
                    params: {
                        email: data.email
                    }
                });
            } catch (emailError: any) {
                toast.showToast('Could not send verification code. Please try again later.');
                throw emailError;
            }
        } catch (error: any) {
            console.error('Email signup error:', error);
            toast.showToast(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    });

    // Handle Google Sign Up
    const handleGoogleSignUp = async () => {
        try {
            setIsGoogleLoading(true);

            // Get app scheme
            const scheme = Constants.expoConfig?.scheme || 'veat';

            // Create a proper redirect URL using the app scheme
            const redirectUrl = `${scheme}://auth/callback`;

            // Start OAuth flow with Supabase
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: {
                        prompt: 'consent',
                        access_type: 'offline'
                    }
                }
            });

            if (error) {
                toast.showToast(error.message || 'Failed to initialize Google sign in');
                throw error;
            }

            if (!data?.url) {
                toast.showToast('No authentication URL returned from Supabase');
                throw new Error('No authentication URL returned from Supabase');
            }

            // Open auth session in browser - this is where the redirect happens
            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectUrl,
                { showInRecents: true }
            );

            // DIRECT HANDLING: Extract tokens directly from the result URL
            if (result.type === 'success' && result.url) {
                // Parse tokens from URL (usually in hash fragment)
                let accessToken = '';
                let refreshToken = '';

                if (result.url.includes('#')) {
                    const hashPart = result.url.split('#')[1];
                    const hashParams = new URLSearchParams(hashPart);
                    accessToken = hashParams.get('access_token') || '';
                    refreshToken = hashParams.get('refresh_token') || '';
                }

                if (accessToken) {
                    // Set the session with the tokens
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) {
                        toast.showToast(error.message || 'Failed to set session');
                        throw error;
                    }

                    // Get user details
                    const { data: userData, error: userError } = await supabase.auth.getUser();

                    if (userError) {
                        toast.showToast(userError.message || 'Failed to fetch user data');
                        throw userError;
                    }

                    if (userData?.user) {
                        // Extract user metadata
                        const email = userData.user.email;
                        const fullName = userData.user.user_metadata?.full_name || '';
                        const userId = userData.user.id;

                        // Split full name into first and last name
                        const nameParts = fullName.split(' ');
                        const firstName = nameParts[0] || '';
                        const lastName = nameParts.slice(1).join(' ') || '';

                        toast.showToast('Successfully signed in with Google');

                        // Redirect to profile completion with separated names
                        router.replace({
                            pathname: '/(auth)/signup/profile',
                            params: {
                                email,
                                userId,
                                firstName,
                                lastName
                            }
                        });
                    }
                } else {
                    toast.showToast('Could not authenticate with Google. Please try again.');
                }
            } else {
                toast.showToast('Google sign-up was cancelled');
            }
        } catch (error: any) {
            console.error('Google signup error:', error);
            toast.showToast(error.message || 'Failed to sign up with Google');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Text className="text-tc-primary text-[22px] font-medium mb-8">Create your account</Text>

            <FormProvider {...methods}>
                <View className="mb-8 z-10">
                    <Input
                        name="email"
                        label="Email"
                        type="email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        rules={['required', 'email']}
                    />
                </View>
            </FormProvider>

            <Button
                onPress={handleContinue}
                disabled={!isFormValid}
                isLoading={isLoading}
            >
                Continue
            </Button>

            <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text weight="regular" className="mx-4 text-gray-500 text-sm">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
            </View>

            <Button
                variant="outline"
                onPress={handleGoogleSignUp}
                isLoading={isGoogleLoading}
                icon={<GoogleIcon />}
            >
                Continue with Google
            </Button>

            <View className="mt-4 mb-6">
                <Text weight="regular" className="text-secondary-caption text-sm">
                    By continuing, you agree to our{' '}
                    <Text weight="medium" className="text-tc-dark underline underline-offset-8 border-b border-tc-dark pb-0.5">Terms of Service</Text>
                    {' '}and{' '}
                    <Text weight="medium" className="text-tc-dark underline underline-offset-8 border-b border-tc-dark pb-5">Privacy Policy</Text>
                </Text>
            </View>

            {/* Toast component */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={toast.hideToast}
            />
        </AuthLayout>
    );
} 