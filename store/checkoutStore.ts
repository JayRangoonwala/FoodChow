import { create } from "zustand";

type Store = {
  gstDetailsSaved: number;
  setGstDetailsSaved: (count?: number) => void;
  itemSubTotal: any;
  setSubItemTotal: (itemSubTotal: any) => void;
  itemTotal: any;
  setItemTotal: (itemTotal: any) => void;
};

export const useCheckoutStore = create<Store>((set) => ({
  gstDetailsSaved: 0,
  setGstDetailsSaved: (count?: number) =>
    set((state) => ({
      gstDetailsSaved: count ? count : state.gstDetailsSaved + 1,
    })),
  itemSubTotal: null,
  setSubItemTotal: (itemSubTotal: any) => set(() => ({ itemSubTotal })),
  itemTotal: null,
  setItemTotal: (itemTotal: any) => set(() => ({ itemTotal })),
}));
