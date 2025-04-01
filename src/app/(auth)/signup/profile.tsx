import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
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
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import BackButton from '@/components/global/back-button';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
    // Get params from Google sign-up
    const { email, userId, fullName } = useLocalSearchParams();

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [birthdate, setBirthdate] = useState<Date | null>(null);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form validation
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        birthdate: '',
        password: ''
    });

    // Parse the full name from Google sign-up if available
    useEffect(() => {
        if (fullName) {
            const nameParts = String(fullName).split(' ');
            if (nameParts.length > 0) {
                setFirstName(nameParts[0]);

                // Join the rest as last name if there are multiple parts
                if (nameParts.length > 1) {
                    setLastName(nameParts.slice(1).join(' '));
                }
            }
        }
    }, [fullName]);

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
            setErrors({ ...errors, birthdate: '' });
        }
    };

    // Handle phone number formatting
    const formatPhoneNumber = (text: string) => {
        // Remove all non-digits
        const cleaned = text.replace(/\D/g, '');

        // Add the country code if not already there
        let formatted = cleaned;
        if (cleaned.length > 0) {
            if (!cleaned.startsWith('+')) {
                if (cleaned.startsWith('234')) {
                    formatted = `+${cleaned}`;
                } else if (cleaned.startsWith('0')) {
                    formatted = `+234${cleaned.substring(1)}`;
                } else {
                    formatted = `+234${cleaned}`;
                }
            }
        }

        return formatted;
    };

    // Handle phone number input
    const handlePhoneNumberChange = (text: string) => {
        const formattedNumber = formatPhoneNumber(text);
        setPhoneNumber(formattedNumber);
        setErrors({ ...errors, phoneNumber: '' });
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Validate all fields before submission
    const validateForm = () => {
        const newErrors = { ...errors };
        let isValid = true;

        // First name validation
        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        // Last name validation
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        // Phone validation
        if (!phoneNumber || phoneNumber.length < 10) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
            isValid = false;
        }

        // Birthdate validation
        if (!birthdate) {
            newErrors.birthdate = 'Please select your date of birth';
            isValid = false;
        }

        // Password validation - only required for non-OAuth users
        if (!userId) {
            if (password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
                isValid = false;
            } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
                newErrors.password = 'Password must contain both letters and numbers';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (validateForm()) {
            setIsLoading(true);

            try {
                // For users who signed up with Google
                if (userId) {
                    // Update user metadata in Supabase
                    const { error } = await supabase.auth.updateUser({
                        data: {
                            phone_number: phoneNumber,
                            first_name: firstName,
                            last_name: lastName,
                            birthdate: birthdate ? birthdate.toISOString() : null
                        }
                    });

                    if (error) throw error;
                } else {
                    // This would be for email/password signup flow
                    // You can implement this based on your authentication flow
                }

                // Navigate to app's main screen
                router.replace('/(app)');
            } catch (error: any) {
                console.error("Profile update error:", error);
                alert("Failed to update profile: " + error.message);
            } finally {
                setIsLoading(false);
            }
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
                        <Text weight="bold" className="text-2xl mb-2">You're almost done!</Text>
                        <Text weight="regular" className="text-gray-600 mb-6">Let's get to meet you</Text>

                        {/* Full Name */}
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <TextInput
                                    className={`h-14 border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 text-base mb-1`}
                                    placeholder="First name"
                                    value={firstName}
                                    onChangeText={(text) => {
                                        setFirstName(text);
                                        setErrors({ ...errors, firstName: '' });
                                    }}
                                    returnKeyType="next"
                                    placeholderTextColor="#AAAAAA"
                                />
                                {errors.firstName ? (
                                    <Text weight="regular" className="text-red-500 text-xs">
                                        {errors.firstName}
                                    </Text>
                                ) : null}
                            </View>

                            <View className="flex-1">
                                <TextInput
                                    className={`h-14 border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 text-base mb-1`}
                                    placeholder="Last name"
                                    value={lastName}
                                    onChangeText={(text) => {
                                        setLastName(text);
                                        setErrors({ ...errors, lastName: '' });
                                    }}
                                    returnKeyType="next"
                                    placeholderTextColor="#AAAAAA"
                                />
                                {errors.lastName ? (
                                    <Text weight="regular" className="text-red-500 text-xs">
                                        {errors.lastName}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Email field (disabled) */}
                        <View className="mb-4">
                            <TextInput
                                className="h-14 border border-gray-200 rounded-lg px-4 text-base bg-gray-50 text-gray-500"
                                value={email as string}
                                editable={false}
                            />
                        </View>

                        {/* Phone Number */}
                        <View className="mb-4">
                            <TextInput
                                className={`h-14 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 text-base mb-1`}
                                placeholder="Phone number"
                                value={phoneNumber}
                                onChangeText={handlePhoneNumberChange}
                                keyboardType="phone-pad"
                                returnKeyType="next"
                                placeholderTextColor="#AAAAAA"
                            />
                            {errors.phoneNumber ? (
                                <Text weight="regular" className="text-red-500 text-xs">
                                    {errors.phoneNumber}
                                </Text>
                            ) : null}
                        </View>

                        {/* Date of Birth */}
                        <View className="mb-4">
                            <TouchableOpacity
                                className={`h-14 border ${errors.birthdate ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 justify-center mb-1`}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text className={birthdate ? 'text-black' : 'text-gray-400'}>
                                    {birthdate ? formatDate(birthdate) : 'Date of birth'}
                                </Text>
                            </TouchableOpacity>
                            {errors.birthdate ? (
                                <Text weight="regular" className="text-red-500 text-xs">
                                    {errors.birthdate}
                                </Text>
                            ) : null}
                        </View>

                        {/* Password (only shown for non-OAuth users) */}
                        {!userId && (
                            <View className="mb-4">
                                <View className="relative">
                                    <TextInput
                                        className={`h-14 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 text-base mb-1 pr-12`}
                                        placeholder="Password"
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            setErrors({ ...errors, password: '' });
                                        }}
                                        secureTextEntry={!showPassword}
                                        returnKeyType="done"
                                        placeholderTextColor="#AAAAAA"
                                    />
                                    <TouchableOpacity
                                        onPress={togglePasswordVisibility}
                                        className="absolute right-3 h-full justify-center"
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={24}
                                            color="#AAAAAA"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password ? (
                                    <Text weight="regular" className="text-red-500 text-xs">
                                        {errors.password}
                                    </Text>
                                ) : null}
                            </View>
                        )}

                        {/* Submit button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
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