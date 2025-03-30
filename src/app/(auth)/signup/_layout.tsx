import React from 'react';
import { Stack } from 'expo-router';

export default function SignUpLayout() {
    return (
        <Stack>
            <Stack.Screen name="email" options={{ headerShown: false }} />
            <Stack.Screen name="verify" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
    );
} 