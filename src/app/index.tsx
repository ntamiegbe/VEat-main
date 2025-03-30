import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ActivityIndicator, View } from 'react-native';
import Text from '@/components/ui/Text';

/**
 * App entry point that redirects based on authentication status:
 * - Authenticated users go to the main app
 * - Non-authenticated users go to the intro screen
 */
export default function Index() {
    const { session, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (session) {
                // User is authenticated, redirect to home
                router.replace('/(app)');
            } else {
                // User is not authenticated, redirect to intro
                router.replace('/(auth)/intro');
            }
        }
    }, [session, isLoading]);

    // Show loading indicator while checking auth
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#008751" />
            <Text weight="medium" style={{ marginTop: 10 }}>Loading VEat...</Text>
        </View>
    );
} 