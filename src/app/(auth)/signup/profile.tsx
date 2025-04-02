import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import Input from '@/components/global/input';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import BackButton from '@/components/global/back-button';
import { supabase } from '@/lib/supabase';
import { useForm, FormProvider } from 'react-hook-form';

type FormData = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password?: string;
};

export default function ProfileScreen() {
    // Get params from Google sign-up
    const { email, userId, fullName } = useLocalSearchParams();

    // Form state with React Hook Form
    const methods = useForm<FormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
        }
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Format date for display
    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}${getOrdinalSuffix(date.getDate())}`;
    };

    // Get ordinal suffix for date (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    // Handle date change
    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthdate(selectedDate);
        }
    };

    // Handle form submission
    const onSubmit = async (data: FormData) => {
        if (!birthdate) {
            // Show birthdate error
            return;
        }

        setIsLoading(true);

        try {
            // For users who signed up with Google
            if (userId) {
                const { error } = await supabase.auth.updateUser({
                    data: {
                        phone_number: data.phoneNumber,
                        first_name: data.firstName,
                        last_name: data.lastName,
                        birthdate: birthdate ? birthdate.toISOString() : null
                    }
                });

                if (error) throw error;
            }

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
                        <Text className="text-tc-primary text-[22px] font-medium mb-6">You're almost done!</Text>
                        <Text weight="regular" className="text-secondary-subtext text-sm mb-6">Let's get to meet you</Text>

                        <FormProvider {...methods}>
                            {/* Full Name */}
                            <View className="flex-row gap-4 mb-4">
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
                            <View className="mb-4">
                                <Input
                                    name="phoneNumber"
                                    label="Phone number"
                                    rules={['required', 'phone']}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {/* Date of Birth */}
                            <View className="mb-4">
                                <TouchableOpacity
                                    className={`h-14 border border-gray-200 rounded-lg px-4 justify-center mb-1`}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text className={birthdate ? 'text-black' : 'text-gray-400'}>
                                        {birthdate ? formatDate(birthdate) : 'Date of birth'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Password (only shown for non-OAuth users) */}
                            {!userId && (
                                <View className="mb-4">
                                    <Input
                                        name="password"
                                        label="Password"
                                        rules={['password']}
                                        secureTextEntry
                                    />
                                </View>
                            )}

                            {/* Submit button */}
                            <TouchableOpacity
                                onPress={methods.handleSubmit(onSubmit)}
                                className={`h-14 rounded-lg justify-center items-center mt-4 mb-6 ${isLoading ? 'bg-primary-300' : 'bg-primary-500'}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text weight="medium" className="text-white text-base">
                                        Complete Sign Up
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </FormProvider>
                    </MotiView>
                </ScrollView>

                <View className="absolute bottom-8 left-5 z-50">
                    <BackButton />
                </View>

                {/* Date Picker Modal for iOS */}
                {Platform.OS === 'ios' && (
                    <Modal
                        visible={showDatePicker}
                        transparent={true}
                        animationType="slide"
                    >
                        <View className="flex-1 justify-end bg-black/30">
                            <View className="bg-white p-4">
                                <View className="flex-row justify-between mb-4">
                                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                        <Text weight="medium" className="text-primary-500">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowDatePicker(false);
                                            if (!birthdate) {
                                                setBirthdate(new Date());
                                            }
                                        }}
                                    >
                                        <Text weight="medium" className="text-primary-500">Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={birthdate || new Date()}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    minimumDate={new Date(1900, 0, 1)}
                                />
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Date Picker for Android */}
                {Platform.OS === 'android' && showDatePicker && (
                    <DateTimePicker
                        value={birthdate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 