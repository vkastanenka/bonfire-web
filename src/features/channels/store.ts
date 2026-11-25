import { create } from "zustand";
import type { Channel } from "@/bonfire-sdk";

export type ChannelMap = Record<string, Channel>;
export type ChannelMemberIdsMap = Record<string, string[]>;

export interface ChannelState {
  channels: ChannelMap;
  channelMemberIds: ChannelMemberIdsMap;
  setChannels: (channels: ChannelMap) => void;
  setChannelMemberIds: (channelMemberIds: ChannelMemberIdsMap) => void;
  hydrateChannels: (payload: {
    channels: ChannelMap;
    channelMemberIds: ChannelMemberIdsMap;
  }) => void;
}

const initialState = {
  channels: {} as ChannelMap,
  channelMemberIds: {} as ChannelMemberIdsMap,
};

export const useChannelStore = create<ChannelState>((set) => ({
  ...initialState,
  setChannels: (channels) => set({ channels }),
  setChannelMemberIds: (channelMemberIds) => set({ channelMemberIds }),
  hydrateChannels: ({ channels, channelMemberIds }) =>
    set({ channels, channelMemberIds }),
}));
