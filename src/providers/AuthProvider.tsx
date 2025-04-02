import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';

type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Set up Supabase auth state listener
    useEffect(() => {
        // Initial session check
        const initializeAuth = async () => {
            try {
                setIsLoading(true);
                // Make sure supabase is available before trying to use it
                if (supabase) {
                    const { data } = await supabase.auth.getSession();
                    setSession(data.session);
                }
            } catch (error) {
                console.error('Error checking auth session:', error);
            } finally {
                // Set loading to false even if there's an error
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Set up auth state change listener only if supabase is available
        let subscription = { unsubscribe: () => { } };

        if (supabase) {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
            });
            subscription = data.subscription;
        }

        // Cleanup function
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Sign out function
    const signOut = async () => {
        try {
            setIsLoading(true);
            if (supabase) {
                await supabase.auth.signOut();
                // Redirect to intro screen after successful sign out
                router.replace('/(auth)/intro');
            }
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