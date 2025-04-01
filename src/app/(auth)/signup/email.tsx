import React, { useState } from 'react';
import { View, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import BackButton from '@/components/global/back-button';
import Button from '@/components/global/button';
import GoogleIcon from '@assets/icons/GoogleIcon.svg';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// Register for the authentication callback
WebBrowser.maybeCompleteAuthSession();

export default function EmailSignUpScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(true);

    // Validate email format
    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    // Handle email change
    const handleEmailChange = (text: string) => {
        setEmail(text);
        setIsValidEmail(text === '' || validateEmail(text));
    };

    // Continue with email
    const handleContinue = () => {
        if (email && validateEmail(email)) {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);
                router.push({
                    pathname: '/(auth)/signup/verify',
                    params: { email }
                });
            }, 1000);
        } else {
            setIsValidEmail(false);
        }
    };

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

            if (error) throw error;
            if (!data?.url) throw new Error('No authentication URL returned from Supabase');

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

                    if (error) throw error;

                    // Get user details
                    const { data: userData } = await supabase.auth.getUser();

                    if (userData?.user) {
                        // Extract user metadata
                        const email = userData.user.email;
                        const fullName = userData.user.user_metadata?.full_name || '';
                        const userId = userData.user.id;

                        // Try all navigation methods
                        try {
                            // Method 1: Use router.navigate
                            router.navigate({
                                pathname: '/(auth)/signup/profile',
                                params: {
                                    userId,
                                    email: email || '',
                                    fullName
                                }
                            });
                        } catch (err) {
                            // Method 2: Try direct linking
                            try {
                                const profileDeepLink = `${scheme}://signup/profile?userId=${userId}&email=${encodeURIComponent(email || '')}&fullName=${encodeURIComponent(fullName)}`;
                                await Linking.openURL(profileDeepLink);
                            } catch (linkErr) {
                                // Method 3: Last resort - hard replace
                                router.replace('/(auth)/signup/profile');
                            }
                        }
                    }
                } else {
                    Alert.alert('Login Failed', 'Could not authenticate with Google. Please try again.');
                }
            } else {
                Alert.alert('Signup cancelled or failed');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign up with Google');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        className="flex-1 px-6 pt-6"
                    >
                        <Text className="text-[22px] font-medium mb-8">What's your email address?</Text>

                        <View className="mb-8 z-10">
                            <TextInput
                                className={`h-14 border ${!isValidEmail ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 text-base`}
                                placeholder="Email"
                                value={email}
                                onChangeText={handleEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                returnKeyType="next"
                                placeholderTextColor="#AAAAAA"
                            />
                            {!isValidEmail && (
                                <Text weight="regular" className="text-red-500 text-xs mt-2">
                                    Please enter a valid email address
                                </Text>
                            )}
                        </View>

                        <Button
                            onPress={handleContinue}
                            disabled={!email || !isValidEmail}
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
                            Sign up with Google
                        </Button>

                        <View className="mt-4 mb-6">
                            <Text weight="regular" className="text-secondary-caption text-sm">
                                By continuing, you agree to our{' '}
                                <Text weight="medium" className="text-tc-dark underline underline-offset-8 border-b border-tc-dark pb-0.5">Terms of Service</Text>
                                {' '}and{' '}
                                <Text weight="medium" className="text-tc-dark underline underline-offset-8 border-b border-tc-dark pb-5">Privacy Policy</Text>
                            </Text>
                        </View>
                    </MotiView>
                </ScrollView>

                <View className="absolute bottom-8 left-5 z-50">
                    <BackButton />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 