import { BaseService, type ServiceCallOptions } from "../shared";
import { type Me, meSchema } from "../validation";
import {
  accessTokenResponseSchema,
  listValidSessionsResponseSchema,
  type AccessTokenResponse,
  type ForgotPasswordRequest,
  type ListValidSessionsResponse,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
  type VerifyEmailRequest,
} from "./validation";

const endpoints = {
  register: "/auth/register",
  login: "/auth/login",
  refresh: "/auth/refresh",
  verify: "/auth/verify",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  logout: "/auth/logout",
  resendVerify: "/auth/resend-verify",
  sessions: "/users/@me/sessions",
} as const;

export class AuthService extends BaseService {
  public register(
    data: RegisterRequest,
    options?: ServiceCallOptions,
  ): Promise<AccessTokenResponse> {
    return this.post({
      ...options,
      url: endpoints.register,
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  }

  public login(
    data: LoginRequest,
    options?: ServiceCallOptions,
  ): Promise<AccessTokenResponse> {
    return this.post({
      ...options,
      url: endpoints.login,
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  }

  public refresh(options?: ServiceCallOptions): Promise<AccessTokenResponse> {
    return this.post({
      ...options,
      url: endpoints.refresh,
      schema: accessTokenResponseSchema,
      protected: false,
      retry: {
        ...options?.retry,
        maxAttempts: 1,
      },
    });
  }

  public verify(
    data: VerifyEmailRequest,
    options?: ServiceCallOptions,
  ): Promise<Me> {
    return this.post({
      ...options,
      url: endpoints.verify,
      data,
      schema: meSchema,
      protected: false,
    });
  }

  public forgotPassword(
    data: ForgotPasswordRequest,
    options?: ServiceCallOptions,
  ): Promise<void> {
    return this.post({
      ...options,
      url: endpoints.forgotPassword,
      data,
      protected: false,
    });
  }

  public resetPassword(
    data: ResetPasswordRequest,
    options?: ServiceCallOptions,
  ): Promise<AccessTokenResponse> {
    return this.post({
      ...options,
      url: endpoints.resetPassword,
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  }

  public logout(options?: ServiceCallOptions): Promise<void> {
    return this.post({
      ...options,
      url: endpoints.logout,
    });
  }

  public resendVerify(options?: ServiceCallOptions): Promise<void> {
    return this.post({
      ...options,
      url: endpoints.resendVerify,
    });
  }

  public listValidSessions(
    options?: ServiceCallOptions,
  ): Promise<ListValidSessionsResponse> {
    return this.get({
      ...options,
      url: endpoints.sessions,
      schema: listValidSessionsResponseSchema,
    });
  }

  public revokeAllSessions(options?: ServiceCallOptions): Promise<void> {
    return this.delete({
      ...options,
      url: endpoints.sessions,
    });
  }

  public revokeSession(
    sessionId: string,
    options?: ServiceCallOptions,
  ): Promise<void> {
    return this.delete({
      ...options,
      url: `${endpoints.sessions}/${encodeURIComponent(sessionId)}`,
    });
  }
}
