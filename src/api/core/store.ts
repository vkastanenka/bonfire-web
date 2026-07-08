import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,

  setAccessToken: (accessToken) => set({ accessToken }),

  clearAccessToken: () => set({ accessToken: null }),

  clearAuth: () =>
    set({
      accessToken: null,
    }),
}));

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token);
export const clearAccessToken = () =>
  useAuthStore.getState().clearAccessToken();
export const clearAuth = () => useAuthStore.getState().clearAuth();
