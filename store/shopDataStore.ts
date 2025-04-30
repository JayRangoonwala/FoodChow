import { create } from "zustand";

type Store = {
  shopData: any;
  setShopData: (shopData: any) => void;

  shopStatus: any;
  setShopStatus: (shopStatus: any) => void;
};

export const useShopDataStore = create<Store>((set) => ({
  shopData: null,
  setShopData: (shopData: any) => set(() => ({ shopData })),

  shopStatus: null,
  setShopStatus: (shopStatus: any) => set(() => ({ shopStatus })),
}));
