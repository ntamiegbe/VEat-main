import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Text from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/global/button';

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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <Text weight="bold" style={styles.title}>What's your email address?</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            !isValidEmail && styles.inputError
                        ]}
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

                <Button
                    variant="primary"
                    size="md"
                    onPress={handleContinue}
                    disabled={!email || !isValidEmail || isLoading}
                    isLoading={isLoading}
                >
                    Continue
                </Button>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text weight="regular" style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                </View>

                <Button
                    variant="outline"
                    size="md"
                    onPress={handleGoogleSignUp}
                    icon={<Ionicons name="logo-google" size={24} color="#4285F4" />}
                >
                    Continue with Google
                </Button>

                <View style={styles.footer}>
                    <Text weight="regular" style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text weight="medium" style={styles.linkText}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text weight="medium" style={styles.linkText}>Privacy Policy</Text>
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
        fontSize: 24,
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 32,
        zIndex: 1,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#888888',
        fontSize: 14,
    },
    googleIcon: {
        marginRight: 8,
    },
    footer: {
        marginTop: 16,
    },
    footerText: {
        textAlign: 'center',
        color: '#888888',
        fontSize: 14,
    },
    linkText: {
        color: '#008751',
    },
}); 