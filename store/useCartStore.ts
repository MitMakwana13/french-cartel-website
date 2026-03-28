import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    id: string; // Unique ID per cart entry (derived from menu_item_id + special_instructions hash/timestamp)
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
    special_instructions?: string;
    image_url?: string;
}

interface CartState {
    items: CartItem[];
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    addItem: (item: Omit<CartItem, "id">) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateInstructions: (id: string, instructions: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isDrawerOpen: false,

            openDrawer: () => set({ isDrawerOpen: true }),
            closeDrawer: () => set({ isDrawerOpen: false }),

            addItem: (item) => {
                const { items } = get();
                
                // Optional: Check if exact same item with same instructions exists to merge them
                // For simplicity and allowing separate edits, we generate a unique ID
                const newItem = {
                    ...item,
                    id: `${item.menu_item_id}-${Date.now()}`,
                };

                set({ items: [...items, newItem], isDrawerOpen: true });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                }));
            },

            updateInstructions: (id, instructions) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, special_instructions: instructions } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getCartTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getCartCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: "french-cartel-cart", // Key in localStorage
        }
    )
);
