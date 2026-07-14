import { create } from "zustand";
import { type Presence } from "../presence";
import { type Me } from "./schema";

export type UpdateProfileParams = Partial<
  Pick<Me, "display_name" | "avatar_url">
>;

interface MeState {
  me: Me | null;
  set: (me: Me | null) => void;
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
