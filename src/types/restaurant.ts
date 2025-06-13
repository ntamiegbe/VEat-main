import { Json } from '../../database.types';

/**
 * Restaurant related type definitions
 */

/**
 * Location entity
 */
export type Location = {
    id: string;
    name: string;
    address: string;
    description: string | null;
    is_active: boolean | null;
    is_campus: boolean | null;
};

/**
 * Opening hours structure
 */
export type OpeningHours = {
    monday?: { open: string; close: string } | null;
    tuesday?: { open: string; close: string } | null;
    wednesday?: { open: string; close: string } | null;
    thursday?: { open: string; close: string } | null;
    friday?: { open: string; close: string } | null;
    saturday?: { open: string; close: string } | null;
    sunday?: { open: string; close: string } | null;
};

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
    location?: Location;
    logo_url: string | null;
    minimum_order_amount: number | null;
    opening_hours: OpeningHours;
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
    description: string | null;
    price: number;
    image_url: string | null;
    original_price?: number;
    category_id?: string | null;
    food_category_id?: string | null;
    restaurant_id: string;
    is_available?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    average_rating?: number | null;
    favorites_count?: number | null;
    total_orders?: number | null;
    preparation_time?: number | null;
    customization_options?: Json | null;
    is_featured?: boolean | null;
};

/**
 * Menu categories structure
 */
export type MenuCategories = {
    [category: string]: MenuItem[];
}; 