import { Client, type RequestOptions } from "@/http";
import { baseBonfireClient, bonfireClient } from "../client";
import {
  type RegisterRequest,
  type RegisterResponse,
  registerResponseSchema,
  type LoginRequest,
  type LoginResponse,
  loginResponseSchema,
  type RefreshResponse,
  refreshResponseSchema,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  resetPasswordResponseSchema,
  type VerifyEmailRequest,
  verifyEmailRequestSchema,
  type WsTicketResponse,
  wsTicketResponseSchema,
} from "./validation";

export class PublicAuthClient {
  protected readonly client: Client;

  constructor(client: Client = baseBonfireClient) {
    this.client = client;
  }

  public register = (
    data: RegisterRequest,
    options?: RequestOptions,
  ): Promise<RegisterResponse> => {
    return this.client.post<typeof registerResponseSchema>({
      ...options,
      urlPath: "/auth/register",
      data,
      schema: registerResponseSchema,
    });
  };

  public login = (
    data: LoginRequest,
    options?: RequestOptions,
  ): Promise<LoginResponse> => {
    return this.client.post<typeof loginResponseSchema>({
      ...options,
      urlPath: "/auth/login",
      data,
      schema: loginResponseSchema,
    });
  };

  public refresh = (options?: RequestOptions): Promise<RefreshResponse> => {
    return this.client.post<typeof refreshResponseSchema>({
      ...options,
      urlPath: "/auth/refresh",
      schema: refreshResponseSchema,
    });
  };

  public verify = (
    data: VerifyEmailRequest,
    options?: RequestOptions,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/verify",
      data,
      schema: verifyEmailRequestSchema,
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
  ): Promise<ResetPasswordResponse> => {
    return this.client.post<typeof resetPasswordResponseSchema>({
      ...options,
      urlPath: "/auth/reset-password",
      data,
      schema: resetPasswordResponseSchema,
    });
  };
}

export class AuthClient {
  protected readonly client: Client;

  constructor(client: Client = bonfireClient) {
    this.client = client;
  }

  public resendVerify = (options?: RequestOptions): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/auth/resend-verify",
    });
  };

  public wsTicket = (options?: RequestOptions): Promise<WsTicketResponse> => {
    return this.client.post<typeof wsTicketResponseSchema>({
      ...options,
      urlPath: "/auth/ws-ticket",
      schema: wsTicketResponseSchema,
    });
  };
}

export const publicAuthClient = new PublicAuthClient();
export const authClient = new AuthClient();
