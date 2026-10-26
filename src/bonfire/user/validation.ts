import { emailSchema, hexColorSchema, urlSchema, z } from "@/validation";

export const VALIDATION_ERRORS = {
  username:
    "Must start and end with a letter or number. May contain only letters, numbers, and non-consecutive underscores or periods.",
};

export const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_.]?[a-zA-Z0-9])+$/;

export const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(usernameRegex, VALIDATION_ERRORS.username);

export const passwordSchema = z.string().min(12).max(64);
export const displayNameSchema = z.string().min(1).max(32);
export const avatarUrlSchema = urlSchema.optional();
export const bioSchema = z.string().max(190).optional();
export const bannerColorSchema = hexColorSchema.optional();
export const preferredPresenceSchema = z
  .enum(["BUSY", "DND", "INVISIBLE"])
  .optional();
export const preferredPresenceDurationSchema = z
  .enum(["15_MIN", "1_HOUR", "8_HOURS", "24_HOURS", "3_DAYS", "FOREVER"])
  .optional();

export const updateEmailRequestSchema = z.object({
  newEmail: emailSchema,
  password: passwordSchema,
});

export type UpdateEmailRequest = z.infer<typeof updateEmailRequestSchema>;

export const updateUsernameRequestSchema = z.object({
  newUsername: usernameSchema,
  password: passwordSchema,
});

export type UpdateUsernameRequest = z.infer<typeof updateUsernameRequestSchema>;

export const updatePasswordRequestSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  newPasswordConfirm: passwordSchema,
});

export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>;

export const updatePreferredPresenceRequestSchema = z.object({
  preferredPresence: preferredPresenceSchema,
  preferredPresenceDurationSchema: preferredPresenceDurationSchema,
});

export type UpdatePreferredPresenceRequest = z.infer<
  typeof updatePreferredPresenceRequestSchema
>;

export const updateProfileRequestSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema,
  avatarUrl: avatarUrlSchema,
  bannerColor: bannerColorSchema,
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const disableRequestSchema = z.object({
  password: passwordSchema,
});

export type DisableRequest = z.infer<typeof disableRequestSchema>;

export const summarySchema = z.object({
  id: z.uuid(),
  username: usernameSchema,
  displayName: displayNameSchema,
  avatarUrl: avatarUrlSchema,
  isDisabled: z.boolean(),
});

export type Summary = z.infer<typeof summarySchema>;

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

// export const userSummaryMapSchema = z.record(z.uuid(), userSummarySchema);
// export type UserSummaryMap = z.infer<typeof userSummaryMapSchema>;

// export const userViewMapSchema = z.record(z.uuid(), userViewSchema);
// export type UserViewMap = z.infer<typeof userViewMapSchema>;
