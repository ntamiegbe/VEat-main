import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UseFormReturn } from 'react-hook-form';

interface GoogleUserData {
    firstName: string;
    lastName: string;
    email: string;
}

interface UseGoogleUserProps {
    form: UseFormReturn<any>;
    googleFirstName?: string;
    googleLastName?: string;
}

export const useGoogleUser = ({ form, googleFirstName, googleLastName }: UseGoogleUserProps) => {
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [birthdate, setBirthdate] = useState<Date | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        // Skip effect if already initialized
        if (initializedRef.current) return;

        const checkGoogleUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.app_metadata?.provider === 'google') {
                    setIsGoogleUser(true);

                    // Update form with Google data
                    if (googleFirstName && googleLastName) {
                        form.setValue('firstName', googleFirstName);
                        form.setValue('lastName', googleLastName);
                    }

                    // Check if user has birthday or phone in Google metadata
                    const googleBirthday = user.user_metadata?.birthday;
                    const googlePhone = user.user_metadata?.phone_number;

                    if (googleBirthday) {
                        setBirthdate(new Date(googleBirthday));
                    }
                    if (googlePhone) {
                        form.setValue('phoneNumber', googlePhone);
                    }
                }

                // Mark as initialized after first run
                initializedRef.current = true;
            } catch (error) {
                console.error('Error checking Google user:', error);
                // Still mark as initialized to prevent infinite retries
                initializedRef.current = true;
            }
        };

        checkGoogleUser();
    }, [googleFirstName, googleLastName]); // Remove form from dependencies

    return {
        isGoogleUser,
        birthdate,
        setBirthdate
    };
}; 