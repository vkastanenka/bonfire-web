import { emailSchema, hexColorSchema, urlSchema, z } from "@/lib/validation";

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

export const passwordSchema = z.string().min(12).max(255);
export const displayNameSchema = z.string().min(1).max(32);
export const avatarUrlSchema = urlSchema.optional();
export const bioSchema = z.string().max(190).optional();
export const bannerColorSchema = hexColorSchema.optional();
export const preferredPresenceSchema = z
  .enum(["dnd", "invisible", "offline"])
  .optional();

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
