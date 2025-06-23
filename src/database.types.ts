export interface Database {
    public: {
        Tables: {
            orders: {
                Row: {
                    id: string;
                    user_id: string;
                    restaurant_id: string | null;
                    delivery_rider_id: string | null;
                    estimated_delivery_minutes: number | null;
                    estimated_delivery_at: string | null;
                    delivery_confirmed_at: string | null;
                    delivery_status: Database['public']['Enums']['delivery_status_type'] | null;
                    items: {
                        id: string;
                        name: string;
                        price: number;
                        quantity: number;
                        restaurantId: string;
                    }[];
                    total_amount: number;
                    delivery_fee: number;
                    delivery_address: {
                        name: string;
                        address: string;
                        latitude: number;
                        longitude: number;
                    };
                    delivery_location_id: string | null;
                    estimated_delivery_time: string | null;
                    actual_delivery_time: string | null;
                    order_group_id: string | null;
                    pickup_confirmed_at: string | null;
                    order_status: Database['public']['Enums']['order_status_type'];
                    payment_reference: string | null;
                    delivery_instructions: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    restaurant_id?: string | null;
                    delivery_rider_id?: string | null;
                    estimated_delivery_minutes?: number | null;
                    estimated_delivery_at?: string | null;
                    delivery_confirmed_at?: string | null;
                    delivery_status?: Database['public']['Enums']['delivery_status_type'] | null;
                    items: {
                        id: string;
                        name: string;
                        price: number;
                        quantity: number;
                        restaurantId: string;
                    }[];
                    total_amount: number;
                    delivery_fee: number;
                    delivery_address: {
                        name: string;
                        address: string;
                        latitude: number;
                        longitude: number;
                    };
                    delivery_location_id?: string | null;
                    estimated_delivery_time?: string | null;
                    actual_delivery_time?: string | null;
                    order_group_id?: string | null;
                    pickup_confirmed_at?: string | null;
                    order_status?: Database['public']['Enums']['order_status_type'];
                    payment_reference?: string | null;
                    delivery_instructions?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    restaurant_id?: string | null;
                    delivery_rider_id?: string | null;
                    estimated_delivery_minutes?: number | null;
                    estimated_delivery_at?: string | null;
                    delivery_confirmed_at?: string | null;
                    delivery_status?: Database['public']['Enums']['delivery_status_type'] | null;
                    items?: {
                        id: string;
                        name: string;
                        price: number;
                        quantity: number;
                        restaurantId: string;
                    }[];
                    total_amount?: number;
                    delivery_fee?: number;
                    delivery_address?: {
                        name: string;
                        address: string;
                        latitude: number;
                        longitude: number;
                    };
                    delivery_location_id?: string | null;
                    estimated_delivery_time?: string | null;
                    actual_delivery_time?: string | null;
                    order_group_id?: string | null;
                    pickup_confirmed_at?: string | null;
                    order_status?: Database['public']['Enums']['order_status_type'];
                    payment_reference?: string | null;
                    delivery_instructions?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            delivery_status_type: 'pending' | 'picked_up' | 'delivered' | 'cancelled';
            order_status_type: 'pending' | 'payment_pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
        };
    };
} 