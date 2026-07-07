import { z } from "zod";

export const VALIDATION_LABELS = {
  email: {
    invalid: "Please enter a valid email address.",
    max: "Email address cannot exceed 255 characters.",
  },
  displayName: {
    min: "Display name must be at least 3 characters long.",
    max: "Display name cannot exceed 32 characters.",
  },
  username: {
    min: "Username must be at least 4 characters long.",
    max: "Username cannot exceed 32 characters.",
    pattern:
      "Username must start and end with a letter or number, and can only contain dots or underscores in between.",
  },
  password: {
    min: "Password must be at least 12 characters long.",
    max: "Password cannot exceed 128 characters.",
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
