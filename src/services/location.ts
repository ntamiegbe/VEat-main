import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const QUERY_KEYS = {
    LOCATIONS: 'locations',
    USER_LOCATION: 'user-location',
} as const;

export type Location = {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    is_active: boolean;
    is_campus: boolean;
};

export type UserLocation = {
    id: string;
    user_id: string;
    default_delivery_location_id: string | null;
    created_at: string;
    updated_at: string;
};

// Fetch all active locations
export function useLocations() {
    return useQuery({
        queryKey: [QUERY_KEYS.LOCATIONS],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('locations')
                .select('id, name, description, address')
                .eq('is_active', true)
                .eq('is_campus', true)
                .order('name');

            if (error) throw error;
            return data as Location[];
        },
    });
}

// Fetch user's default location
export function useUserLocation() {
    return useQuery({
        queryKey: [QUERY_KEYS.USER_LOCATION],
        queryFn: async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('User not authenticated');

            // Fetch the user's default_delivery_location_id
            const { data: userData, error: userError2 } = await supabase
                .from('users')
                .select('default_delivery_location_id')
                .eq('id', user.id)
                .maybeSingle();

            if (userError2) throw userError2;
            const locationId = userData?.default_delivery_location_id;
            if (!locationId) return null;

            // Fetch the location's details from the locations table
            const { data: locationData, error: locationError } = await supabase
                .from('locations')
                .select('id, name, description, address')
                .eq('id', locationId)
                .maybeSingle();

            if (locationError) throw locationError;
            if (!locationData) return null;

            return {
                id: locationData.id,
                name: locationData.name,
                description: locationData.description,
                address: locationData.address
            };
        },
    });
}

// Mutation for setting user's default location
export function useSetUserLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (locationId: string) => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('User not authenticated');

            // Check if user exists in the users table
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (checkError) throw checkError;

            if (!existingUser) {
                // Create new user record with location
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        phone_number: user.user_metadata?.phone_number || '',
                        user_type: 'user',
                        default_delivery_location_id: locationId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (insertError) throw insertError;
            } else {
                // Update existing user's location
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ default_delivery_location_id: locationId })
                    .eq('id', user.id);

                if (updateError) throw updateError;
            }

            return { locationId };
        },
        onSuccess: () => {
            // Invalidate user location query
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_LOCATION] });
        },
    });
}

// Check if user has a default location
export function useHasLocation() {
    return useQuery({
        queryKey: [QUERY_KEYS.USER_LOCATION, 'has-location'],
        queryFn: async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) return false;

            const { data, error } = await supabase
                .from('users')
                .select('default_delivery_location_id')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;
            return Boolean(data?.default_delivery_location_id);
        },
    });
}

// Fetch a single location by ID
export function useLocation(locationId: string | null) {
    return useQuery({
        queryKey: [QUERY_KEYS.LOCATIONS, locationId],
        queryFn: async () => {
            if (!locationId) return null;

            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('id', locationId)
                .single();

            if (error) throw error;
            return data as Location;
        },
        enabled: !!locationId,
    });
} 