import { create } from "zustand";
import { formatCurrency } from "../utils/utils";

type Variant = {
  id: string;
  name: string;
  price: number;
};

type CartItemType = {
  id: number;
  title: string;
  heroImage: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  variant?: Variant | null; // Tambahkan field variant
};

type CartState = {
  items: CartItemType[];
  addItem: (item: CartItemType) => void;
  removeItem: (id: number, variantId?: string) => void;
  incrementItem: (id: number, variantId?: string) => void;
  decrementItem: (id: number, variantId?: string) => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  resetCart: () => void;
  getItems: () => CartItemType[];
};

const initialCartItems: CartItemType[] = [];

export const useCartStore = create<CartState>((set, get) => ({
  items: initialCartItems,

  // Tambahkan variant ke dalam logika penambahan item
  addItem: (item: CartItemType) => {
    const currentItems = get().items;
    const existingItemIndex = currentItems.findIndex(
      (i) =>
        i.id === item.id &&
        (i.variant?.id === item.variant?.id || (!i.variant && !item.variant))
    );

    if (existingItemIndex >= 0) {
      const existingItem = currentItems[existingItemIndex];
      const newQuantity = Math.min(
        existingItem.quantity + item.quantity,
        item.maxQuantity
      );

      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };

      set({ items: updatedItems });
    } else {
      set({ items: [...currentItems, item] });
    }
  },

  // Update removeItem untuk handle variant
  removeItem: (id: number, variantId?: string) =>
    set((state) => ({
      items: state.items.filter(
        (item) =>
          !(
            item.id === id &&
            (variantId ? item.variant?.id === variantId : !item.variant)
          )
      ),
    })),

  // Update incrementItem untuk handle variant
  incrementItem: (id: number, variantId?: string) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (
          item.id === id &&
          (variantId ? item.variant?.id === variantId : !item.variant) &&
          item.quantity < item.maxQuantity
        ) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    })),

  // Update decrementItem untuk handle variant
  decrementItem: (id: number, variantId?: string) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (
          item.id === id &&
          (variantId ? item.variant?.id === variantId : !item.variant) &&
          item.quantity > 1
        ) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }),
    })),

  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },

  resetCart: () => set({ items: initialCartItems }),

  // Tambahkan method untuk mendapatkan semua items
  getItems: () => get().items,
}));
