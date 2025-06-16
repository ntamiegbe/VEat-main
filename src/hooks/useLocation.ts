import { useState, useEffect } from 'react';

export interface Location {
    id: string;
    name: string;
    address: string | null;
    description: string | null;
    is_active: boolean | null;
    is_campus: boolean | null;
    is_default: boolean;
    user_id: string;
    created_at: string | null;
    updated_at: string | null;
}

export const useLocation = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('No user found');

            const { data: locations, error } = await supabase
                .from('locations')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (error) throw error;

            setLocations(locations as Location[] || []);
            setCurrentLocation(locations?.[0] as Location || null);
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        locations,
        currentLocation,
        loading,
        refetch: fetchLocations,
    };
}; 