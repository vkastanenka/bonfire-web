import { z } from "zod";
import {
  emailSchema,
  displayNameSchema,
  usernameSchema,
  passwordSchema,
} from "../user/validation";
import { emptyToUndefined } from "../validation";

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

export type RegisterResponseSchema = typeof registerResponseSchema;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  access_token: z.string(),
});

export type LoginResponseSchema = typeof loginResponseSchema;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const refreshResponseSchema = z.object({
  access_token: z.string(),
});

export type RefreshResponseSchema = typeof refreshResponseSchema;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export const verifyEmailRequestSchema = z.object({
  token: z.string(),
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

export const resetPasswordRequestSchema = z.object({
  token: z.string(),
  password: passwordSchema,
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

export const resetPasswordResponseSchema = z.object({
  access_token: z.string(),
});

export type ResetPasswordResponseSchema = typeof resetPasswordResponseSchema;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;

export const wsTicketResponseSchema = z.object({
  ticket: z.uuid(),
});

export type WsTicketResponseSchema = typeof wsTicketResponseSchema;
export type WsTicketResponse = z.infer<typeof wsTicketResponseSchema>;
