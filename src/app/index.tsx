import { useEffect } from 'react';
import { useRouter, Redirect } from 'expo-router';
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

    if (!isLoading) {
        // Instead of router.replace, use <Redirect> component for more reliable navigation
        if (session) {
            return <Redirect href="/(app)" />;
        } else {
            return <Redirect href="/(auth)/intro" />;
        }
    }

    // Show loading indicator while checking auth
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#008751" />
            <Text weight="medium" style={{ marginTop: 10 }}>Loading VEat...</Text>
        </View>
    );
} 