import { create } from "zustand";
import { type Me } from "./schema";
import { type Presence } from "../presence";

type UpdateProfileParams = Partial<Pick<Me, "display_name" | "avatar_url">>;

interface MeState {
  me: Me | null;
  set: (user: Me | null) => void;
  updateProfile: (params: UpdateProfileParams) => void;
  updatePresence: (presence: Presence | null) => void;
  clear: () => void;
}

export const useMeStore = create<MeState>((set) => ({
  me: null,

  set: (me) => set({ me }),

  updateProfile: (params) =>
    set((state) => {
      if (!state.me) return state;
      return {
        me: {
          ...state.me,
          ...params,
        },
      };
    }),

  updatePresence: (presence) =>
    set((state) => {
      if (!state.me) return state;
      return {
        me: {
          ...state.me,
          presence,
        },
      };
    }),

  clear: () => set({ me: null }),
}));

export const getMe = () => useMeStore.getState().me;
export const setMe = (user: Me | null) => useMeStore.getState().set(user);
export const updateMeProfile = (params: UpdateProfileParams) =>
  useMeStore.getState().updateProfile(params);
export const updateMePresence = (presence: Presence | null) =>
  useMeStore.getState().updatePresence(presence);
export const clearUser = () => useMeStore.getState().clear();
