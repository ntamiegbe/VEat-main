import { View, TouchableOpacity, Image, SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import { MotiView } from 'moti'
import { useRouter } from 'expo-router'
import { useAuth } from '@/providers/AuthProvider'
import Text from '@/components/ui/Text'

export default function IntroScreen() {
    const router = useRouter()
    const { isLoading } = useAuth()

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

                <Text weight="bold" style={styles.title}>Welcome to VEat</Text>
                <Text style={styles.subtitle}>Your favorite Nigerian food, delivered fast</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                    >
                        <Text weight="medium" style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={handleSignUp}
                    >
                        <Text weight="medium" style={styles.signUpButtonText}>Sign Up</Text>
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
        fontSize: 30,
        fontWeight: 'bold',
        color: '#008751',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#666666',
        marginBottom: 64,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        gap: 16,
    },
    loginButton: {
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#008751',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
    },
    signUpButton: {
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#008751',
        alignItems: 'center',
        justifyContent: 'center',
    },
    signUpButtonText: {
        color: '#008751',
        fontSize: 18,
    },
}); 