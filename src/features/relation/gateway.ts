import { useEffect } from "react";
import {
  relationMessageTypes,
  type FriendAddedPayload,
  type FriendRequestPayload,
  type RelationPeerIdPayload,
} from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import {
  applyFriendAdded,
  applyIncomingPendingAdded,
  applyOutgoingPendingAdded,
  applyUserBlocked,
  clearRelationPeerId,
} from "./sync";

export const useRelationGatewayEvents = () => {
  useEffect(() => {
    const unregisterFriendRequestSent =
      bonfireSdk.gateway.registerMessageHandler<FriendRequestPayload>(
        relationMessageTypes.friendRequestSent,
        (payload) => applyOutgoingPendingAdded(payload.peerUser),
      );

    const unregisterFriendRequestReceived =
      bonfireSdk.gateway.registerMessageHandler<FriendRequestPayload>(
        relationMessageTypes.friendRequestReceived,
        (payload) => applyIncomingPendingAdded(payload.peerUser),
      );

    const unregisterFriendRequestDeleted =
      bonfireSdk.gateway.registerMessageHandler<RelationPeerIdPayload>(
        relationMessageTypes.friendRequestDeleted,
        clearRelationPeerId,
      );

    const unregisterFriendAdded =
      bonfireSdk.gateway.registerMessageHandler<FriendAddedPayload>(
        relationMessageTypes.friendAdded,
        applyFriendAdded,
      );

    const unregisterFriendDeleted =
      bonfireSdk.gateway.registerMessageHandler<RelationPeerIdPayload>(
        relationMessageTypes.friendDeleted,
        clearRelationPeerId,
      );

    const unregisterUserBlocked =
      bonfireSdk.gateway.registerMessageHandler<RelationPeerIdPayload>(
        relationMessageTypes.userBlocked,
        applyUserBlocked,
      );

    const unregisterBlockDeleted =
      bonfireSdk.gateway.registerMessageHandler<RelationPeerIdPayload>(
        relationMessageTypes.blockDeleted,
        clearRelationPeerId,
      );

    return () => {
      unregisterFriendRequestSent();
      unregisterFriendRequestReceived();
      unregisterFriendRequestDeleted();
      unregisterFriendAdded();
      unregisterFriendDeleted();
      unregisterUserBlocked();
      unregisterBlockDeleted();
    };
  }, []);
};
