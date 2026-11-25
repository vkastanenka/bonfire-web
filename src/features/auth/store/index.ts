import { create } from "zustand";
import type { Me, Member } from "@/bonfire-sdk";

export type ChannelMembershipMap = Record<string, Member>;

export interface AuthState {
  accessToken: string | null;
  me: Me | null;
  channelMemberships: ChannelMembershipMap;
  sidebarIds: string[];
  setAccessToken: (accessToken: string | null) => void;
  setMe: (me: Me | null) => void;
  setChannelMemberships: (channelMemberships: ChannelMembershipMap) => void;
  setSidebarIds: (sidebarIds: string[]) => void;
  hydrateAuth: (payload: {
    me: Me;
    channelMemberships: ChannelMembershipMap;
    sidebarIds: string[];
  }) => void;
  clearSession: () => void;
}

export interface AuthStore {
  getState: () => AuthState;
}

const initialState = {
  accessToken: null,
  me: null,
  channelMemberships: {} as ChannelMembershipMap,
  sidebarIds: [] as string[],
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAccessToken: (accessToken) => set({ accessToken }),
  setMe: (me) => set({ me }),
  setChannelMemberships: (channelMemberships) => set({ channelMemberships }),
  setSidebarIds: (sidebarIds) => set({ sidebarIds }),
  hydrateAuth: ({ me, channelMemberships, sidebarIds }) =>
    set({ me, channelMemberships, sidebarIds }),
  clearSession: () => set(initialState),
}));
