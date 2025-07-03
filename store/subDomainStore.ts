import { create } from 'zustand';

interface SubdomainState {
  subdomain: string | null;
  setSubdomain: (subdomain: string) => void;
}

export const useSubdomainStore = create<SubdomainState>((set) => ({
  subdomain: null,
  setSubdomain: (subdomain) => set({ subdomain }),
}));
