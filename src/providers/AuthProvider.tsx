import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();

    // Handle routing based on auth state
    useEffect(() => {
        if (!navigationState?.key || isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';

        if (session && inAuthGroup) {
            // Redirect to home if user is logged in and on auth screen
            router.replace('/(app)');
        } else if (!session && inAppGroup) {
            // Redirect to login if user is not logged in and trying to access app
            router.replace('/(auth)/login');
        }
    }, [session, segments, navigationState?.key, isLoading]);

    // Set up Supabase auth state listener
    useEffect(() => {
        // Initial session check
        supabase?.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        // Listen for auth state changes
        const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        }) || { data: { subscription: { unsubscribe: () => { } } } };
        const { subscription } = data;

        // Cleanup function
        return () => {
            subscription.unsubscribe();
        };
    }, []);


    // Sign out function
    const signOut = async () => {
        try {
            setIsLoading(true);
            await supabase?.auth.signOut();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Context value
    const value = {
        session,
        isLoading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};