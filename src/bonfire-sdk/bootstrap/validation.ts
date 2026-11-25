import { z } from "../validation";
import { meSchema, userSchema } from "../user";
import { channelSchema, memberSchema } from "../channel";
import { presenceSchema } from "../gateway";

export const bootstrapResponseSchema = z.object({
  me: meSchema,
  outgoingPendingIds: z.array(z.uuid()),
  incomingPendingIds: z.array(z.uuid()),
  friendIds: z.array(z.uuid()),
  outgoingBlockIds: z.array(z.uuid()),
  userChannelMembers: z.record(z.uuid(), memberSchema),
  channels: z.record(z.uuid(), channelSchema),
  channelMemberIds: z.record(z.uuid(), z.array(z.uuid())),
  sidebarIds: z.array(z.uuid()),
  peers: z.record(z.uuid(), userSchema),
  peerPresences: z.record(z.uuid(), presenceSchema),
});

export type BootstrapResponse = z.infer<typeof bootstrapResponseSchema>;
