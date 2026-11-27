import { z } from "zod";
import { presenceSchema } from "../gateway";
import { channelSchema, memberSchema } from "../channel";
import { usernameSchema, userSchema } from "../user";

export const sendFriendRequestSchema = z.object({
  username: usernameSchema,
});

export type SendFriendRequest = z.infer<typeof sendFriendRequestSchema>;

export const relationTransitionResponseSchema = z.object({
  channel: channelSchema.optional(),
  membership: memberSchema.optional(),
  peerUser: userSchema,
  peerPresence: presenceSchema.optional(),
});

export type RelationTransitionResponse = z.infer<
  typeof relationTransitionResponseSchema
>;
