import {
  HttpClient,
  httpClient,
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
  type ResetPasswordResponse,
  resetPasswordResponseSchema,
} from "./schema";

class AuthService {
  private readonly client: HttpClient;
  private readonly routePrefix = "/auth";
  private readonly serviceMeta = { serviceName: "AuthService" };

  constructor(client: HttpClient = httpClient) {
    this.client = client;
  }

  private url(path: string): string {
    return `${this.routePrefix}${path}`;
  }

  public register = (
    data: RegisterRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<RegisterResponse> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/register"),
        data,
        schema: registerResponseSchema,
        ...options,
      },
      this.serviceMeta,
    );
  };

  public login = (
    data: LoginRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<LoginResponse> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/login"),
        data,
        schema: loginResponseSchema,
        ...options,
      },
      this.serviceMeta,
    );
  };

  public refresh = (
    options?: HttpServiceRequestOptions,
  ): Promise<RefreshResponse> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/refresh"),
        schema: refreshResponseSchema,
        ...options,
      },
      this.serviceMeta,
    );
  };

  public verify = (
    data: VerifyEmailRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<unknown> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/verify"),
        data,
        protected: true,
        ...options,
      },
      this.serviceMeta,
    );
  };

  public resendVerify = (
    options?: HttpServiceRequestOptions,
  ): Promise<unknown> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/resend-verify"),
        protected: true,
        ...options,
      },
      this.serviceMeta,
    );
  };

  public forgotPassword = (
    data: ForgotPasswordRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<unknown> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/forgot-password"),
        data,
        ...options,
      },
      this.serviceMeta,
    );
  };

  public resetPassword = (
    data: ResetPasswordRequest,
    options?: HttpServiceRequestOptions,
  ): Promise<ResetPasswordResponse> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/reset-password"),
        schema: resetPasswordResponseSchema,
        data,
        ...options,
      },
      this.serviceMeta,
    );
  };

  public wsTicket = (
    options?: HttpServiceRequestOptions,
  ): Promise<WSTicketResponse> => {
    return this.client.request(
      {
        method: "POST",
        url: this.url("/ws-ticket"),
        schema: wsTicketResponseSchema,
        protected: true,
        ...options,
      },
      this.serviceMeta,
    );
  };
}

export const authService = new AuthService();
