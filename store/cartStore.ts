import { create } from "zustand";

type Store = {
  newItem: any;
  setNewItem: (service: any) => void;
  cartCleared: boolean;
  setCartCleared: (cartCleared: boolean) => void;
  itemRemoved: boolean;
  setItemRemoved: (itemRemoved: boolean) => void;
};

export const useCartStore = create<Store>((set) => ({
  newItem: null,
  setNewItem: (newItem: any) => set(() => ({ newItem })),
  cartCleared: false,
  setCartCleared: (cartCleared: boolean) => set(() => ({ cartCleared })),
  itemRemoved: false,
  setItemRemoved: (itemRemoved: boolean) => set(() => ({ itemRemoved })),
}));
