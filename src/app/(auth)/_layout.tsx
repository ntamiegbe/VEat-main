import React from 'react';
import { Stack } from 'expo-router';

// This is the layout for all authentication screens
export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="intro" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
        </Stack>
    );
}