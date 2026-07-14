import { z } from "zod";
import { httpClient, type ScopedClient } from "./client";
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
  type Me,
  meSchema,
} from "../http/schema";
import type { HttpRequestOptions } from "./request";

export type ServiceOptions = Omit<
  HttpRequestOptions<z.ZodTypeAny>,
  "method" | "url" | "schema" | "data"
>;

class AuthService {
  private readonly client: ScopedClient;

  constructor(client: ScopedClient) {
    this.client = client;
  }

  public register = (
    data: RegisterRequest,
    options?: ServiceOptions,
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
    options?: ServiceOptions,
  ): Promise<LoginResponse> => {
    return this.client({
      method: "POST",
      url: "/login",
      data,
      schema: loginResponseSchema,
      ...options,
    });
  };

  public refresh = (options?: ServiceOptions): Promise<RefreshResponse> => {
    return this.client({
      method: "POST",
      url: "/refresh",
      schema: refreshResponseSchema,
      ...options,
    });
  };

  public wsTicket = (options?: ServiceOptions): Promise<WSTicketResponse> => {
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

class UserService {
  private readonly client: ScopedClient;

  constructor(client: ScopedClient) {
    this.client = client;
  }

  public getMe = (options?: ServiceOptions): Promise<Me> => {
    return this.client({
      method: "GET",
      url: "/@me",
      schema: meSchema,
      protected: true,
      ...options,
    });
  };
}

export const userService = new UserService(
  httpClient.scope("/users", "UserService"),
);
