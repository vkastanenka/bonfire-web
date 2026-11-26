import type { Channel, Member } from "../channel";
import type { Presence } from "../gateway";
import type { User } from "../user";

export const relationMessageTypes = {
  friendRequestSent: "relation.friend_request_sent",
  friendRequestReceived: "relation.friend_request_received",
  friendRequestDeleted: "relation.friend_request_deleted",
  friendAdded: "relation.friend_added",
  friendDeleted: "relation.friend_deleted",
  userBlocked: "relation.user_blocked",
  blockDeleted: "relation.block_deleted",
} as const;

export type RelationMessageType =
  (typeof relationMessageTypes)[keyof typeof relationMessageTypes];

export interface FriendRequestPayload {
  peerUser: User;
}

export interface FriendAddedPayload {
  channel?: Channel;
  membership?: Member;
  peerUser: User;
  peerPresence: Presence;
}

export interface RelationPeerIdPayload {
  peerId: string;
}
