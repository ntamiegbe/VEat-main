import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { Snackbar } from 'react-native-paper';
import Text from '@/components/ui/Text';
import OTPInput from '@/components/ui/OTPInput';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/global/back-button';
import { ActivityIndicator } from 'react-native-paper';

// OTP input length
const OTP_LENGTH = 4;
// Demo OTP code for testing
const DEMO_OTP = '1234';

export default function VerifyScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();

    // OTP state
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [verificationError, setVerificationError] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);
    const [toast, setToast] = useState({ visible: false, message: '' });

    // Initialize countdown timer when component mounts
    useEffect(() => {
        startResendTimer();
        // Show initial toast for code sent
        setToast({
            visible: true,
            message: 'Verification code sent to your email'
        });
    }, []);

    // Function to start the resend countdown timer
    const startResendTimer = () => {
        setResendCountdown(60);
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

    // Handle OTP change from the OTPInput component
    const handleOtpChange = (newOtp: string[]) => {
        setOtp(newOtp);
    };

    // Handle OTP completion
    const handleOtpComplete = (otpString: string) => {
        verifyOtp(otpString);
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
                    setToast({
                        visible: true,
                        message: 'Invalid verification code. Please try again.'
                    });
                }
                setIsLoading(false);
            }, 1500);
        }
    };

    // Resend the OTP
    const handleResendOtp = async () => {
        if (resendCountdown === 0 && !isResending) {
            setIsResending(true);

            // Simulate API call with 1.5s delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Reset OTP fields
            setOtp(Array(OTP_LENGTH).fill(''));
            setVerificationError(false);

            // Start countdown again
            startResendTimer();

            // Show toast notification
            setToast({
                visible: true,
                message: 'New verification code sent to your email'
            });

            setIsResending(false);
        }
    };

    const renderResendButton = () => {
        if (isResending) {
            return (
                <ActivityIndicator size="small" color="#34AA87" />
            );
        }

        if (resendCountdown > 0) {
            return (
                <Text className="text-sm text-secondary-subtext">
                    Resend code<Text weight="bold"> in {resendCountdown}s</Text>
                </Text>
            );
        }

        return (
            <Text className="text-sm text-primary-main">
                Resend code
            </Text>
        );
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
                        <Text className="text-tc-primary text-[22px] font-medium mb-6">Enter code</Text>

                        <Text weight="regular" className="text-secondary-subtext text-sm mb-6">
                            Enter the 4-digit code sent to you at:
                            {'\n'}<Text weight="bold">{email}</Text>
                        </Text>

                        <View className="mb-6 flex-row items-center gap-4">
                            <OTPInput
                                length={OTP_LENGTH}
                                value={otp}
                                onChange={handleOtpChange}
                                onComplete={handleOtpComplete}
                                autoFocus={true}
                                isError={verificationError}
                                isLoading={isLoading}
                            />
                        </View>

                        <Text weight="regular" className="text-secondary-caption text-xs mb-4 leading-normal">
                            Tip: Be sure to check your inbox and spam folders
                        </Text>

                        <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={resendCountdown > 0 || isResending}
                        >
                            {renderResendButton()}
                        </TouchableOpacity>
                    </MotiView>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Back button with position controlled by parent */}
            <View className="absolute bottom-8 left-5 z-50">
                <BackButton />
            </View>

            {/* Toast Notification */}
            <Snackbar
                visible={toast.visible}
                onDismiss={() => setToast({ ...toast, visible: false })}
                duration={3000}
                style={{
                    backgroundColor: '#1F2937',
                    position: 'absolute',
                    bottom: 100,
                    left: 16,
                    right: 16,
                    borderRadius: 8
                }}
                wrapperStyle={{ position: 'absolute', bottom: 0 }}
            >
                <Text className="text-white text-sm" weight="medium">
                    {toast.message}
                </Text>
            </Snackbar>
        </SafeAreaView>
    );
} 