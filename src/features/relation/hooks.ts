import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { type FriendAddedResponse, type User } from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import { useAuthStore } from "@/features/auth";
import { useChannelStore } from "@/features/channels";
import { useUserStore } from "@/features/user";
import { useRelationStore } from "./store";

export const relationKeys = {
  all: ["relations"] as const,
  sendRequest: () => [...relationKeys.all, "sendRequest"] as const,
  acceptRequest: () => [...relationKeys.all, "acceptRequest"] as const,
  blockUser: () => [...relationKeys.all, "blockUser"] as const,
  deleteRelation: () => [...relationKeys.all, "deleteRelation"] as const,
};

const getSortableName = (user: User): string => {
  return (user.displayName || user.username).trim().toLowerCase();
};

const insertFriendIdSortedByName = (
  friendIds: string[],
  newFriendUser: User,
  users: Record<string, User>,
): string[] => {
  if (friendIds.includes(newFriendUser.id)) {
    return friendIds;
  }

  const nextIds = [...friendIds, newFriendUser.id];
  const mergedUsers: Record<string, User> = {
    ...users,
    [newFriendUser.id]: newFriendUser,
  };

  return nextIds.sort((a, b) => {
    const nameA = mergedUsers[a] ? getSortableName(mergedUsers[a]) : a;
    const nameB = mergedUsers[b] ? getSortableName(mergedUsers[b]) : b;
    const firstA = nameA.charAt(0);
    const firstB = nameB.charAt(0);

    if (firstA !== firstB) {
      return firstA.localeCompare(firstB);
    }
    return nameA.localeCompare(nameB);
  });
};

const getDisplayNameForUserId = (
  userId: string,
  me: { id: string; displayName?: string; username: string } | null,
  users: Record<string, User>,
): string => {
  if (me && me.id === userId) {
    return (me.displayName || me.username).trim().toLowerCase();
  }
  const user = users[userId];
  if (user) {
    return (user.displayName || user.username).trim().toLowerCase();
  }
  return userId.toLowerCase();
};

const sortMemberIdsByDisplayName = (
  ids: string[],
  me: { id: string; displayName?: string; username: string } | null,
  users: Record<string, User>,
): string[] => {
  const uniqueIds = Array.from(new Set(ids));
  return uniqueIds.sort((a, b) => {
    const nameA = getDisplayNameForUserId(a, me, users);
    const nameB = getDisplayNameForUserId(b, me, users);
    const cmp = nameA.localeCompare(nameB);
    return cmp !== 0 ? cmp : a.localeCompare(b);
  });
};

export const useSendFriendRequest = (
  options?: UseMutationOptions<FriendAddedResponse | null, Error, string>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.sendRequest(),
    mutationFn: (username: string) =>
      bonfireSdk.relation.sendFriendRequest(username),
    onSuccess: async (data, username, onMutateResult, context) => {
      if (data) {
        const { channel, member, peerUser, peerPresence } = data;

        // 1. User store: upsert peerUser and set peerPresence first
        const userState = useUserStore.getState();
        userState.upsertUser(peerUser);
        userState.setUserPresence(peerUser.id, peerPresence);

        const latestUserState = useUserStore.getState();
        const authState = useAuthStore.getState();

        // 2. Auth store: add membership to channelMemberships
        const membershipChannelId =
          (member as { channelId?: string }).channelId ?? channel.id;
        authState.setChannelMemberships({
          ...authState.channelMemberships,
          [membershipChannelId]: member,
        });

        // 3. Channel store: merge channel and build sorted member IDs for channel.id
        const channelState = useChannelStore.getState();
        const existingMemberIds =
          channelState.channelMemberIds[channel.id] ?? [];
        const sortedChannelMemberIds = sortMemberIdsByDisplayName(
          [...existingMemberIds, member.userId, peerUser.id],
          authState.me,
          latestUserState.users,
        );

        channelState.setChannels({
          ...channelState.channels,
          [channel.id]: channel,
        });
        channelState.setChannelMemberIds({
          ...channelState.channelMemberIds,
          [channel.id]: sortedChannelMemberIds,
        });

        // 4. Relation store: clear pending IDs and insert peerUser.id sorted by display name first letter
        const relationState = useRelationStore.getState();
        const sortedFriendIds = insertFriendIdSortedByName(
          relationState.friendIds,
          peerUser,
          latestUserState.users,
        );

        relationState.setFriendIds(sortedFriendIds);
        relationState.setIncomingPendingIds(
          relationState.incomingPendingIds.filter((id) => id !== peerUser.id),
        );
        relationState.setOutgoingPendingIds(
          relationState.outgoingPendingIds.filter((id) => id !== peerUser.id),
        );
      }

      await onSuccess?.(data, username, onMutateResult, context);
    },
  });
};

export const useAcceptFriendRequest = (
  options?: UseMutationOptions<FriendAddedResponse, Error, string>,
) => {
  const addFriendId = useRelationStore((state) => state.addFriendId);
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.acceptRequest(),
    mutationFn: (id: string) => bonfireSdk.relation.acceptFriendRequest(id),
    onSuccess: async (data, id, onMutateResult, context) => {
      // Confirm exact field name on FriendAddedResponse (e.g. data.userId or data.friendId)
      const friendUserId = (data as { userId?: string }).userId ?? id;
      addFriendId(friendUserId);
      await onSuccess?.(data, id, onMutateResult, context);
    },
  });
};

export const useBlockUser = (
  options?: UseMutationOptions<void, Error, string>,
) => {
  const addOutgoingBlockId = useRelationStore(
    (state) => state.addOutgoingBlockId,
  );
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.blockUser(),
    mutationFn: (id: string) => bonfireSdk.relation.blockUser(id),
    onSuccess: async (_data, id, onMutateResult, context) => {
      addOutgoingBlockId(id);
      await onSuccess?.(_data, id, onMutateResult, context);
    },
  });
};

export const useDeleteRelation = (
  options?: UseMutationOptions<void, Error, string>,
) => {
  const removeFriendId = useRelationStore((state) => state.removeFriendId);
  const removeOutgoingBlockId = useRelationStore(
    (state) => state.removeOutgoingBlockId,
  );
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.deleteRelation(),
    mutationFn: (id: string) => bonfireSdk.relation.deleteRelation(id),
    onSuccess: async (_data, id, onMutateResult, context) => {
      const state = useRelationStore.getState();
      removeFriendId(id);
      removeOutgoingBlockId(id);
      state.setIncomingPendingIds(
        state.incomingPendingIds.filter((item) => item !== id),
      );
      state.setOutgoingPendingIds(
        state.outgoingPendingIds.filter((item) => item !== id),
      );
      await onSuccess?.(_data, id, onMutateResult, context);
    },
  });
};
