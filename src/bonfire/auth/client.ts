import { Client, type RequestOptions } from "@/http";
import { baseBonfireClient, bonfireClient } from "../client";
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

export class PublicAuthClient {
  protected readonly client: Client;

  constructor(client: Client = baseBonfireClient) {
    this.client = client;
  }

  public register = (
    data: RegisterRequest,
    options?: RequestOptions,
  ): Promise<AccessTokenResponse> => {
    return this.client.post<typeof accessTokenResponseSchema>({
      ...options,
      urlPath: "/auth/register",
      data,
      schema: accessTokenResponseSchema,
    });
  };

  public login = (
    data: LoginRequest,
    options?: RequestOptions,
  ): Promise<AccessTokenResponse> => {
    return this.client.post<typeof accessTokenResponseSchema>({
      ...options,
      urlPath: "/auth/login",
      data,
      schema: accessTokenResponseSchema,
    });
  };

  public refresh = (options?: RequestOptions): Promise<AccessTokenResponse> => {
    return this.client.post<typeof accessTokenResponseSchema>({
      ...options,
      urlPath: "/auth/refresh",
      schema: accessTokenResponseSchema,
    });
  };

  public verify = (
    data: VerifyEmailRequest,
    options?: RequestOptions,
  ): Promise<Me> => {
    return this.client.post<typeof meSchema>({
      ...options,
      urlPath: "/auth/verify",
      data,
      schema: meSchema,
    });
  };

  public forgotPassword = (
    data: ForgotPasswordRequest,
    options?: RequestOptions,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/forgot-password",
      data,
    });
  };

  public resetPassword = (
    data: ResetPasswordRequest,
    options?: RequestOptions,
  ): Promise<AccessTokenResponse> => {
    return this.client.post<typeof accessTokenResponseSchema>({
      ...options,
      urlPath: "/auth/reset-password",
      data,
      schema: accessTokenResponseSchema,
    });
  };
}

export class AuthClient {
  protected readonly client: Client;

  constructor(client: Client = bonfireClient) {
    this.client = client;
  }

  public logout = (options?: RequestOptions): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/logout",
    });
  };

  public resendVerify = (options?: RequestOptions): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/resend-verify",
    });
  };

  public listValidSessions = (
    options?: RequestOptions,
  ): Promise<ListValidSessionsResponse> => {
    return this.client.get<typeof listValidSessionsResponseSchema>({
      ...options,
      urlPath: "/users/@me/sessions",
      schema: listValidSessionsResponseSchema,
    });
  };

  public revokeAllSessions = (options?: RequestOptions): Promise<unknown> => {
    return this.client.delete({
      ...options,
      urlPath: "/users/@me/sessions",
    });
  };

  public revokeSession = (
    id: string,
    options?: RequestOptions,
  ): Promise<unknown> => {
    return this.client.delete({
      ...options,
      urlPath: `/users/@me/sessions/${id}`,
    });
  };
}

export const publicAuthClient = new PublicAuthClient();
export const authClient = new AuthClient();
