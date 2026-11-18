import { presences } from "../gateway";
import { z, emailSchema, hexColorSchema, urlSchema } from "../validation";

export const messages = {
  username:
    "Must start and end with a letter or number. May contain only letters, numbers, and non-consecutive underscores or periods.",
};

export const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_.]?[a-zA-Z0-9])+$/;

export const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(usernameRegex, messages.username);

export const passwordSchema = z.string().min(12).max(64);

export const displayNameSchema = z.string().min(1).max(32);

export const avatarUrlSchema = urlSchema.optional();

export const bioSchema = z.string().max(190).optional();

export const bannerColorSchema = hexColorSchema.optional();

export const preferredPresenceSchema = z.enum([
  presences.idle,
  presences.dnd,
  presences.invisible,
]);
export type PreferredPresence = z.infer<typeof preferredPresenceSchema>;

export const optionalPreferredPresenceSchema =
  preferredPresenceSchema.optional();
export type OptionalPreferredPresence = z.infer<
  typeof optionalPreferredPresenceSchema
>;

export const preferredPresenceDurations = {
  fifteenMin: "15_MIN",
  oneHour: "1_HOUR",
  eightHours: "8_HOURS",
  twentyFourHours: "24_HOURS",
  threeDays: "3_DAYS",
  forever: "FOREVER",
} as const;

export const preferredPresenceDurationSchema = z.enum(
  preferredPresenceDurations,
);
export type PreferredPresenceDuration =
  (typeof preferredPresenceDurations)[keyof typeof preferredPresenceDurations];

export const optionalPreferredPresenceDurationSchema =
  preferredPresenceDurationSchema.optional();
export type OptionalPreferredPresenceDuration = z.infer<
  typeof optionalPreferredPresenceDurationSchema
>;

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
  preferredPresence: optionalPreferredPresenceSchema,
  preferredPresenceUntil: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Me = z.infer<typeof meSchema>;

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

export const updatePasswordRequestSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    newPasswordConfirm: passwordSchema,
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords must match",
    path: ["newPasswordConfirm"],
  });

export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>;

export const updatePreferredPresenceRequestSchema = z.object({
  presence: optionalPreferredPresenceSchema,
  duration: optionalPreferredPresenceDurationSchema,
});

export type UpdatePreferredPresenceRequest = z.infer<
  typeof updatePreferredPresenceRequestSchema
>;

export const updateProfileRequestSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema.optional(),
  avatarUrl: avatarUrlSchema.optional(),
  bannerColor: bannerColorSchema.optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const disableRequestSchema = z.object({
  password: passwordSchema,
});

export type DisableRequest = z.infer<typeof disableRequestSchema>;
