import { z, emailSchema, hexColorSchema, urlSchema } from "./base";

export const validationErrors = {
  username:
    "Must start and end with a letter or number. May contain only letters, numbers, and non-consecutive underscores or periods.",
};

export const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_.]?[a-zA-Z0-9])+$/;

export const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(usernameRegex, validationErrors.username);

export const passwordSchema = z.string().min(12).max(64);

export const displayNameSchema = z.string().min(1).max(32);

export const avatarUrlSchema = urlSchema.optional();

export const bioSchema = z.string().max(190).optional();

export const bannerColorSchema = hexColorSchema.optional();

/**
 * TODO: Base off presence
 */

export const preferredPresenceSchema = z
  .enum(["IDLE", "DND", "INVISIBLE"])
  .optional();

export const preferredPresenceDurationSchema = z
  .enum(["15_MIN", "1_HOUR", "8_HOURS", "24_HOURS", "3_DAYS", "FOREVER"])
  .optional();

export const userSummarySchema = z.object({
  id: z.uuid(),
  username: usernameSchema,
  displayName: displayNameSchema,
  avatarUrl: avatarUrlSchema,
  isDisabled: z.boolean(),
});

export type UserSummary = z.infer<typeof userSummarySchema>;

export const userSchema = z.object({
  id: z.uuid(),
  username: usernameSchema,
  displayName: displayNameSchema,
  avatarUrl: avatarUrlSchema,
  bio: bioSchema,
  bannerColor: bannerColorSchema,
  isDisabled: z.boolean(),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

export const meSchema = z.object({
  id: z.uuid(),
  email: emailSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
  avatarUrl: avatarUrlSchema,
  bio: bioSchema,
  bannerColor: bannerColorSchema,
  isVerified: z.boolean(),
  verifiedAt: z.coerce.date().optional(),
  preferredPresence: preferredPresenceSchema,
  preferredPresenceUntil: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Me = z.infer<typeof meSchema>;
