import React from 'react';
import { Stack } from 'expo-router';

// This is the layout for all authentication screens
export default function AuthLayout() {
    return (
        <Stack
            initialRouteName="intro"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen
                name="intro"
                options={{
                    title: 'Welcome',
                }}
            />
            <Stack.Screen
                name="login"
                options={{
                    title: 'Login',
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    title: 'Sign Up',
                }}
            />
            {/* You can add other auth screens here (forgot password, etc.) */}
        </Stack>
    );
}