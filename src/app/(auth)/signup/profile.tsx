import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, FormProvider } from 'react-hook-form';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { supabase } from '@/lib/supabase';
import { ProfileForm } from '@/components/auth/ProfileForm';

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

    // Direct database insert function - With RLS disabled
    const insertUserProfile = async (userId: string, profileData: any) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    full_name: profileData.fullName,
                    email: profileData.email,
                    phone_number: profileData.phoneNumber,
                    birthday: profileData.birthday,
                    user_type: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (error) {
                console.error("Insert error:", error);
                throw error;
            }

            return !!data;
        } catch (error) {
            console.error("Profile error:", error);
            throw error;
        }
    };

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
                    user_type: 'customer'
                }
            });

            if (error) throw error;

            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user found');

            // Try to insert/update directly for development
            const success = await insertUserProfile(user.id, {
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phoneNumber: data.phoneNumber,
                birthday: birthdate?.toISOString() || new Date().toISOString(),
                userType: 'customer'
            });

            if (!success) {
                throw new Error('Failed to create or update user profile');
            }

            return true;
        } catch (error) {
            throw error;
        }
    };

    // Handle email user profile creation
    const handleEmailUserProfile = async (data: FormData) => {
        try {
            // Create a proper UUID for the temporary user
            // We'll need to link this to the auth user later
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
                        user_type: 'customer'
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (!authData.user) {
                throw new Error('User account could not be created');
            }

            // Use the actual UUID from the auth user
            console.log("Email user created:", authData.user.id);

            // Insert into users table directly (possible with RLS disabled)
            const success = await insertUserProfile(authData.user.id, {
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phoneNumber: data.phoneNumber,
                birthday: birthdate?.toISOString() || new Date().toISOString()
            });

            if (!success) {
                throw new Error('Failed to create user profile');
            }

            console.log("User profile created successfully");

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
                // Navigate to locations after successful profile creation
                router.replace('/(auth)/signup/locations');
            } else {
                Alert.alert(
                    'Profile Not Saved',
                    'Your profile details were not saved. Please try again or contact support.'
                );
            }
        } catch (error: any) {
            console.error('Profile update failed:', error);

            // Extract the most useful error message
            let errorMessage = error.message || 'There was an error saving your profile.';

            // Check for specific database constraint errors
            if (errorMessage.includes('check constraint')) {
                errorMessage = 'One or more fields have invalid values. Please check your information.';
            } else if (errorMessage.includes('violates unique constraint')) {
                errorMessage = 'An account with this information already exists.';
            } else if (errorMessage.includes('invalid input syntax for type uuid')) {
                errorMessage = 'Internal error with user identification. Please try again.';
            }

            Alert.alert(
                'Profile Update Failed',
                errorMessage + ' Please try again or contact support.'
            );
        } finally {
            setIsLoading(false);
        }
    }, [birthdate, isGoogleUser, methods, setBirthdateError, router]);

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
        </AuthLayout>
    );
} 