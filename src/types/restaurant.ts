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
 * Menu item as returned from the database
 */
export type MenuItem = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    restaurant_id: string;
    category_id: string | null;
    is_available: boolean | null;
    is_featured: boolean | null;
    average_rating: number | null;
    favorites_count: number | null;
    food_category_id: string | null;
    preparation_time: number | null;
    total_orders: number | null;
    customization_options: Json | null;
    created_at: string | null;
    updated_at: string | null;
};

/**
 * Menu categories structure
 */
export type MenuCategories = {
    [category: string]: MenuItem[];
}; 