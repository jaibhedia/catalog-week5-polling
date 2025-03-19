// frontend/lib/store.ts
import { create } from 'zustand';

interface User {
  id: string;
  username: string;
}

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));