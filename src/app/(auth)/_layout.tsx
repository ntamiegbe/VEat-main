import React from 'react';
import { Stack } from 'expo-router';

// This is the layout for all authentication screens
export default function AuthLayout() {
    return (
        <Stack initialRouteName="intro">
            <Stack.Screen
                name="intro"
                options={{
                    title: 'Welcome',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="login"
                options={{
                    title: 'Login',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    title: 'Sign Up',
                    headerShown: false,
                }}
            />
            {/* You can add other auth screens here (forgot password, etc.) */}
        </Stack>
    );
}