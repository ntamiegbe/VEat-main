import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import { typography } from '@/utils/typography';
import { Ionicons } from '@expo/vector-icons';

export default function EmailSignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(true);

    // Validate email format
    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    // Handle email change
    const handleEmailChange = (text: string) => {
        setEmail(text);
        setIsValidEmail(text === '' || validateEmail(text));
    };

    // Continue with email
    const handleContinue = () => {
        if (email && validateEmail(email)) {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);
                router.push({
                    pathname: '/(auth)/signup/verify',
                    params: { email }
                });
            }, 1000);
        } else {
            setIsValidEmail(false);
        }
    };

    // Continue with Google
    const handleGoogleSignUp = () => {
        // Implement Google sign-up logic
        console.log('Sign up with Google');
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

                <Text weight="bold" style={styles.title}>What's your email address?</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, !isValidEmail && styles.inputError]}
                        placeholder="Email"
                        value={email}
                        onChangeText={handleEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="next"
                        placeholderTextColor="#AAAAAA"
                    />
                    {!isValidEmail && (
                        <Text weight="regular" style={styles.errorText}>
                            Please enter a valid email address
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        (!email || !isValidEmail) && styles.continueButtonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={!email || !isValidEmail || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text weight="medium" style={styles.continueButtonText}>Continue</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text weight="regular" style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                </View>

                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
                    <Ionicons name="logo-google" size={24} color="#4285F4" style={styles.googleIcon} />
                    <Text weight="medium" style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.termsContainer}>
                    <Text weight="regular" style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <Text weight="medium" style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text weight="medium" style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </View>
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
        ...typography.h2,
        marginBottom: 32,
    },
    inputContainer: {
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
    continueButton: {
        height: 56,
        backgroundColor: '#008751',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    continueButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    dividerText: {
        ...typography.bodySmall,
        marginHorizontal: 16,
        color: '#888888',
    },
    googleButton: {
        height: 56,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    googleIcon: {
        marginRight: 8,
    },
    googleButtonText: {
        ...typography.bodyMedium,
        color: '#333333',
    },
    termsContainer: {
        marginTop: 16,
    },
    termsText: {
        ...typography.bodySmall,
        textAlign: 'center',
        color: '#888888',
    },
    termsLink: {
        color: '#008751',
    },
}); 