import * as http from "@/http";
import { BaseService } from "../service";
import { baseBonfireClient, bonfireClient } from "../client";
import {
  type RegisterRequest,
  type RegisterResponse,
  type RegisterResponseSchema,
  registerResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type LoginResponseSchema,
  loginResponseSchema,
  type RefreshResponse,
  type RefreshResponseSchema,
  refreshResponseSchema,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type ResetPasswordResponseSchema,
  resetPasswordResponseSchema,
  type VerifyEmailRequest,
  verifyEmailRequestSchema,
  type WsTicketResponse,
  type WsTicketResponseSchema,
  wsTicketResponseSchema,
} from "./validation";

export class PublicAuthService extends BaseService {
  protected readonly routePrefix = "/auth";

  constructor(client: http.Client = baseBonfireClient) {
    super(client);
  }

  public register = (
    data: RegisterRequest,
    options?: http.RequestOptions,
  ): Promise<RegisterResponse> => {
    return this.client.post<RegisterResponseSchema>({
      ...options,
      urlPath: this.url("/register"),
      data,
      schema: registerResponseSchema,
    });
  };

  public login = (
    data: LoginRequest,
    options?: http.RequestOptions,
  ): Promise<LoginResponse> => {
    return this.client.post<LoginResponseSchema>({
      ...options,
      urlPath: this.url("/login"),
      data,
      schema: loginResponseSchema,
    });
  };

  public refresh = (
    options?: http.RequestOptions,
  ): Promise<RefreshResponse> => {
    return this.client.post<RefreshResponseSchema>({
      ...options,
      urlPath: this.url("/refresh"),
      schema: refreshResponseSchema,
    });
  };

  public verify = (
    data: VerifyEmailRequest,
    options?: http.RequestOptions,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: this.url("/verify"),
      data,
      schema: verifyEmailRequestSchema,
    });
  };

  public forgotPassword = (
    data: ForgotPasswordRequest,
    options?: http.RequestOptions,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: this.url("/forgot-password"),
      data,
    });
  };

  public resetPassword = (
    data: ResetPasswordRequest,
    options?: http.RequestOptions,
  ): Promise<ResetPasswordResponse> => {
    return this.client.post<ResetPasswordResponseSchema>({
      ...options,
      urlPath: this.url("/reset-password"),
      data,
      schema: resetPasswordResponseSchema,
    });
  };
}

export class AuthService extends BaseService {
  protected readonly routePrefix = "/auth";

  constructor(client: http.Client = bonfireClient) {
    super(client);
  }

  public resendVerify = (options?: http.RequestOptions): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: this.url("/resend-verify"),
    });
  };

  public wsTicket = (
    options?: http.RequestOptions,
  ): Promise<WsTicketResponse> => {
    return this.client.post<WsTicketResponseSchema>({
      ...options,
      urlPath: this.url("/ws-ticket"),
      schema: wsTicketResponseSchema,
    });
  };
}

export const publicAuthService = new PublicAuthService();
export const authService = new AuthService();
