import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';

// OTP input length
const OTP_LENGTH = 4;
// Demo OTP code for testing
const DEMO_OTP = '1234';

export default function VerifyScreen() {
    const router = useRouter();
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

    // Go back
    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
                style={styles.content}
            >
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <Text weight="bold" style={styles.title}>Enter code</Text>

                <Text weight="regular" style={styles.subtitle}>
                    Enter the 4-digit code sent to you at:
                    {'\n'}{email}
                </Text>

                {verificationSuccess ? (
                    <View style={styles.successContainer}>
                        <View style={styles.successBanner}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text weight="medium" style={styles.successText}>Code sent</Text>
                            <TouchableOpacity onPress={() => setVerificationSuccess(false)}>
                                <Ionicons name="close" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <View
                                    key={index}
                                    style={styles.otpBoxFilled}
                                >
                                    <Text weight="bold" style={styles.otpText}>{digit}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[
                                    styles.otpBox,
                                    digit ? styles.otpBoxFilled : {},
                                    currentIndex === index ? styles.otpBoxActive : {},
                                    verificationError ? styles.otpBoxError : {},
                                ]}
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

                <Text weight="regular" style={styles.tipText}>
                    Tip: For this demo, use code 1234
                </Text>

                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendOtp}
                    disabled={resendCountdown > 0 || isLoading}
                >
                    <Text
                        weight="medium"
                        style={resendCountdown > 0 ? styles.resendTextDisabled : styles.resendText}
                    >
                        Resend code{resendCountdown > 0 ? ` in ${resendCountdown}s` : ''}
                    </Text>
                </TouchableOpacity>

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#008751" />
                        <Text weight="medium" style={styles.loadingText}>Verifying...</Text>
                    </View>
                )}
            </MotiView>
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
        padding: 24,
    },
    backButton: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 32,
        lineHeight: 24,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    otpBox: {
        width: 70,
        height: 70,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    otpBoxActive: {
        borderColor: '#008751',
        borderWidth: 2,
    },
    otpBoxFilled: {
        width: 70,
        height: 70,
        borderWidth: 1,
        borderColor: '#008751',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6FBF9',
    },
    otpBoxError: {
        borderColor: '#FF3B30',
    },
    otpText: {
        fontSize: 24,
        color: '#333333',
    },
    tipText: {
        fontSize: 12,
        color: '#888888',
        marginBottom: 20,
    },
    resendButton: {
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    resendText: {
        color: '#008751',
    },
    resendTextDisabled: {
        color: '#AAAAAA',
    },
    successContainer: {
        marginBottom: 20,
    },
    successBanner: {
        flexDirection: 'row',
        backgroundColor: '#008751',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    successText: {
        color: '#FFFFFF',
        flex: 1,
        marginLeft: 10,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#008751',
    },
}); 