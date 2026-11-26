import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { type RelationTransitionResponse } from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import { useAuthStore } from "@/features/auth";
import { useChannelStore } from "@/features/channels";
import { useUserStore } from "@/features/user";
import { useRelationStore } from "./store";
import {
  sortUserIdsByDisplayName,
  sortUserIdsByDisplayNameWithMe,
} from "./utils";

export const relationKeys = {
  all: ["relations"] as const,
  sendRequest: () => [...relationKeys.all, "sendRequest"] as const,
  acceptRequest: () => [...relationKeys.all, "acceptRequest"] as const,
  blockUser: () => [...relationKeys.all, "blockUser"] as const,
  deleteRelation: () => [...relationKeys.all, "deleteRelation"] as const,
};

export const useSendFriendRequest = (
  options?: UseMutationOptions<
    RelationTransitionResponse | null,
    Error,
    string
  >,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.sendRequest(),
    mutationFn: (username: string) =>
      bonfireSdk.relation.sendFriendRequest(username),
    onSuccess: async (data, username, onMutateResult, context) => {
      applyTransitionRequestSuccess(data);
      await onSuccess?.(data, username, onMutateResult, context);
    },
  });
};

export const useAcceptFriendRequest = (
  options?: UseMutationOptions<RelationTransitionResponse, Error, string>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.acceptRequest(),
    mutationFn: (id: string) => bonfireSdk.relation.acceptFriendRequest(id),
    onSuccess: async (data, id, onMutateResult, context) => {
      applyTransitionRequestSuccess(data);
      await onSuccess?.(data, id, onMutateResult, context);
    },
  });
};

export const useBlockUser = (
  options?: UseMutationOptions<void, Error, string>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.blockUser(),
    mutationFn: (id: string) => bonfireSdk.relation.blockUser(id),
    onSuccess: async (_data, id, onMutateResult, context) => {
      const users = useUserStore.getState().users;
      const relationStore = useRelationStore.getState();

      relationStore.setOutgoingBlockIds(
        sortUserIdsByDisplayName(
          [...relationStore.outgoingBlockIds, id],
          users,
        ),
      );
      relationStore.setFriendIds(
        relationStore.friendIds.filter((friendId) => friendId !== id),
      );
      relationStore.setIncomingPendingIds(
        relationStore.incomingPendingIds.filter(
          (pendingId) => pendingId !== id,
        ),
      );
      relationStore.setOutgoingPendingIds(
        relationStore.outgoingPendingIds.filter(
          (pendingId) => pendingId !== id,
        ),
      );

      await onSuccess?.(_data, id, onMutateResult, context);
    },
  });
};

export const useDeleteRelation = (
  options?: UseMutationOptions<void, Error, string>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: relationKeys.deleteRelation(),
    mutationFn: (id: string) => bonfireSdk.relation.deleteRelation(id),
    onSuccess: async (_data, id, onMutateResult, context) => {
      useRelationStore.setState((state) => ({
        friendIds: state.friendIds.filter((item) => item !== id),
        outgoingBlockIds: state.outgoingBlockIds.filter((item) => item !== id),
        incomingPendingIds: state.incomingPendingIds.filter(
          (item) => item !== id,
        ),
        outgoingPendingIds: state.outgoingPendingIds.filter(
          (item) => item !== id,
        ),
      }));

      await onSuccess?.(_data, id, onMutateResult, context);
    },
  });
};

const applyTransitionRequestSuccess = (data: RelationTransitionResponse) => {
  const { channel, membership, peerUser, peerPresence } = data;

  const userStore = useUserStore.getState();
  userStore.upsertUser(peerUser);

  const usersMap = {
    ...useUserStore.getState().users,
    [peerUser.id]: peerUser,
  };
  const me = useAuthStore.getState().me;
  const relationStore = useRelationStore.getState();

  const isNewFriend = Boolean(channel && membership);

  if (isNewFriend && channel && membership) {
    if (peerPresence) {
      userStore.setUserPresence(peerUser.id, peerPresence);
    }

    const authStore = useAuthStore.getState();
    authStore.setChannelMemberships({
      ...authStore.channelMemberships,
      [membership.channelId]: membership,
    });

    const channelStore = useChannelStore.getState();
    const existingMemberIds = channelStore.channelMemberIds[channel.id] ?? [];
    const sortedMemberIds = sortUserIdsByDisplayNameWithMe(
      [...existingMemberIds, membership.userId, peerUser.id],
      me,
      usersMap,
    );

    channelStore.setChannels({
      ...channelStore.channels,
      [channel.id]: channel,
    });
    channelStore.setChannelMemberIds({
      ...channelStore.channelMemberIds,
      [channel.id]: sortedMemberIds,
    });

    const nextFriendIds = sortUserIdsByDisplayNameWithMe(
      [...relationStore.friendIds, peerUser.id],
      me,
      usersMap,
    );

    relationStore.setFriendIds(nextFriendIds);
    relationStore.setIncomingPendingIds(
      relationStore.incomingPendingIds.filter((id) => id !== peerUser.id),
    );
    relationStore.setOutgoingPendingIds(
      relationStore.outgoingPendingIds.filter((id) => id !== peerUser.id),
    );
    return;
  }

  const nextOutgoingPendingIds = sortUserIdsByDisplayNameWithMe(
    [...relationStore.outgoingPendingIds, peerUser.id],
    me,
    usersMap,
  );

  relationStore.setOutgoingPendingIds(nextOutgoingPendingIds);
};
