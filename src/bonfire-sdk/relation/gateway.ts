import type { Channel, Member } from "../channel";
import type { Presence } from "../gateway";
import type { User } from "../user";

export const relationMessageTypes = {
  friendRequestSent: "relation.friend_request_sent",
  friendRequestDeleted: "relation.friend_request_deleted",
  friendAdded: "relation.friend_added",
  friendDeleted: "relation.friend_deleted",
  userBlocked: "relation.user_blocked",
} as const;

export type RelationMessageType =
  (typeof relationMessageTypes)[keyof typeof relationMessageTypes];

export interface FriendRequestSentPayload {
  user: User;
}

export interface FriendAddedPayload {
  user: User;
  presence: Presence;
  channel?: Channel;
  member?: Member;
}

export interface RelationUserIDPayload {
  userId: string;
}
