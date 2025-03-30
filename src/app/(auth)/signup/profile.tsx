import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import { typography } from '@/utils/typography';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
    const router = useRouter();

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
    const [currentStep, setCurrentStep] = useState(1); // 1: Name, 2: Phone, 3: DOB, 4: Password

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

    // Validate fields based on current step
    const validateCurrentStep = () => {
        const newErrors = { ...errors };
        let valid = true;

        switch (currentStep) {
            case 1: // Name validation
                if (!firstName.trim()) {
                    newErrors.firstName = 'First name is required';
                    valid = false;
                }
                if (!lastName.trim()) {
                    newErrors.lastName = 'Last name is required';
                    valid = false;
                }
                break;

            case 2: // Phone validation
                if (!phoneNumber || phoneNumber.length < 10) {
                    newErrors.phoneNumber = 'Please enter a valid phone number';
                    valid = false;
                }
                break;

            case 3: // Birthdate validation
                if (!birthdate) {
                    newErrors.birthdate = 'Please select your date of birth';
                    valid = false;
                }
                break;

            case 4: // Password validation
                if (password.length < 8) {
                    newErrors.password = 'Password must be at least 8 characters';
                    valid = false;
                } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
                    newErrors.password = 'Password must contain both letters and numbers';
                    valid = false;
                }
                break;
        }

        setErrors(newErrors);
        return valid;
    };

    // Handle next step
    const handleNext = () => {
        if (validateCurrentStep()) {
            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit();
            }
        }
    };

    // Handle back
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    // Handle form submission
    const handleSubmit = () => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to home or onboarding
            router.replace('/(app)');
        }, 2000);
    };

    // Render the current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, errors.firstName ? styles.inputError : {}]}
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

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, errors.lastName ? styles.inputError : {}]}
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
                    </>
                );

            case 2:
                return (
                    <>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, errors.phoneNumber ? styles.inputError : {}]}
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
                    </>
                );

            case 3:
                return (
                    <>
                        <TouchableOpacity
                            style={[styles.input, styles.dateInput, errors.birthdate ? styles.inputError : {}]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text
                                weight="regular"
                                style={[
                                    styles.dateInputText,
                                    !birthdate && styles.placeholderText
                                ]}
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
                                    <View style={styles.modalContainer}>
                                        <View style={styles.datePickerContainer}>
                                            <View style={styles.datePickerHeader}>
                                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                    <Text weight="medium" style={styles.datePickerCancel}>Cancel</Text>
                                                </TouchableOpacity>
                                                <Text weight="bold" style={styles.datePickerTitle}>Select Date</Text>
                                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                    <Text weight="medium" style={styles.datePickerDone}>Done</Text>
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
                    </>
                );

            case 4:
                return (
                    <>
                        <View style={styles.inputContainer}>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : {}]}
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
                                    <Text weight="medium" style={styles.passwordToggleText}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {errors.password ? (
                                <Text weight="regular" style={styles.errorText}>
                                    {errors.password}
                                </Text>
                            ) : (
                                <Text weight="regular" style={styles.passwordHint}>
                                    At least 8 characters, containing a letter and a number
                                </Text>
                            )}
                        </View>
                    </>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        style={styles.formContainer}
                    >
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>

                        <Text weight="bold" style={styles.title}>You're almost done!</Text>
                        <Text weight="regular" style={styles.subtitle}>Let's get to meet you</Text>

                        {renderStepContent()}

                        <TouchableOpacity
                            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
                            onPress={handleNext}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text weight="medium" style={styles.nextButtonText}>
                                    {currentStep === 4 ? 'Create Account' : 'Next'}
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
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    formContainer: {
        flex: 1,
    },
    backButton: {
        marginBottom: 24,
    },
    title: {
        ...typography.h2,
        marginBottom: 8,
    },
    subtitle: {
        ...typography.bodyMedium,
        color: '#666666',
        marginBottom: 32,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    inputContainer: {
        flex: 1,
        marginBottom: 24,
    },
    input: {
        ...typography.bodyLarge,
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        ...typography.caption,
        color: '#FF3B30',
        marginTop: 8,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateInputText: {
        color: '#333333',
    },
    placeholderText: {
        color: '#AAAAAA',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        height: 56,
        backgroundColor: '#FFFFFF',
    },
    passwordInput: {
        flex: 1,
        borderWidth: 0,
        height: '100%',
    },
    passwordToggle: {
        paddingHorizontal: 16,
    },
    passwordToggleText: {
        color: '#008751',
    },
    passwordHint: {
        ...typography.caption,
        color: '#888888',
        marginTop: 8,
    },
    nextButton: {
        height: 56,
        backgroundColor: '#008751',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
    },
    nextButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        borderBottomColor: '#E5E5E5',
    },
    datePickerTitle: {
        ...typography.bodyLarge,
    },
    datePickerCancel: {
        ...typography.bodyMedium,
        color: '#888888',
    },
    datePickerDone: {
        ...typography.bodyMedium,
        color: '#008751',
    },
}); 