import { create } from "zustand";
import type { Me } from "./validation";

interface UserState {
  me: Me | null;
  setMe: (me: Me | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  me: null,
  setMe: (me) => set({ me }),
  clearUser: () => set({ me: null }),
}));
