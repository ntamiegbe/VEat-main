import { Tables } from "@/database.types";

export type Restaurant = Tables<'restaurants'>;
export type MenuItem = Tables<'menu_items'>;
export type Order = Tables<'orders'>;
export type MenuCategory = Tables<'menu_categories'>;
export type UserProfile = Tables<'users'>;

// Extended types for nested data
export type RestaurantWithMenuItems = Restaurant & {
    menu_items: MenuItem[];
};

export type OrderWithDetails = Order & {
    restaurant: Pick<Restaurant, 'name' | 'logo_url'>;
    order_items: Array<{
        menu_item: Pick<MenuItem, 'name' | 'price'>;
        quantity: number;
        special_instructions?: string;
    }>;
};