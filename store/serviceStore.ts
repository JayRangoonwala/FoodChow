import { create } from "zustand";

type Store = {
  service: any;
  setService: (service: any) => void;
};

export const useServiceStore = create<Store>((set) => ({
  service: null,
  setService: (service: any) => set(() => ({ service })),
}));
