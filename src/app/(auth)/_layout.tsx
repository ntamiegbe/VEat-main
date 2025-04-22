import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="intro" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="verify-reset-otp" options={{ headerShown: false }} />
            <Stack.Screen name="new-password" options={{ headerShown: false }} />
        </Stack>
    );
}