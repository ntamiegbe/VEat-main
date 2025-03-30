import { View, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React, { useEffect } from 'react'
import { MotiView } from 'moti'
import { useRouter } from 'expo-router'
import { useAuth } from '@/providers/AuthProvider'
import Text from '@/components/ui/Text'
import { typography } from '@/utils/typography'

export default function IntroScreen() {
    const router = useRouter()
    const { session, isLoading } = useAuth()

    // If user is already authenticated, redirect to home
    useEffect(() => {
        if (!isLoading && session) {
            router.replace('/(app)')
        }
    }, [session, isLoading])

    // Navigate to login screen
    const handleLogin = () => {
        router.push('/(auth)/login')
    }

    // Navigate to signup screen
    const handleSignUp = () => {
        router.push('/(auth)/signup/email')
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 200, type: 'timing' }}
                style={styles.content}
            >
                <Image
                    source={{ uri: 'https://via.placeholder.com/150' }} // Replace with your app logo
                    style={styles.logo}
                />

                <Text style={styles.title} weight="bold">Welcome to VEat</Text>
                <Text style={styles.subtitle}>Your favorite Nigerian food, delivered fast</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.loginButton]}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginButtonText} weight="medium">Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.signUpButton]}
                        onPress={handleSignUp}
                    >
                        <Text style={styles.signUpButtonText} weight="medium">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </MotiView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 40,
        borderRadius: 60,
    },
    title: {
        ...typography.h1,
        color: '#008751', // Nigerian green
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.bodyLarge,
        color: '#555',
        marginBottom: 60,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        gap: 16,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        backgroundColor: '#008751', // Nigerian green
    },
    loginButtonText: {
        ...typography.buttonLarge,
        color: 'white',
    },
    signUpButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#008751',
    },
    signUpButtonText: {
        ...typography.buttonLarge,
        color: '#008751',
    },
}) 