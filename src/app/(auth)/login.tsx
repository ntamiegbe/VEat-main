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

// Register for OAuth callbacks
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const toast = useToast(5000);
  const methods = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange',
  });

  const { handleSubmit, formState } = methods;
  const isFormValid = formState.isValid;

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

  // Handle email/password login
  const handleLogin = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;

      // Check if the user has a phone number
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('phone_number, full_name')
        .eq('id', authData.user.id)
        .single();

      // Handle user not found in users table
      if (userError && userError.code === 'PGRST116') {
        // User exists in Auth but not in users table
        // Redirect to profile page to complete profile
        toast.showInfo('Please complete your profile to continue');

        // Get as much user info as possible from Auth
        const { data: authUser } = await supabase.auth.getUser();
        const userMetadata = authUser?.user?.user_metadata || {};

        setTimeout(() => {
          router.replace({
            pathname: '/(auth)/signup/profile',
            params: {
              userId: authData.user.id,
              email: data.email,
              firstName: userMetadata.first_name || userMetadata.given_name || '',
              lastName: userMetadata.last_name || userMetadata.family_name || '',
              fullName: userMetadata.full_name || authData.user.user_metadata?.full_name || '',
              phoneNumber: userMetadata.phone || '',
              fromLogin: 'true'
            }
          });
        }, 1000);
        return;
      } else if (userError) {
        // Other database errors
        console.error('Error fetching user profile:', userError);
        toast.showError('Error verifying user information');
        throw userError;
      }

      // If phone number is missing, redirect to profile page
      if (!userData?.phone_number) {
        toast.showInfo('Please complete your profile information');

        // Navigate to profile page with user ID and any existing data
        setTimeout(() => {
          router.replace({
            pathname: '/(auth)/signup/profile',
            params: {
              userId: authData.user.id,
              email: data.email,
              fullName: userData.full_name || '',
              phoneNumber: '',
              fromLogin: 'true'
            }
          });
        }, 1000);

        return;
      }

      toast.showSuccess('Successfully logged in');

      // Navigate after a brief delay
      setTimeout(() => {
        router.replace('/(app)');
      }, 1000);

    } catch (error: any) {
      console.error('Login error:', error);
      toast.showError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  });

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
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
        toast.showError(error.message || 'Failed to initialize Google sign in');
        throw error;
      }

      if (!data?.url) {
        toast.showError('No authentication URL returned from Supabase');
        throw new Error('No authentication URL returned from Supabase');
      }

      // Open auth session in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
        { showInRecents: true }
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
            // Check if user exists in the users table with a phone number
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('phone_number, full_name')
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
                    phoneNumber,
                    fromLogin: 'true'
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
            if (!profileData.phone_number) {
              toast.showInfo('Please complete your profile information');

              // Navigate to profile page with user details including any existing data
              setTimeout(() => {
                router.replace({
                  pathname: '/(auth)/signup/profile',
                  params: {
                    userId: userData.user.id,
                    email: userData.user.email,
                    fullName: profileData.full_name || '',
                    phoneNumber: '',
                    fromLogin: 'true'
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
        toast.showError('Google sign-in was cancelled');
      }
    } catch (error: any) {
      console.error('Google signin error:', error);
      toast.showError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Text className="text-tc-primary text-2xl font-medium mb-6">Log in</Text>

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

        <View className="mb-2">
          <Input
            name="password"
            label="Password"
            secureTextEntry
            rules={['required']}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          className="mt-2 self-end"
        >
          <Text weight="medium" className="text-primary-main text-sm">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          onPress={handleLogin}
          disabled={!isFormValid}
          isLoading={isLoading}
        >
          Log in
        </Button>
      </FormProvider>

      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-200" />
        <Text weight="regular" className="mx-4 text-gray-500 text-sm">or</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      <Button
        variant="outline"
        onPress={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        icon={<GoogleIcon />}
      >
        Continue with Google
      </Button>

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