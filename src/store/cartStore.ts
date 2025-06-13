import { create } from 'zustand';

export type MenuItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    restaurantId: string;
    restaurantName: string;
    restaurantLogo?: string | null;
    specialInstructions?: string;
};

interface CartStore {
    items: MenuItem[];
    addItem: (item: Omit<MenuItem, 'quantity'>) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getRestaurantGroups: () => { [key: string]: MenuItem[] };
    getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);

        if (existingItem) {
            return {
                items: state.items.map((i) =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ),
            };
        }

        return {
            items: [...state.items, { ...item, quantity: 1 }],
        };
    }),

    removeItem: (itemId) =>
        set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
        })),

    updateQuantity: (itemId, quantity) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === itemId
                    ? { ...item, quantity: Math.max(0, quantity) }
                    : item
            ),
        })),

    clearCart: () => set({ items: [] }),

    getRestaurantGroups: () => {
        const items = get().items;
        return items.reduce((groups, item) => {
            const group = groups[item.restaurantId] || [];
            groups[item.restaurantId] = [...group, item];
            return groups;
        }, {} as { [key: string]: MenuItem[] });
    },

    getTotalAmount: () => {
        return get().items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    },
})); 