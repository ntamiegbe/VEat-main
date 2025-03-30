import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

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

    // Set up Supabase auth state listener
    useEffect(() => {
        // Initial session check
        const initializeAuth = async () => {
            try {
                const { data } = await supabase?.auth.getSession() || { data: { session: null } };
                setSession(data.session);
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