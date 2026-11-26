import { z, urlSchema } from "../validation";

export const channelTypes = {
  direct: "DIRECT",
  group: "GROUP",
} as const;

export type ChannelType = (typeof channelTypes)[keyof typeof channelTypes];

export const channelTypeSchema = z.enum(channelTypes);

export const muteDurations = {
  fifteenMin: "15_MIN",
  oneHour: "1_HOUR",
  eightHours: "8_HOURS",
  twentyFourHours: "24_HOURS",
  threeDays: "3_DAYS",
  forever: "FOREVER",
} as const;

export type MuteDuration = (typeof muteDurations)[keyof typeof muteDurations];

export const muteDurationSchema = z.enum(muteDurations);

export const channelSchema = z.object({
  id: z.uuid(),
  type: channelTypeSchema,
  ownerId: z.uuid().optional(),
  name: z.string().trim().min(1).max(100).optional(),
  iconUrl: urlSchema.optional(),
  lastMessageId: z.uuid().optional(),
  lastMessageAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Channel = z.infer<typeof channelSchema>;

export const memberSchema = z.object({
  channelId: z.uuid(),
  userId: z.uuid(),
  lastReadMessageId: z.uuid().optional(),
  lastReadMessageAt: z.coerce.date(),
  mutedUntil: z.coerce.date().optional(),
  pinnedAt: z.coerce.date().optional(),
  mentionCount: z.number().int().min(0),
  isVisible: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Member = z.infer<typeof memberSchema>;
