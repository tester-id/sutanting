import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartTopping {
  id: string;
  name: string;
  extraPrice: number;
}

export interface CartItem {
  id: string; // Unique cart item ID (generated)
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  selectedToppings: CartTopping[];
  quantity: number;
  notes: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Generate unique ID helper
const generateId = () => Math.random().toString(36).substring(2, 9);

// Check if toppings are identical
const areToppingsEqual = (t1: CartTopping[], t2: CartTopping[]) => {
  if (t1.length !== t2.length) return false;
  const sortedT1 = [...t1].sort((a, b) => a.id.localeCompare(b.id));
  const sortedT2 = [...t2].sort((a, b) => a.id.localeCompare(b.id));
  return sortedT1.every((val, index) => val.id === sortedT2[index].id);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const currentItems = get().items;
        
        // Find if item already exists with exact same product, toppings, and notes
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.notes === newItem.notes &&
            areToppingsEqual(item.selectedToppings, newItem.selectedToppings)
        );

        if (existingItemIndex > -1) {
          // If it exists, increment quantity
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          set({ items: updatedItems });
        } else {
          // Else, add as a new item with unique cart ID
          set({
            items: [...currentItems, { ...newItem, id: generateId() }],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const toppingsCost = item.selectedToppings.reduce(
            (sum, topping) => sum + topping.extraPrice,
            0
          );
          return total + (item.price + toppingsCost) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'sutanting-cart-storage', // Key for LocalStorage
    }
  )
);
