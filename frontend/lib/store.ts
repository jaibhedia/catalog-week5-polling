import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  _id?: { $oid: string };
  title: string;
  options: PollOption[];
  isClosed: boolean;
  creator_id?: any;
  created_at?: any;
  author: string; 
}

interface User {
  username: string;
  id: string;
}

interface AppState {
  user: User | null;
  polls: Poll[];
  setUser: (user: User | null) => void;
  setPolls: (polls: Poll[]) => void;
  updatePoll: (poll: Poll) => void;
  clearState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      polls: [],
      setUser: (user) => set({ user }),
      setPolls: (polls) => set({ polls }),
      updatePoll: (updatedPoll) =>
        set((state) => ({
          polls: state.polls.map((poll) =>
            poll.id === updatedPoll.id ? updatedPoll : poll
          ),
        })),
      clearState: () => set({ user: null, polls: [] }),
    }),
    {
      name: 'polling-app-store',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);