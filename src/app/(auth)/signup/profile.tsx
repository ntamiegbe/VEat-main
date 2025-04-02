import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '@/components/ui/Text';
import Input from '@/components/global/input';
import DatePicker from '@/components/global/date-picker';
import { supabase } from '@/lib/supabase';
import { useForm, FormProvider } from 'react-hook-form';
import { AuthLayout } from '@/components/layouts/auth-layout';
import CalendarIcon from '@assets/icons/CalendarIcon.svg';

type FormData = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password?: string;
    email: string;
};


export default function ProfileScreen() {
    // Get params from Google sign-up
    const { email, userId } = useLocalSearchParams();

    // Form state with React Hook Form
    const methods = useForm<FormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
            email: email as string,
        }
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Format date for display
    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    };

    // Handle date selection
    const handleDateSelect = (date: Date) => {
        setBirthdate(date);
    };

    // Handle form submission
    const onSubmit = async (data: FormData) => {
        if (!birthdate) {
            // Show birthdate error
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    phone_number: data.phoneNumber,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    birthdate: birthdate ? birthdate.toISOString() : null,
                    password: data.password
                }
            });

            if (error) throw error;

            // Navigate to app's main screen
            router.replace('/(app)');
        } catch (error: any) {
            console.error("Profile update error:", error);
            alert("Failed to update profile: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            continueButton={{
                onPress: methods.handleSubmit(onSubmit),
                disabled: isLoading,
                text: 'Continue'
            }}
        >
            <FormProvider {...methods}>
                <Text className="text-tc-primary text-[22px] font-medium mb-6">You're almost done!</Text>
                <Text weight="regular" className="text-secondary-subtext text-sm mb-6">Let's get to meet you</Text>

                {/* Full Name */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1">
                        <Input
                            name="firstName"
                            label="First name"
                            rules={['required']}
                        />
                    </View>

                    <View className="flex-1">
                        <Input
                            name="lastName"
                            label="Last name"
                        />
                    </View>
                </View>

                {/* Phone Number */}
                <View className="mb-6">
                    <Input
                        name="phoneNumber"
                        label="Phone number"
                        rules={['required', 'phone']}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Date of Birth */}
                <View className="mb-6">
                    <TouchableOpacity
                        className="h-14 border border-gray-200 rounded-lg px-4 flex-row items-center justify-between bg-white"
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Text className={birthdate ? 'text-gray-900' : 'text-gray-400'}>
                            {birthdate ? formatDate(birthdate) : 'Birthday'}
                        </Text>
                        <CalendarIcon />
                    </TouchableOpacity>
                </View>

                <View className="mb-6">
                    <Input
                        name="password"
                        label="Password"
                        rules={['password']}
                        secureTextEntry
                    />
                </View>

                {/* Submit button */}
                <View className="flex-1" />
            </FormProvider>

            {/* Date Picker */}
            <DatePicker
                value={birthdate}
                onChange={handleDateSelect}
                onClose={() => setShowDatePicker(false)}
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
                visible={showDatePicker}
            />
        </AuthLayout>
    );
} 