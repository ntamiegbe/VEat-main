import { Json } from '../../database.types';

/**
 * Restaurant related type definitions
 */

/**
 * Restaurant entity as returned from the database
 */
export type Restaurant = {
    id: string;
    name: string;
    address: string;
    average_preparation_time: number | null;
    average_rating: number | null;
    banner_url: string | null;
    can_deliver: boolean | null;
    created_at: string | null;
    cuisine_types: string[] | null;
    delivery_radius: number | null;
    description: string | null;
    email: string | null;
    is_active: boolean | null;
    is_featured: boolean | null;
    location_id: string | null;
    logo_url: string | null;
    minimum_order_amount: number | null;
    opening_hours: Json;
    owner_id: string;
    phone_number: string;
    total_orders: number | null;
    updated_at: string | null;
};

/**
 * Menu item entity
 */
export type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    original_price?: number;
    category_id?: string;
    restaurant_id: string;
    is_available?: boolean;
    created_at?: string;
    updated_at?: string;
};

/**
 * Menu categories structure
 */
export type MenuCategories = {
    [category: string]: MenuItem[];
}; 