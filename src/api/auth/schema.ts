import { z } from "zod";
import {
  displayNameSchema,
  emailSchema,
  emptyToUndefined,
  passwordSchema,
  usernameSchema,
} from "../pkg";

export const registerRequestSchema = z.object({
  email: emailSchema,
  display_name: emptyToUndefined(displayNameSchema),
  username: usernameSchema,
  password: passwordSchema,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  access_token: z.string(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  access_token: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const refreshResponseSchema = z.object({
  access_token: z.string(),
});

export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export const wsTicketResponseSchema = z.object({
  ticket: z.uuid(),
});

export type WSTicketResponse = z.infer<typeof wsTicketResponseSchema>;
