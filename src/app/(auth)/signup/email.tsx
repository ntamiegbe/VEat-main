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
import { AuthResponse, AuthError } from '@supabase/supabase-js';

// Register for the authentication callback
WebBrowser.maybeCompleteAuthSession();

interface SignUpFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export default function EmailSignUpScreen() {
    const [state, setState] = useState({
        isGoogleLoading: false,
        isLoading: false
    });
    const toast = useToast(4000); // 4 seconds duration

    const methods = useForm<SignUpFormData>({
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onChange'
    });

    const { handleSubmit, formState, watch } = methods;
    const isFormValid = formState.isValid;

    const handleSignUp = handleSubmit(async (data) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            // Check if email already exists
            const { error: existingUserError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password
            });

            if (existingUserError) {
                if (existingUserError.message.includes('User already registered')) {
                    toast.showError('This email is already registered. Please log in instead.');
                    setTimeout(() => {
                        router.replace('/(auth)/login');
                    }, 2000);
                    return;
                }
                throw existingUserError;
            }

            // Send OTP email
            const success = await sendOTPEmail(data.email);
            if (!success) {
                throw new Error('Failed to send verification code');
            }

            // Show success message
            toast.showSuccess('Verification code sent to your email');

            // Navigate to verify screen
            setTimeout(() => {
                router.push({
                    pathname: '/(auth)/signup/verify',
                    params: {
                        email: data.email
                    }
                });
            }, 1000);

        } catch (error: any) {
            console.error('Signup error:', error);
            toast.showError(error.message || 'Failed to sign up. Please try again.');
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    });

    const handleGoogleSignUp = async () => {
        try {
            setState(prev => ({ ...prev, isGoogleLoading: true }));

            // Get app scheme
            const scheme = Constants.expoConfig?.scheme || 'veat';

            // Create a proper redirect URL using the app scheme
            const redirectUrl = `${scheme}://auth/callback`;

            // Start OAuth flow with Supabase
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;

            if (!data?.url) {
                throw new Error('No OAuth URL returned');
            }

            // Open browser for authentication
            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectUrl
            );

            if (result.type === 'success' && result.url) {
                // Extract tokens from URL
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
                        toast.showError(error.message || 'Failed to set session');
                        throw error;
                    }

                    // Get user details
                    const { data: userData, error: userError } = await supabase.auth.getUser();

                    if (userError) {
                        toast.showError(userError.message || 'Failed to fetch user data');
                        throw userError;
                    }

                    if (userData?.user) {
                        // Check if user exists in the users table
                        const { data: profileData, error: profileError } = await supabase
                            .from('users')
                            .select('phone_number')
                            .eq('id', userData.user.id)
                            .single();

                        // Handle user not found in users table
                        if (profileError && profileError.code === 'PGRST116') {
                            // User exists in Auth but not in users table
                            // Redirect to profile page to complete profile
                            toast.showInfo('Please complete your profile to continue');

                            // Extract any available user data from Google auth
                            const userMetadata = userData.user.user_metadata || {};
                            const fullName = userMetadata.full_name || '';
                            // Often Google provides name parts separately
                            const firstName = userMetadata.first_name || userMetadata.given_name || '';
                            const lastName = userMetadata.last_name || userMetadata.family_name || '';
                            const phoneNumber = userMetadata.phone || '';

                            setTimeout(() => {
                                router.replace({
                                    pathname: '/(auth)/signup/profile',
                                    params: {
                                        userId: userData.user.id,
                                        email: userData.user.email,
                                        firstName,
                                        lastName,
                                        fullName,
                                        phoneNumber
                                    }
                                });
                            }, 1000);
                            return;
                        } else if (profileError) {
                            // Other database errors
                            console.error('Error fetching user profile:', profileError);
                            toast.showError('Error verifying user information');
                            throw profileError;
                        }

                        // If phone number is missing, redirect to profile page
                        if (!profileData?.phone_number) {
                            toast.showInfo('Please complete your profile information');

                            setTimeout(() => {
                                router.replace({
                                    pathname: '/(auth)/signup/profile',
                                    params: {
                                        userId: userData.user.id,
                                        email: userData.user.email
                                    }
                                });
                            }, 1000);

                            return;
                        }

                        toast.showSuccess('Successfully signed in with Google');

                        // Navigate to app home
                        setTimeout(() => {
                            router.replace('/(app)');
                        }, 1000);
                    }
                } else {
                    toast.showError('Could not authenticate with Google. Please try again.');
                }
            } else {
                toast.showError('Google sign-up was cancelled');
            }
        } catch (error: any) {
            console.error('Google signup error:', error);
            toast.showError(error.message || 'Failed to sign up with Google');
        } finally {
            setState(prev => ({ ...prev, isGoogleLoading: false }));
        }
    };

    return (
        <AuthLayout>
            <Text className="text-tc-primary text-2xl font-medium mb-6">Sign up</Text>

            <FormProvider {...methods}>
                <View className="mb-4">
                    <Input
                        name="email"
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        rules={['required', 'email']}
                    />
                </View>

                <View className="mb-4">
                    <Input
                        name="password"
                        label="Password"
                        secureTextEntry
                        rules={['required', 'password']}
                    />
                </View>

                <View className="mb-4">
                    <Input
                        name="confirmPassword"
                        label="Confirm Password"
                        secureTextEntry
                        rules={['required', 'confirmPassword']}
                    />
                </View>

                <Button
                    onPress={handleSignUp}
                    disabled={!isFormValid}
                    isLoading={state.isLoading}
                >
                    Continue
                </Button>
            </FormProvider>

            <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text weight="regular" className="mx-4 text-gray-500 text-sm">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
            </View>

            <Button
                variant="outline"
                onPress={handleGoogleSignUp}
                isLoading={state.isGoogleLoading}
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