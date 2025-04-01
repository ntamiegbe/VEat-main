import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/global/back-button';

// OTP input length
const OTP_LENGTH = 4;
// Demo OTP code for testing
const DEMO_OTP = '1234';

export default function VerifyScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();

    // OTP state
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [verificationError, setVerificationError] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    // Refs for input fields
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Initialize countdown timer when component mounts
    useEffect(() => {
        startResendTimer();

        // Auto-fill demo OTP after a short delay for demonstration
        const autoFillTimeout = setTimeout(() => {
            // Fill in the demo code one by one
            DEMO_OTP.split('').forEach((digit, index) => {
                setTimeout(() => {
                    handleOtpChange(digit, index);
                }, index * 300);
            });
        }, 1500);

        return () => clearTimeout(autoFillTimeout);
    }, []);

    // Function to start the resend countdown timer
    const startResendTimer = () => {
        setResendCountdown(19); // 19 seconds countdown
        const timer = setInterval(() => {
            setResendCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);

        // Clean up timer on unmount
        return () => clearInterval(timer);
    };

    // Handle OTP input change
    const handleOtpChange = (text: string, index: number) => {
        // Only allow digits
        if (!/^\d*$/.test(text)) return;

        // Update the OTP array
        const newOtp = [...otp];
        newOtp[index] = text.slice(-1); // Only take the last character if multiple are pasted
        setOtp(newOtp);

        // Auto-advance to next input if a digit was entered
        if (text && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
            setCurrentIndex(index + 1);
        }

        // If all digits are filled, verify the OTP
        if (index === OTP_LENGTH - 1 && text) {
            verifyOtp([...newOtp.slice(0, OTP_LENGTH - 1), text].join(''));
        }
    };

    // Handle backspace press to go to previous input
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            setCurrentIndex(index - 1);
        }
    };

    // Verify the OTP
    const verifyOtp = (otpString: string = otp.join('')) => {
        if (otpString.length === OTP_LENGTH) {
            setIsLoading(true);
            setVerificationError(false);

            // Simulated API verification - accept the demo code
            setTimeout(() => {
                if (otpString === DEMO_OTP) {
                    setVerificationSuccess(true);
                    setVerificationError(false);
                    // Navigate to profile completion after a brief delay
                    setTimeout(() => {
                        router.push({
                            pathname: '/(auth)/signup/profile',
                            params: { email }
                        });
                    }, 1000);
                } else {
                    setVerificationSuccess(false);
                    setVerificationError(true);
                    Alert.alert('Invalid Code', 'For this demo, please use the code 1234');
                }
                setIsLoading(false);
            }, 1500);
        }
    };

    // Resend the OTP
    const handleResendOtp = () => {
        if (resendCountdown === 0) {
            // Reset OTP fields
            setOtp(Array(OTP_LENGTH).fill(''));
            setCurrentIndex(0);
            setVerificationError(false);

            // Start countdown again
            startResendTimer();

            // Focus first input
            inputRefs.current[0]?.focus();

            // Show alert that code has been resent
            Alert.alert('Demo Code', `For demonstration, use the code: ${DEMO_OTP}`);

            // Auto-fill demo OTP after a short delay for demonstration
            setTimeout(() => {
                DEMO_OTP.split('').forEach((digit, index) => {
                    setTimeout(() => {
                        handleOtpChange(digit, index);
                    }, index * 300);
                });
            }, 1500);
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
                        <Text weight="bold" className="text-2xl mb-3">Enter code</Text>

                        <Text weight="regular" className="text-gray-600 mb-8">
                            Enter the 4-digit code sent to you at:
                            {'\n'}{email}
                        </Text>

                        {verificationSuccess ? (
                            <View className="mb-8">
                                <View className="bg-green-500 flex-row items-center justify-between rounded-lg px-4 py-3 mb-4">
                                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                    <Text weight="medium" className="text-white mx-2 flex-1">Code verified</Text>
                                    <TouchableOpacity onPress={() => setVerificationSuccess(false)}>
                                        <Ionicons name="close" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row justify-center space-x-4">
                                    {otp.map((digit, index) => (
                                        <View
                                            key={index}
                                            className="w-14 h-14 rounded-lg bg-gray-100 border border-green-500 items-center justify-center"
                                        >
                                            <Text weight="bold" className="text-xl">{digit}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row justify-center space-x-4 mb-8">
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => (inputRefs.current[index] = ref)}
                                        className={`w-14 h-14 rounded-lg text-center text-xl ${digit ? 'bg-gray-100 border border-gray-300' : 'border border-gray-200'
                                            } ${currentIndex === index ? 'border-[#008751]' : ''
                                            } ${verificationError ? 'border-red-500' : ''
                                            }`}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                        caretHidden
                                    />
                                ))}
                            </View>
                        )}

                        <Text weight="regular" className="text-gray-600 text-center mb-6">
                            Tip: For this demo, use code 1234
                        </Text>

                        <TouchableOpacity
                            className="py-3 px-4"
                            onPress={handleResendOtp}
                            disabled={resendCountdown > 0 || isLoading}
                        >
                            <Text
                                weight="medium"
                                className={`text-center ${resendCountdown > 0 ? 'text-gray-400' : 'text-[#008751]'}`}
                            >
                                Resend code{resendCountdown > 0 ? ` in ${resendCountdown}s` : ''}
                            </Text>
                        </TouchableOpacity>

                        {isLoading && (
                            <View className="absolute inset-0 bg-white/80 items-center justify-center">
                                <ActivityIndicator size="large" color="#008751" />
                                <Text weight="medium" className="mt-4 text-gray-700">Verifying...</Text>
                            </View>
                        )}
                    </MotiView>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Back button with position controlled by parent */}
            <View className="absolute bottom-8 left-8 z-50">
                <BackButton />
            </View>
        </SafeAreaView>
    );
} 