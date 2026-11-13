import { z, emailSchema, jwtString } from "@/validation";
import {
  sessionSchema,
  displayNameSchema,
  usernameSchema,
  passwordSchema,
} from "../validation";

export const accessTokenResponseSchema = z.object({
  accessToken: jwtString,
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;

export const registerRequestSchema = z.object({
  email: emailSchema,
  displayName: displayNameSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

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

export const listValidSessionsResponseSchema = z.array(sessionSchema);

export type ListValidSessionsResponse = z.infer<
  typeof listValidSessionsResponseSchema
>;
