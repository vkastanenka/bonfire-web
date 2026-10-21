import { create } from "zustand";
import type { Me } from "../user";

interface AuthState {
  accessToken: string | null;
  me: Me | null;
  setAccessToken: (accessToken: string | null) => void;
  setMe: (me: Me | null) => void;
  clearSession: () => void;
}

export interface AuthStore {
  getState: () => AuthState;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  me: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setMe: (me) => set({ me }),
  clearSession: () => set({ accessToken: null, me: null }),
}));
