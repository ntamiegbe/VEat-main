import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '@/components/ui/Text';
import OTPInput from '@/components/ui/OTPInput';
import { ActivityIndicator } from 'react-native-paper';
import { AuthLayout } from '@/components/layouts/auth-layout';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { verifyPasswordResetOTP, requestPasswordResetOTP } from '@/lib/edgeFunctions';

// OTP input length
const OTP_LENGTH = 4;

export default function VerifyResetOTPScreen() {
    // Get email from params
    const { email } = useLocalSearchParams<{ email: string }>();

    if (!email) {
        // Redirect back to forgot password if no email
        router.replace('/(auth)/forgot-password');
    }

    const toast = useToast();

    // OTP state
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [verificationError, setVerificationError] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);

    // Start resend timer when component mounts
    useEffect(() => {
        startResendTimer();

        // Show initial toast about verification code
        toast.showToast('Enter the verification code sent to your email');
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
    const verifyOtp = async (otpString: string = otp.join('')) => {
        if (!email) return;

        if (otpString.length === OTP_LENGTH) {
            setIsLoading(true);
            setVerificationError(false);

            try {
                const response = await verifyPasswordResetOTP(email, otpString);

                if (response.success) {
                    setVerificationSuccess(true);
                    setVerificationError(false);
                    toast.showSuccess('Verification successful');

                    // Navigate to set new password screen after a brief delay
                    setTimeout(() => {
                        router.push({
                            pathname: '/(auth)/new-password',
                            params: {
                                email: email,
                                otp: otpString
                            }
                        });
                    }, 1000);
                } else {
                    setVerificationSuccess(false);
                    setVerificationError(true);

                    // Show specific error message based on the error code
                    if (response.code === 'EXPIRED') {
                        toast.showError('Verification code has expired. Please request a new one.');
                    } else if (response.code === 'UNAUTHORIZED') {
                        toast.showError('Invalid verification code. Please try again.');
                    } else {
                        toast.showError(response.message || 'Verification failed. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Error verifying OTP:', error);
                setVerificationSuccess(false);
                setVerificationError(true);
                toast.showError('Failed to verify code. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Resend the OTP
    const handleResendOtp = async () => {
        if (!email) return;

        if (resendCountdown === 0 && !isResending) {
            setIsResending(true);

            try {
                const response = await requestPasswordResetOTP(email);

                if (response.success) {
                    // Reset OTP fields
                    setOtp(Array(OTP_LENGTH).fill(''));
                    setVerificationError(false);

                    // Start countdown again
                    startResendTimer();

                    // Show success notification
                    toast.showSuccess('New verification code sent to your email');
                } else {
                    if (response.code === 'RATE_LIMITED') {
                        toast.showError('Too many attempts. Please try again later.');
                    } else {
                        toast.showError(response.message || 'Failed to resend verification code');
                    }
                }
            } catch (error) {
                console.error('Error resending verification code:', error);
                toast.showError('Failed to resend verification code');
            } finally {
                setIsResending(false);
            }
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
            <Text className="text-tc-primary text-[22px] font-medium mb-6">Verify your email</Text>

            <Text weight="regular" className="text-secondary-subtext text-sm mb-6">
                Enter the 4-digit code sent to:
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

            <View className="items-center pt-6">
                <TouchableOpacity onPress={() => router.replace('/(auth)/forgot-password')}>
                    <Text weight="medium" className="text-primary-main text-sm">
                        Back to forgot password
                    </Text>
                </TouchableOpacity>
            </View>

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