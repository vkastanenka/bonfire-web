import { create } from "zustand";
import type { Presence, User } from "@/bonfire-sdk";

export type UsersMap = Record<string, User>;
export type UserPresencesMap = Record<string, Presence>;

export interface UserState {
  users: UsersMap;
  userPresences: UserPresencesMap;
  setUsers: (users: UsersMap) => void;
  setUserPresences: (userPresences: UserPresencesMap) => void;
  upsertUser: (user: User) => void;
  setUserPresence: (userId: string, presence: Presence) => void;
  hydrateUsers: (payload: {
    users: UsersMap;
    userPresences: UserPresencesMap;
  }) => void;
  clearUsers: () => void;
}

export interface UserStore {
  getState: () => UserState;
}

const initialState = {
  users: {} as UsersMap,
  userPresences: {} as UserPresencesMap,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setUsers: (users) => set({ users }),
  setUserPresences: (userPresences) => set({ userPresences }),
  upsertUser: (user) =>
    set((state) => ({
      users: {
        ...state.users,
        [user.id]: user,
      },
    })),
  setUserPresence: (userId, presence) =>
    set((state) => ({
      userPresences: {
        ...state.userPresences,
        [userId]: presence,
      },
    })),
  hydrateUsers: ({ users, userPresences }) => set({ users, userPresences }),
  clearUsers: () => set(initialState),
}));
