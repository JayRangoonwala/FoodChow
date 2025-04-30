// Example in a store
import { create } from "zustand";

type Store = {
  pendingAddItemId: number | null;
  setPendingAddItemId: (id: number | null) => void;
};

export const usePendingAddItemStore = create<Store>((set) => ({
  pendingAddItemId: null as number | null,
  setPendingAddItemId: (id: number | null) => set({ pendingAddItemId: id }),
}));
