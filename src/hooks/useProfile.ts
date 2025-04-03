import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    birthdate: Date | null;
    password?: string;
}

interface UseProfileReturn {
    updateProfile: (data: ProfileData) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const useProfile = (): UseProfileReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = async (data: ProfileData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Update user profile in Supabase auth
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    phone_number: data.phoneNumber,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    birthdate: data.birthdate ? data.birthdate.toISOString() : null,
                    password: data.password,
                    has_password: true
                }
            });

            if (authError) throw authError;

            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user found');

            // Update user profile in the users table
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    full_name: `${data.firstName} ${data.lastName}`,
                    phone_number: data.phoneNumber,
                    birthday: data.birthdate ? data.birthdate.toISOString() : null,
                    email: data.email,
                    user_type: 'customer',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateProfile,
        isLoading,
        error
    };
}; 