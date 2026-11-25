import { create } from "zustand";

export interface RelationState {
  outgoingPendingIds: string[];
  incomingPendingIds: string[];
  friendIds: string[];
  outgoingBlockIds: string[];
  setOutgoingPendingIds: (outgoingPendingIds: string[]) => void;
  setIncomingPendingIds: (incomingPendingIds: string[]) => void;
  setFriendIds: (friendIds: string[]) => void;
  setOutgoingBlockIds: (outgoingBlockIds: string[]) => void;
  addFriendId: (userId: string) => void;
  removeFriendId: (userId: string) => void;
  addOutgoingBlockId: (userId: string) => void;
  removeOutgoingBlockId: (userId: string) => void;
  hydrateRelations: (payload: {
    outgoingPendingIds: string[];
    incomingPendingIds: string[];
    friendIds: string[];
    outgoingBlockIds: string[];
  }) => void;
  clearRelations: () => void;
}

export interface RelationStore {
  getState: () => RelationState;
}

const initialState = {
  outgoingPendingIds: [] as string[],
  incomingPendingIds: [] as string[],
  friendIds: [] as string[],
  outgoingBlockIds: [] as string[],
};

export const useRelationStore = create<RelationState>((set) => ({
  ...initialState,
  setOutgoingPendingIds: (outgoingPendingIds) => set({ outgoingPendingIds }),
  setIncomingPendingIds: (incomingPendingIds) => set({ incomingPendingIds }),
  setFriendIds: (friendIds) => set({ friendIds }),
  setOutgoingBlockIds: (outgoingBlockIds) => set({ outgoingBlockIds }),
  addFriendId: (userId) =>
    set((state) => ({
      friendIds: state.friendIds.includes(userId)
        ? state.friendIds
        : [...state.friendIds, userId],
      incomingPendingIds: state.incomingPendingIds.filter(
        (id) => id !== userId,
      ),
      outgoingPendingIds: state.outgoingPendingIds.filter(
        (id) => id !== userId,
      ),
    })),
  removeFriendId: (userId) =>
    set((state) => ({
      friendIds: state.friendIds.filter((id) => id !== userId),
    })),
  addOutgoingBlockId: (userId) =>
    set((state) => ({
      outgoingBlockIds: state.outgoingBlockIds.includes(userId)
        ? state.outgoingBlockIds
        : [...state.outgoingBlockIds, userId],
      friendIds: state.friendIds.filter((id) => id !== userId),
      incomingPendingIds: state.incomingPendingIds.filter(
        (id) => id !== userId,
      ),
      outgoingPendingIds: state.outgoingPendingIds.filter(
        (id) => id !== userId,
      ),
    })),
  removeOutgoingBlockId: (userId) =>
    set((state) => ({
      outgoingBlockIds: state.outgoingBlockIds.filter((id) => id !== userId),
    })),
  hydrateRelations: ({
    outgoingPendingIds,
    incomingPendingIds,
    friendIds,
    outgoingBlockIds,
  }) =>
    set({
      outgoingPendingIds,
      incomingPendingIds,
      friendIds,
      outgoingBlockIds,
    }),
  clearRelations: () => set(initialState),
}));
