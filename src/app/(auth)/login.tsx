import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';
import Text from '@/components/ui/Text';
import Button from '@/components/global/button';
import Input from '@/components/global/input';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import GoogleIcon from '@assets/icons/GoogleIcon.svg';
import Constants from 'expo-constants';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { makeRedirectUri } from 'expo-auth-session';

// Register for OAuth callbacks
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [state, setState] = useState({
    isLoading: false,
    isGoogleLoading: false
  });
  const toast = useToast(4000);

  const methods = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange'
  });

  const { handleSubmit, formState: { isValid } } = methods;

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User is already logged in, redirect to home
        router.replace('/(app)');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  const handleLogin = handleSubmit(async (data) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.showSuccess('Successfully logged in');
      setTimeout(() => {
        router.replace('/(app)');
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.showError(error.message || 'Failed to log in');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  });

  const handleGoogleLogin = async () => {
    try {
      setState(prev => ({ ...prev, isGoogleLoading: true }));

      // Get the redirect URL using expo-auth-session
      const redirectUrl = makeRedirectUri({
        scheme: Array.isArray(Constants.expoConfig?.scheme) ? Constants.expoConfig.scheme[0] : Constants.expoConfig?.scheme || 'veat'
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL returned');

      // Open browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        // Parse the URL and extract tokens
        const parsedUrl = new URL(result.url);
        const hashParams = new URLSearchParams(parsedUrl.hash?.substring(1) || '');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (!accessToken) {
          throw new Error('No access token received');
        }

        // Set the session
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (sessionError) throw sessionError;

        // Get user profile
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (userData?.user) {
          // Check if user exists in users table
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userData.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // User needs to complete profile
            const userMetadata = userData.user.user_metadata || {};
            toast.showInfo('Please complete your profile');
            setTimeout(() => {
              router.replace({
                pathname: '/(auth)/signup/profile',
                params: {
                  userId: userData.user.id,
                  email: userData.user.email || '',
                  firstName: userMetadata.given_name || '',
                  lastName: userMetadata.family_name || '',
                  fullName: userMetadata.full_name || '',
                  phoneNumber: userMetadata.phone || ''
                }
              });
            }, 1000);
            return;
          }

          if (profileError) throw profileError;

          // Successful login
          toast.showSuccess('Successfully logged in with Google');
          setTimeout(() => {
            router.replace('/(app)');
          }, 1000);
        }
      } else {
        toast.showError('Google sign-in was cancelled');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.showError(error.message || 'Failed to log in with Google');
    } finally {
      setState(prev => ({ ...prev, isGoogleLoading: false }));
    }
  };

  return (
    <AuthLayout>
      <Text className="text-tc-primary text-2xl font-medium mb-6">Welcome back</Text>

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

        <Button
          onPress={handleLogin}
          disabled={!isValid}
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
        onPress={handleGoogleLogin}
        isLoading={state.isGoogleLoading}
        icon={<GoogleIcon />}
      >
        Continue with Google
      </Button>

      <View className="mt-4">
        <Text weight="regular" className="text-secondary-caption text-sm">
          Don't have an account?{' '}
          <Text
            weight="medium"
            className="text-tc-dark underline underline-offset-8 border-b border-tc-dark pb-0.5"
            onPress={() => router.push('/(auth)/signup/email')}
          >
            Sign up
          </Text>
        </Text>
      </View>

      {/* Toast component */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={toast.hideToast}
        type={toast.type}
      />
    </AuthLayout>
  );
};

export default Login;