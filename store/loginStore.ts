// stores/userStore.ts
import { create } from 'zustand'

interface UserState {
  isLoginModalOpen : boolean
  setIsLoginModalOpen : (isLogin: boolean) => void
}

export const useLoginStore = create<UserState>((set) => ({
    isLoginModalOpen : false,
    setIsLoginModalOpen : (isOpen) => set({isLoginModalOpen:isOpen})
}))
