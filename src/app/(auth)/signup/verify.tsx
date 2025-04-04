import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '@/components/ui/Text';
import OTPInput from '@/components/ui/OTPInput';
import { ActivityIndicator } from 'react-native-paper';
import { AuthLayout } from '@/components/layouts/auth-layout';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { Ionicons } from '@expo/vector-icons';

// OTP input length
const OTP_LENGTH = 4;
// Demo OTP code for testing
const DEMO_OTP = '1234';

export default function VerifyScreen() {
    // Get email from params
    const { email } = useLocalSearchParams<{ email: string }>();

    const toast = useToast();

    // OTP state
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [verificationError, setVerificationError] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);

    // Initialize countdown timer when component mounts
    useEffect(() => {
        startResendTimer();
        // Show initial toast for code sent
        toast.showToast('Verification code sent to your email');
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
                    toast.showSuccess('Verification successful');
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
                    toast.showError('Invalid verification code. Please try again.');
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
            toast.showSuccess('New verification code sent to your email');

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
        <AuthLayout>
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

            {/* Toast Component */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={toast.hideToast}
                icon={toast.icon}
                type={toast.type}
            />
        </AuthLayout>
    );
} 