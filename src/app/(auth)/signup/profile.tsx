import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, FormProvider } from 'react-hook-form';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { supabase } from '@/lib/supabase';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';

type FormData = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    email: string;
};

export default function ProfileScreen() {
    // Get params from navigation
    const { email, userId, firstName: googleFirstName, lastName: googleLastName } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const googleCheckCompleted = useRef(false);
    const [birthdateError, setBirthdateError] = useState<string | null>(null);
    const toast = useToast(5000); // 5 seconds duration for toast messages

    // Form state with React Hook Form
    const methods = useForm<FormData>({
        defaultValues: {
            firstName: googleFirstName as string || '',
            lastName: googleLastName as string || '',
            phoneNumber: '',
            password: '',
            email: email as string,
        }
    });

    const { handleSubmit, formState: { errors }, setValue, watch } = methods;

    // Watch for password changes to clear errors
    const watchPassword = watch('password');

    // Clear password error when user types
    useEffect(() => {
        if (watchPassword && errors.password) {
            methods.clearErrors('password');
        }
    }, [watchPassword, errors.password, methods]);

    // Date state
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Clear birthdate error when date is selected
    useEffect(() => {
        if (birthdate && birthdateError) {
            setBirthdateError(null);
        }
    }, [birthdate, birthdateError]);

    // Check if user is from Google sign-in
    useEffect(() => {
        // Only run this once
        if (googleCheckCompleted.current) return;

        const checkGoogleUser = async () => {
            try {
                // Check if user has Google provider based on parameters
                if (googleFirstName || googleLastName) {
                    setIsGoogleUser(true);
                }

                // Mark as complete
                googleCheckCompleted.current = true;
            } catch (error) {
                console.error('Error checking Google user:', error);
                googleCheckCompleted.current = true;
            }
        };

        checkGoogleUser();
    }, [googleFirstName, googleLastName]);

    // Format date for display - memoized to prevent re-renders
    const formatDate = useCallback((date: Date | null) => {
        if (!date) return 'Select birthdate';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }, []);

    // Date picker handlers - memoized to prevent re-renders
    const handleOpenDatePicker = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    const handleCloseDatePicker = useCallback(() => {
        setShowDatePicker(false);
    }, []);

    const handleDateSelect = useCallback((date: Date) => {
        setBirthdate(date);
        // Don't close picker immediately, let user press "Done"
    }, []);

    // Handle Google user profile update
    const handleGoogleUserUpdate = async (data: FormData) => {
        try {
            // Get the current session
            const { data: sessionData } = await supabase.auth.getSession();

            if (!sessionData.session) {
                throw new Error('No active session for Google user');
            }

            // Update user metadata
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    phone_number: data.phoneNumber,
                    birthdate: birthdate?.toISOString(),
                    has_password: true,
                    full_name: `${data.firstName} ${data.lastName}`,
                    user_type: 'user'
                }
            });

            if (error) throw error;

            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user found');

            // Check if phone number is already in use
            const { data: existingPhoneUser, error: phoneCheckError } = await supabase
                .from('users')
                .select('id')
                .eq('phone_number', data.phoneNumber)
                .neq('id', user.id)
                .maybeSingle();

            if (phoneCheckError) throw phoneCheckError;
            if (existingPhoneUser) throw new Error('PHONE_NUMBER_EXISTS');

            // Create or update user profile
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: `${data.firstName} ${data.lastName}`,
                    phone_number: data.phoneNumber,
                    birthday: birthdate?.toISOString() || new Date().toISOString(),
                    user_type: 'user',
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            return true;
        } catch (error) {
            throw error;
        }
    };

    // Handle email user profile creation
    const handleEmailUserProfile = async (data: FormData) => {
        try {
            // Check if phone number is already in use
            const { data: existingPhoneUser, error: phoneCheckError } = await supabase
                .from('users')
                .select('id')
                .eq('phone_number', data.phoneNumber)
                .maybeSingle();

            if (phoneCheckError) throw phoneCheckError;
            if (existingPhoneUser) throw new Error('PHONE_NUMBER_EXISTS');

            // Create the user in auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        phone_number: data.phoneNumber,
                        birthdate: birthdate?.toISOString(),
                        has_password: true,
                        full_name: `${data.firstName} ${data.lastName}`,
                        user_type: 'user'
                    }
                }
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error('User account could not be created');

            // Create the user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: data.email,
                    full_name: `${data.firstName} ${data.lastName}`,
                    phone_number: data.phoneNumber,
                    birthday: birthdate?.toISOString() || new Date().toISOString(),
                    user_type: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            return true;
        } catch (error) {
            console.error("Email profile creation error:", error);
            throw error;
        }
    };

    // Handle form submission
    const onSubmit = useCallback(async (data: FormData) => {
        // Validate birthdate
        if (!birthdate) {
            setBirthdateError('Birthdate is required');
            return;
        }

        // Validate password
        if (!data.password) {
            methods.setError('password', {
                type: 'manual',
                message: 'Password is required'
            });
            return;
        }

        setIsLoading(true);

        try {
            let success = false;

            if (isGoogleUser) {
                // Handle Google user flow
                success = await handleGoogleUserUpdate(data);
            } else {
                // For email users, create account and profile
                success = await handleEmailUserProfile(data);
            }

            if (success) {
                // Show success toast
                toast.showSuccess('Profile created successfully');
                // Navigate to locations after successful profile creation
                router.replace('/location');
            } else {
                toast.showError('Your profile details were not saved. Please try again or contact support.');
            }
        } catch (error: any) {
            console.error('Profile update failed:', error);

            let errorMessage = 'There was an error saving your profile.';

            // Handle specific error cases
            if (error.message === 'PHONE_NUMBER_EXISTS') {
                errorMessage = 'This phone number is already registered with another account.';
            } else if (error.code === '23505') {
                if (error.details?.includes('phone_number')) {
                    errorMessage = 'This phone number is already registered with another account.';
                } else if (error.details?.includes('email')) {
                    errorMessage = 'This email is already registered with another account.';
                }
            } else if (error.code === 'PGRST116') {
                errorMessage = 'Unable to find your user record. Please try logging in again.';
            } else if (error.code === '23514') {
                errorMessage = 'One or more fields have invalid values. Please check your information.';
            } else if (error.message?.includes('User already registered')) {
                errorMessage = 'This email is already registered. Please try logging in instead.';
            } else if (error.message?.includes('No user found')) {
                errorMessage = 'Your session has expired. Please log in again.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            }

            // Show error toast with the specific message
            toast.showError(errorMessage + ' Please try again or contact support if the problem persists.');

            // If it's a session error, redirect to login
            if (error.message?.includes('No user found') || error.code === 'PGRST116') {
                setTimeout(() => {
                    router.replace('/(auth)/login');
                }, 2000);
            }
        } finally {
            setIsLoading(false);
        }
    }, [birthdate, isGoogleUser, methods, setBirthdateError, router, toast]);

    return (
        <AuthLayout
            continueButton={{
                onPress: handleSubmit(onSubmit),
                text: 'Continue',
                isLoading
            }}
        >
            <ScrollView>
                <FormProvider {...methods}>
                    <ProfileForm
                        form={methods}
                        isGoogleUser={isGoogleUser}
                        birthdate={birthdate}
                        showDatePicker={showDatePicker}
                        onDateSelect={handleDateSelect}
                        onOpenDatePicker={handleOpenDatePicker}
                        onCloseDatePicker={handleCloseDatePicker}
                        formatDate={formatDate}
                        birthdateError={birthdateError}
                    />
                </FormProvider>
            </ScrollView>

            {/* Toast component */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={toast.hideToast}
                type={toast.type}
            />
        </AuthLayout>
    );
} 