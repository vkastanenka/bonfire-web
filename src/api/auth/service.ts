import {
  httpClient,
  type HttpScopedClient,
  type HttpServiceRequestOptions,
} from "../http";
import {
  type RegisterResponse,
  type RegisterRequest,
  type LoginRequest,
  type LoginResponse,
  type RefreshResponse,
  type WSTicketResponse,
  registerResponseSchema,
  loginResponseSchema,
  refreshResponseSchema,
  wsTicketResponseSchema,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type VerifyEmailRequest,
} from "./schema";

class AuthService {
  private readonly client: HttpScopedClient;

  constructor(client: HttpScopedClient) {
    this.client = client;
  }

  public register = (
    data: RegisterRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<RegisterResponse> => {
    return this.client({
      method: "POST",
      url: "/register",
      data,
      schema: registerResponseSchema,
      ...options,
    });
  };

  public login = (
    data: LoginRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<LoginResponse> => {
    return this.client({
      method: "POST",
      url: "/login",
      data,
      schema: loginResponseSchema,
      ...options,
    });
  };

  public refresh = (
    options?: HttpServiceRequestOptions,
  ): Promise<RefreshResponse> => {
    return this.client({
      method: "POST",
      url: "/refresh",
      schema: refreshResponseSchema,
      ...options,
    });
  };

  public verify = (
    data: VerifyEmailRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<unknown> => {
    return this.client({
      method: "POST",
      url: "/verify",
      data,
      protected: true,
      ...options,
    });
  };

  public resendVerify = (
    options?: HttpServiceRequestOptions,
  ): Promise<unknown> => {
    return this.client({
      method: "POST",
      url: "/resend-verify",
      protected: true,
      ...options,
    });
  };

  public forgotPassword = (
    data: ForgotPasswordRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<unknown> => {
    return this.client({
      method: "POST",
      url: "/forgot-password",
      data,
      ...options,
    });
  };

  public resetPassword = (
    data: ResetPasswordRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<unknown> => {
    return this.client({
      method: "POST",
      url: "/reset-password",
      data,
      ...options,
    });
  };

  public wsTicket = (
    options?: HttpServiceRequestOptions,
  ): Promise<WSTicketResponse> => {
    return this.client({
      method: "POST",
      url: "/ws-ticket",
      schema: wsTicketResponseSchema,
      protected: true,
      ...options,
    });
  };
}

export const authService = new AuthService(
  httpClient.scope("/auth", "AuthService"),
);
