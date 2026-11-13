import { type HttpClientRequestOptions } from "@/http";
import {
  type RegisterRequest,
  type AccessTokenResponse,
  accessTokenResponseSchema,
  type LoginRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type VerifyEmailRequest,
  type ListValidSessionsResponse,
  listValidSessionsResponseSchema,
} from "./validation";
import { BaseService } from "../shared";
import { type Me, meSchema } from "../validation";

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
    options?: HttpClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> {
    return this.httpClient.post<AccessTokenResponse>({
      ...options,
      urlPath: endpoints.register,
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  }

  public login(
    data: LoginRequest,
    options?: HttpClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> {
    return this.httpClient.post<AccessTokenResponse>({
      ...options,
      urlPath: endpoints.login,
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  }

  public refresh(
    options?: HttpClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> {
    return this.httpClient.post<AccessTokenResponse>({
      ...options,
      urlPath: endpoints.refresh,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  }

  public verify(
    data: VerifyEmailRequest,
    options?: HttpClientRequestOptions<Me>,
  ): Promise<Me> {
    return this.httpClient.post<Me>({
      ...options,
      urlPath: endpoints.verify,
      data,
      schema: meSchema,
      protected: false,
    });
  }

  public forgotPassword(
    data: ForgotPasswordRequest,
    options?: HttpClientRequestOptions<void>,
  ): Promise<void> {
    return this.httpClient.post<void>({
      ...options,
      urlPath: endpoints.forgotPassword,
      data,
      protected: false,
    });
  }

  public resetPassword(
    data: ResetPasswordRequest,
    options?: HttpClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> {
    return this.httpClient.post<AccessTokenResponse>({
      ...options,
      urlPath: endpoints.resetPassword,
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  }

  public logout(options?: HttpClientRequestOptions<void>): Promise<void> {
    return this.httpClient.post<void>({
      ...options,
      urlPath: endpoints.logout,
    });
  }

  public resendVerify(options?: HttpClientRequestOptions<void>): Promise<void> {
    return this.httpClient.post<void>({
      ...options,
      urlPath: endpoints.resendVerify,
    });
  }

  public listValidSessions(
    options?: HttpClientRequestOptions<ListValidSessionsResponse>,
  ): Promise<ListValidSessionsResponse> {
    return this.httpClient.get<ListValidSessionsResponse>({
      ...options,
      urlPath: endpoints.sessions,
      schema: listValidSessionsResponseSchema,
    });
  }

  public revokeAllSessions(
    options?: HttpClientRequestOptions<void>,
  ): Promise<void> {
    return this.httpClient.delete<void>({
      ...options,
      urlPath: endpoints.sessions,
    });
  }

  public revokeSession(
    id: string,
    options?: HttpClientRequestOptions<void>,
  ): Promise<void> {
    const encodedId = encodeURIComponent(id);
    return this.httpClient.delete<void>({
      ...options,
      urlPath: `${endpoints.sessions}/${encodedId}`,
    });
  }
}
