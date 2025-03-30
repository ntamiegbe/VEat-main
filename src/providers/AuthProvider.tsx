import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';

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

// This hook will protect the route access based on user authentication
function useProtectedRoute(session: Session | null, isLoading: boolean) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Skip redirects when app is still loading auth state
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';

        // Only perform redirects if we're in a stable state and the route actually needs protecting
        if (!session && inAppGroup) {
            // If the user is not signed in and the initial segment is in the app group
            router.replace('/(auth)/intro');
        } else if (session && inAuthGroup && segments[1] !== 'signup') {
            // Redirect away from auth screens (except signup flow) if the user is signed in
            router.replace('/(app)');
        }
    }, [session, segments, isLoading]);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Use the protected route hook
    useProtectedRoute(session, isLoading);

    // Set up Supabase auth state listener
    useEffect(() => {
        // Initial session check
        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase?.auth.getSession() || { data: { session: null } };
                setSession(initialSession);
            } catch (error) {
                console.error('Error checking auth session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
            setSession(session);
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