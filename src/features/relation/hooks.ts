import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  type Channel,
  type Member,
  type Presence,
  type RelationTransitionResponse,
  type User,
} from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import {
  applyFriendAdded,
  applyTransitionRequestSuccess,
  applyUserBlocked,
  clearRelationPeerId,
} from "./sync";

export const relationKeys = {
  all: ["relations"] as const,
  sendRequest: () => [...relationKeys.all, "sendRequest"] as const,
  acceptRequest: () => [...relationKeys.all, "acceptRequest"] as const,
  blockUser: () => [...relationKeys.all, "blockUser"] as const,
  deleteRelation: () => [...relationKeys.all, "deleteRelation"] as const,
};

export interface FriendAddedStateInput {
  peerUser: User;
  peerPresence?: Presence | null;
  channel?: Channel | null;
  membership?: Member | null;
}

export const useSendFriendRequest = (
  options?: UseMutationOptions<RelationTransitionResponse, Error, string>,
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
      applyFriendAdded(data);
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
      applyUserBlocked({ peerId: id });
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
      clearRelationPeerId({ peerId: id });
      await onSuccess?.(_data, id, onMutateResult, context);
    },
  });
};
