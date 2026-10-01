import { Client, type RequestOptions } from "@/http";
import { baseBonfireClient, bonfireClient } from "../client";
import { BaseService } from "../service";
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

export class PublicAuthService extends BaseService {
  protected readonly routePrefix = "/auth";

  constructor(client: Client = baseBonfireClient) {
    super(client);
  }

  public register = (
    data: RegisterRequest,
    options?: RequestOptions,
  ): Promise<RegisterResponse> => {
    return this.client.post<typeof registerResponseSchema>({
      ...options,
      urlPath: this.url("/register"),
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
      urlPath: this.url("/login"),
      data,
      schema: loginResponseSchema,
    });
  };

  public refresh = (options?: RequestOptions): Promise<RefreshResponse> => {
    return this.client.post<typeof refreshResponseSchema>({
      ...options,
      urlPath: this.url("/refresh"),
      schema: refreshResponseSchema,
    });
  };

  public verify = (
    data: VerifyEmailRequest,
    options?: RequestOptions,
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
    options?: RequestOptions,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: this.url("/forgot-password"),
      data,
    });
  };

  public resetPassword = (
    data: ResetPasswordRequest,
    options?: RequestOptions,
  ): Promise<ResetPasswordResponse> => {
    return this.client.post<typeof resetPasswordResponseSchema>({
      ...options,
      urlPath: this.url("/reset-password"),
      data,
      schema: resetPasswordResponseSchema,
    });
  };
}

export class AuthService extends BaseService {
  protected readonly routePrefix = "/auth";

  constructor(client: Client = bonfireClient) {
    super(client);
  }

  public resendVerify = (options?: RequestOptions): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: this.url("/resend-verify"),
    });
  };

  public wsTicket = (options?: RequestOptions): Promise<WsTicketResponse> => {
    return this.client.post<typeof wsTicketResponseSchema>({
      ...options,
      urlPath: this.url("/ws-ticket"),
      schema: wsTicketResponseSchema,
    });
  };
}

export const publicAuthService = new PublicAuthService();
export const authService = new AuthService();
