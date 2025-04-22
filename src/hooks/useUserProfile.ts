import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '../lib/edgeFunctions';
import { UserProfileData } from '../../supabase/functions/_shared/types';
import { supabase } from '../lib/supabase';

export function useUserProfile() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to refresh the profile data
    const refreshProfile = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Load user profile
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        const fetchProfile = async () => {
            try {
                const { data: session } = await supabase.auth.getSession();

                // Only fetch profile if user is logged in
                if (session?.session) {
                    const response = await getUserProfile();

                    if (isMounted) {
                        if (response.success && response.data) {
                            setUserProfile(response.data as UserProfileData);
                        } else {
                            setError(response.message || 'Failed to load user profile');
                            console.error('Profile fetch error:', response);
                        }
                    }
                } else {
                    if (isMounted) {
                        setUserProfile(null);
                    }
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'An error occurred loading the profile');
                    console.error('Profile fetch exception:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        // Set up auth state change subscription
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                fetchProfile();
            } else if (event === 'SIGNED_OUT') {
                setUserProfile(null);
            }
        });

        return () => {
            isMounted = false;
            authListener?.subscription.unsubscribe();
        };
    }, [refreshTrigger]);

    // Function to update user profile
    const updateProfile = useCallback(async (profileUpdates: Partial<UserProfileData>) => {
        setLoading(true);
        setError(null);

        try {
            const response = await updateUserProfile(profileUpdates);

            if (response.success) {
                // Refresh the profile to get the updated data
                refreshProfile();
                return { success: true };
            } else {
                setError(response.message || 'Failed to update profile');
                console.error('Profile update error:', response);
                return {
                    success: false,
                    error: response.message || 'Failed to update profile'
                };
            }
        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred updating the profile';
            setError(errorMessage);
            console.error('Profile update exception:', err);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, [refreshProfile]);

    return {
        userProfile,
        loading,
        error,
        updateProfile,
        refreshProfile
    };
} 