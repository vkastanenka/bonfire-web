import { Client, type ClientRequestOptions } from "@/http";
import { bonfireClient } from "../client";
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
import { type Me, meSchema } from "../user";

export class AuthClient {
  protected readonly client: Client;

  constructor(client: Client = bonfireClient) {
    this.client = client;
  }

  public register = (
    data: RegisterRequest,
    options?: ClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> => {
    return this.client.post<AccessTokenResponse>({
      ...options,
      urlPath: "/auth/register",
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  };

  public login = (
    data: LoginRequest,
    options?: ClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> => {
    return this.client.post<AccessTokenResponse>({
      ...options,
      urlPath: "/auth/login",
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  };

  public refresh = (
    options?: ClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> => {
    return this.client.post<AccessTokenResponse>({
      ...options,
      urlPath: "/auth/refresh",
      schema: accessTokenResponseSchema,
      protected: false,
    });
  };

  public verify = (
    data: VerifyEmailRequest,
    options?: ClientRequestOptions<Me>,
  ): Promise<Me> => {
    return this.client.post<Me>({
      ...options,
      urlPath: "/auth/verify",
      data,
      schema: meSchema,
      protected: false,
    });
  };

  public forgotPassword = (
    data: ForgotPasswordRequest,
    options?: ClientRequestOptions<unknown>,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/forgot-password",
      data,
      protected: false,
    });
  };

  public resetPassword = (
    data: ResetPasswordRequest,
    options?: ClientRequestOptions<AccessTokenResponse>,
  ): Promise<AccessTokenResponse> => {
    return this.client.post<AccessTokenResponse>({
      ...options,
      urlPath: "/auth/reset-password",
      data,
      schema: accessTokenResponseSchema,
      protected: false,
    });
  };

  public logout = (
    options?: ClientRequestOptions<unknown>,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/logout",
    });
  };

  public resendVerify = (
    options?: ClientRequestOptions<unknown>,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/resend-verify",
    });
  };

  public listValidSessions = (
    options?: ClientRequestOptions<ListValidSessionsResponse>,
  ): Promise<ListValidSessionsResponse> => {
    return this.client.get<ListValidSessionsResponse>({
      ...options,
      urlPath: "/users/@me/sessions",
      schema: listValidSessionsResponseSchema,
    });
  };

  public revokeAllSessions = (
    options?: ClientRequestOptions<unknown>,
  ): Promise<unknown> => {
    return this.client.delete({
      ...options,
      urlPath: "/users/@me/sessions",
    });
  };

  public revokeSession = (
    id: string,
    options?: ClientRequestOptions<unknown>,
  ): Promise<unknown> => {
    return this.client.delete({
      ...options,
      urlPath: `/users/@me/sessions/${id}`,
    });
  };
}

export const authClient = new AuthClient();
