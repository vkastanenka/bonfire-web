import { httpClient, type BonfireScopedClient } from "./client";
import {
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
  loginResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type WSTicketResponse,
  wsTicketResponseSchema,
  type RefreshResponse,
  refreshResponseSchema,
} from "../http/schema";

class AuthService {
  private readonly request: BonfireScopedClient;

  constructor(request: BonfireScopedClient) {
    this.request = request;
  }

  public register = (
    data: RegisterRequest,
    options?: { signal?: AbortSignal; headers?: Record<string, string> },
  ): Promise<RegisterResponse> => {
    return this.request({
      method: "POST",
      url: "/register",
      data,
      schema: registerResponseSchema,
      ...options,
    });
  };

  public login = (
    data: LoginRequest,
    options?: { signal?: AbortSignal; headers?: Record<string, string> },
  ): Promise<LoginResponse> => {
    return this.request({
      method: "POST",
      url: "/login",
      data,
      schema: loginResponseSchema,
      ...options,
    });
  };

  public refresh = (options?: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }): Promise<RefreshResponse> => {
    return this.request({
      method: "POST",
      url: "/refresh",
      schema: refreshResponseSchema,
      ...options,
    });
  };

  public wsTicket = (options?: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }): Promise<WSTicketResponse> => {
    return this.request({
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
