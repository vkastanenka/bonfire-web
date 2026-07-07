import { z } from "zod";

export const emptyToUndefined = <T extends z.ZodString>(stringSchema: T) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    stringSchema.optional(),
  );

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
    min: "Must be at least 3 characters.",
    max: "Cannot be longer than 32 characters.",
    pattern:
      "Must start and end with a letter or number. May contain only letters, numbers, and non-consecutive underscores or periods.",
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

  display_name: emptyToUndefined(
    z
      .string()
      .min(3, VALIDATION_LABELS.displayName.min)
      .max(32, VALIDATION_LABELS.displayName.max),
  ),

  username: z
    .string()
    .min(3, VALIDATION_LABELS.username.min)
    .max(32, VALIDATION_LABELS.username.max)
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9_.]?[a-zA-Z0-9])+$/,
      VALIDATION_LABELS.username.pattern,
    ),

  password: z
    .string()
    .min(12, VALIDATION_LABELS.password.min)
    .max(255, VALIDATION_LABELS.password.max),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  access_token: z.string(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
