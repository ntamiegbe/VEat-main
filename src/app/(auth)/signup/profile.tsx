import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    StyleSheet
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
    const { email } = useLocalSearchParams();

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

        // Password validation
        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            newErrors.password = 'Password must contain both letters and numbers';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle back
    const handleBack = () => {
        router.back();
    };

    // Handle form submission
    const handleSubmit = () => {
        if (validateForm()) {
            setIsLoading(true);

            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);
                // Navigate to home or onboarding
                router.replace('/(app)');
            }, 2000);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        style={styles.motiContainer}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleBack}>
                                <Ionicons name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text weight="regular" style={styles.headerText}>Complete your profile</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <Text weight="bold" style={styles.title}>You're almost done!</Text>
                        <Text weight="regular" style={styles.subtitle}>Let's get to meet you</Text>

                        {/* Full Name */}
                        <View style={styles.nameContainer}>
                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.firstName ? styles.errorInput : styles.normalInput
                                    ]}
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
                                    <Text weight="regular" style={styles.errorText}>
                                        {errors.firstName}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.lastName ? styles.errorInput : styles.normalInput
                                    ]}
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
                                    <Text weight="regular" style={styles.errorText}>
                                        {errors.lastName}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Email (disabled, passed from previous screen) */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={email as string}
                                editable={false}
                                placeholder="Email"
                                placeholderTextColor="#AAAAAA"
                            />
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.phoneNumber ? styles.errorInput : styles.normalInput
                                ]}
                                placeholder="Phone number"
                                value={phoneNumber}
                                onChangeText={handlePhoneNumberChange}
                                keyboardType="phone-pad"
                                returnKeyType="next"
                                placeholderTextColor="#AAAAAA"
                            />
                            {errors.phoneNumber ? (
                                <Text weight="regular" style={styles.errorText}>
                                    {errors.phoneNumber}
                                </Text>
                            ) : null}
                        </View>

                        {/* Date of Birth */}
                        <View style={styles.inputContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.datePickerButton,
                                    errors.birthdate ? styles.errorInput : styles.normalInput
                                ]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text
                                    weight="regular"
                                    style={!birthdate ? styles.placeholderText : styles.dateText}
                                >
                                    {birthdate ? formatDate(birthdate) : 'Birthday'}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color="#888888" />
                            </TouchableOpacity>

                            {errors.birthdate ? (
                                <Text weight="regular" style={styles.errorText}>
                                    {errors.birthdate}
                                </Text>
                            ) : null}

                            {showDatePicker && (
                                Platform.OS === 'ios' ? (
                                    <Modal
                                        transparent={true}
                                        animationType="slide"
                                        visible={showDatePicker}
                                    >
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.datePickerContainer}>
                                                <View style={styles.datePickerHeader}>
                                                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                        <Text weight="medium" style={styles.cancelText}>Cancel</Text>
                                                    </TouchableOpacity>
                                                    <Text weight="bold">Select Date</Text>
                                                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                        <Text weight="medium" style={styles.doneText}>Done</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <DateTimePicker
                                                    value={birthdate || new Date()}
                                                    mode="date"
                                                    display="spinner"
                                                    onChange={handleDateChange}
                                                    maximumDate={new Date()}
                                                    minimumDate={new Date(1940, 0, 1)}
                                                />
                                            </View>
                                        </View>
                                    </Modal>
                                ) : (
                                    <DateTimePicker
                                        value={birthdate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                        maximumDate={new Date()}
                                        minimumDate={new Date(1940, 0, 1)}
                                    />
                                )
                            )}
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[
                                        styles.passwordInput,
                                        errors.password ? styles.errorInput : {}
                                    ]}
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
                                    style={styles.passwordToggle}
                                    onPress={togglePasswordVisibility}
                                >
                                    <Text weight="medium" style={styles.showHideText}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {errors.password ? (
                                <Text weight="regular" style={styles.errorText}>
                                    {errors.password}
                                </Text>
                            ) : (
                                <Text weight="regular" style={styles.helperText}>
                                    At least 8 characters, containing a letter and a number
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isLoading ? styles.disabledButton : styles.activeButton
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text weight="medium" style={styles.buttonText}>
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>
                    </MotiView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    motiContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerText: {
        color: '#6B7280',
    },
    title: {
        fontSize: 24,
        marginBottom: 8,
    },
    subtitle: {
        color: '#6B7280',
        marginBottom: 32,
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 16,
    },
    inputWrap: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    normalInput: {
        borderColor: '#E5E7EB',
    },
    errorInput: {
        borderColor: '#EF4444',
    },
    disabledInput: {
        backgroundColor: '#F9FAFB',
        color: '#9CA3AF',
        borderColor: '#E5E7EB',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 8,
    },
    helperText: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 8,
    },
    datePickerButton: {
        height: 56,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    dateText: {
        color: '#1F2937',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    datePickerContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    cancelText: {
        color: '#6B7280',
    },
    doneText: {
        color: '#008751',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        height: 56,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        borderColor: '#E5E7EB',
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontSize: 16,
    },
    passwordToggle: {
        paddingHorizontal: 16,
    },
    showHideText: {
        color: '#008751',
    },
    submitButton: {
        height: 56,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    activeButton: {
        backgroundColor: '#008751',
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
    },
    buttonText: {
        color: '#FFFFFF',
    },
}); 