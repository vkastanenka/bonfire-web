import { z, emailSchema } from "@/lib";
import { displayNameSchema, usernameSchema, passwordSchema } from "../user";

export const sessionSchema = z.object({
  id: z.uuid(),
  isCurrent: z.boolean(),
  clientIp: z.string(),
  userAgent: z.string(),
  os: z.string(),
  client: z.string(),
  expiresAt: z.coerce.date(),
  lastSeenAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type Session = z.infer<typeof sessionSchema>;

export const accessTokenResponseSchema = z.object({
  accessToken: z.string(),
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

// export const authGatewayMessageSchemas = {
//   "auth.session_revoked": z.object({
//     userID: z.uuid(),
//     revokeSessionID: z.uuid(),
//   }),

//   "auth.session_revoked_all": z.null(),
// } as const;

// export type AuthGatewayPayloads = {
//   [K in keyof typeof authGatewayMessageSchemas]: z.infer<
//     (typeof authGatewayMessageSchemas)[K]
//   >;
// };

// export type AuthGatewayMessageType = keyof AuthGatewayPayloads;
