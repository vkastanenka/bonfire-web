import { z } from "zod";

export const VALIDATION_LABELS = {
  email: {
    invalid: "Must be a valid email address.",
    max: "Cannot be longer than 255 characters.",
  },
  displayName: {
    min: "Must be at least 3 characters.",
    max: "Cannot be longer than 32 characters.",
  },
  username: {
    min: "Must be at least 4 characters.",
    max: "Cannot be longer than 32 characters.",
    pattern: "Must contain only letters, numbers, underscores, or periods.",
  },
  password: {
    min: "Must be at least 12 characters.",
    max: "Cannot be longer than 128 characters.",
  },
} as const;

export const registerRequestSchema = z.object({
  email: z
    .email(VALIDATION_LABELS.email.invalid)
    .max(255, VALIDATION_LABELS.email.max),

  display_name: z
    .string()
    .max(32, VALIDATION_LABELS.displayName.max)
    .refine((val) => val === "" || val.length >= 3, {
      message: VALIDATION_LABELS.displayName.min,
    })
    .optional(),

  username: z
    .string()
    .min(4, VALIDATION_LABELS.username.min)
    .max(32, VALIDATION_LABELS.username.max)
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9_.]?[a-zA-Z0-9])+$/,
      VALIDATION_LABELS.username.pattern,
    ),

  password: z
    .string()
    .min(12, VALIDATION_LABELS.password.min)
    .max(128, VALIDATION_LABELS.password.max),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  access_token: z.string(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
