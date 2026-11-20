import { z } from "zod";
import { presenceSchema } from "../gateway";
import { channelSchema, memberSchema } from "../channel";
import { userSchema } from "../user";

export const friendAddedResponseSchema = z.object({
  channel: channelSchema,
  member: memberSchema,
  peerUser: userSchema,
  peerPresence: presenceSchema,
});

export type FriendAddedResponse = z.infer<typeof friendAddedResponseSchema>;
