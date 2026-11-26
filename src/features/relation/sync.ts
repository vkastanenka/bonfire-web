import {
  type RelationPeerIdPayload,
  type RelationTransitionResponse,
  type FriendAddedPayload,
  type User,
} from "@/bonfire-sdk";
import { useAuthStore } from "@/features/auth";
import { useChannelStore } from "@/features/channels";
import { useUserStore } from "@/features/user";
import { useRelationStore } from "./store";
import {
  sortUserIdsByDisplayName,
  sortUserIdsByDisplayNameWithMe,
} from "./utils";

export const applyTransitionRequestSuccess = (
  data: RelationTransitionResponse,
) => {
  const { channel, membership, peerUser, peerPresence } = data;
  const isNewFriend = Boolean(channel && membership);

  if (isNewFriend) {
    applyFriendAdded({ peerUser, peerPresence, channel, membership });
    return;
  }

  applyOutgoingPendingAdded(peerUser);
};

export const applyOutgoingPendingAdded = (peerUser: User) => {
  const userStore = useUserStore.getState();
  userStore.upsertUser(peerUser);

  const usersMap = {
    ...useUserStore.getState().users,
    [peerUser.id]: peerUser,
  };
  const relationStore = useRelationStore.getState();

  relationStore.setOutgoingPendingIds(
    sortUserIdsByDisplayName(
      [...relationStore.outgoingPendingIds, peerUser.id],
      usersMap,
    ),
  );
};

export const applyIncomingPendingAdded = (peerUser: User) => {
  const userStore = useUserStore.getState();
  userStore.upsertUser(peerUser);

  const usersMap = {
    ...useUserStore.getState().users,
    [peerUser.id]: peerUser,
  };
  const relationStore = useRelationStore.getState();

  relationStore.setIncomingPendingIds(
    sortUserIdsByDisplayName(
      [...relationStore.incomingPendingIds, peerUser.id],
      usersMap,
    ),
  );
};

export const applyFriendAdded = ({
  peerUser,
  peerPresence,
  channel,
  membership,
}: RelationTransitionResponse | FriendAddedPayload) => {
  const userStore = useUserStore.getState();
  userStore.upsertUser(peerUser);
  if (peerPresence) {
    userStore.setUserPresence(peerUser.id, peerPresence);
  }

  const usersMap = {
    ...useUserStore.getState().users,
    [peerUser.id]: peerUser,
  };
  const me = useAuthStore.getState().me;
  const relationStore = useRelationStore.getState();

  if (channel && membership) {
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
  }

  relationStore.setFriendIds(
    sortUserIdsByDisplayName(
      [...relationStore.friendIds, peerUser.id],
      usersMap,
    ),
  );
  relationStore.setIncomingPendingIds(
    relationStore.incomingPendingIds.filter((id) => id !== peerUser.id),
  );
  relationStore.setOutgoingPendingIds(
    relationStore.outgoingPendingIds.filter((id) => id !== peerUser.id),
  );
};

export const applyUserBlocked = ({ peerId }: RelationPeerIdPayload) => {
  const users = useUserStore.getState().users;
  const relationStore = useRelationStore.getState();

  relationStore.setOutgoingBlockIds(
    sortUserIdsByDisplayName(
      [...relationStore.outgoingBlockIds, peerId],
      users,
    ),
  );
  relationStore.setFriendIds(
    relationStore.friendIds.filter((friendId) => friendId !== peerId),
  );
  relationStore.setIncomingPendingIds(
    relationStore.incomingPendingIds.filter(
      (pendingId) => pendingId !== peerId,
    ),
  );
  relationStore.setOutgoingPendingIds(
    relationStore.outgoingPendingIds.filter(
      (pendingId) => pendingId !== peerId,
    ),
  );
};

export const clearRelationPeerId = ({ peerId }: RelationPeerIdPayload) => {
  useRelationStore.setState((state) => ({
    friendIds: state.friendIds.filter((item) => item !== peerId),
    outgoingBlockIds: state.outgoingBlockIds.filter((item) => item !== peerId),
    incomingPendingIds: state.incomingPendingIds.filter(
      (item) => item !== peerId,
    ),
    outgoingPendingIds: state.outgoingPendingIds.filter(
      (item) => item !== peerId,
    ),
  }));
};
