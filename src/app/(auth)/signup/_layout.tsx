import React from 'react';
import { Stack } from 'expo-router';

export default function SignUpLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="email" options={{ title: 'Email Address' }} />
            <Stack.Screen name="verify" options={{ title: 'Verify Email' }} />
            <Stack.Screen name="profile" options={{ title: 'Profile Information' }} />
        </Stack>
    );
} 