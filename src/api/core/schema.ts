import { z } from "zod";

export const VALIDATION_LABELS = {
  displayName: "Display name must be at least 6 characters long.",
  username: "Username must be at least 6 characters long.",
  password: "Password must be at least 6 characters long.",
} as const;

export const registerRequestSchema = z.object({
  email: z.email(),
  display_name: z.string().min(6, VALIDATION_LABELS.displayName).optional(),
  username: z.string().min(6, VALIDATION_LABELS.username),
  password: z.string().min(6, VALIDATION_LABELS.password),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  access_token: z.string(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
