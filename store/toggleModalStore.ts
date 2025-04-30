import { create } from "zustand";

type Store = {
  serviceModalOpen: boolean;
  setServiceModalOpen: (serviceModalOpen: boolean) => void;
};

export const useToggleModalStore = create<Store>((set) => ({
  serviceModalOpen: false,
  setServiceModalOpen: (serviceModalOpen: boolean) =>
    set(() => ({ serviceModalOpen })),
}));
