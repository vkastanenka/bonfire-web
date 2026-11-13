import { z, emailSchema } from "@/validation";
import {
  passwordSchema,
  usernameSchema,
  preferredPresenceSchema,
  preferredPresenceDurationSchema,
  displayNameSchema,
  bioSchema,
  avatarUrlSchema,
  bannerColorSchema,
} from "../validation";

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
  presence: preferredPresenceSchema,
  duration: preferredPresenceDurationSchema,
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
