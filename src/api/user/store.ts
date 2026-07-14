import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  presence?: number | null;
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
}

export interface CurrentUser extends User {
  profile: UserProfile;
}

interface UserState {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePresence: (presenceCode: number | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  updateProfile: (updatedFields) =>
    set((state) => {
      if (!state.currentUser) return state;
      return {
        currentUser: {
          ...state.currentUser,
          profile: {
            ...state.currentUser.profile,
            ...updatedFields,
          },
        },
      };
    }),

  updatePresence: (presenceCode) =>
    set((state) => {
      if (!state.currentUser) return state;
      return {
        currentUser: {
          ...state.currentUser,
          presence: presenceCode,
        },
      };
    }),

  clearUser: () => set({ currentUser: null }),
}));

export const getCurrentUser = () => useUserStore.getState().currentUser;
export const setCurrentUser = (user: CurrentUser | null) =>
  useUserStore.getState().setCurrentUser(user);
export const updateLocalPresence = (presenceCode: number | null) =>
  useUserStore.getState().updatePresence(presenceCode);
export const clearUser = () => useUserStore.getState().clearUser();
