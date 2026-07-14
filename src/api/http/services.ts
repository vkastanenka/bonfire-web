import { z } from "zod";
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
import type { BonfireHttpRequestOptions } from "./request";

export type ServiceOptions = Omit<
  BonfireHttpRequestOptions<z.ZodTypeAny>,
  "method" | "url" | "schema" | "data"
>;

export abstract class BaseService {
  private readonly client: BonfireScopedClient;

  constructor(client: BonfireScopedClient) {
    this.client = client;
  }

  protected async request<T extends z.ZodTypeAny>({
    method,
    url,
    schema,
    data,
    options,
  }: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    schema: T;
    data?: unknown;
    options?: ServiceOptions;
  }): Promise<z.infer<T>> {
    return this.client({
      method,
      url,
      schema,
      data,
      ...options,
    });
  }
}

class AuthService {
  private readonly client: BonfireScopedClient;

  constructor(client: BonfireScopedClient) {
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
