import { create } from "zustand";

interface TokenState {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearTokens: () => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearTokens: () => set({ accessToken: null }),
}));

export const getAccessToken = () => useTokenStore.getState().accessToken;
export const setAccessToken = (token: string) =>
  useTokenStore.getState().setAccessToken(token);
export const clearTokens = () => useTokenStore.getState().clearTokens();
