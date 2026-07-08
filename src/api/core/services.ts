import type { ScopedRequest } from "./client";
import {
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
  loginResponseSchema,
  type LoginRequest,
  type LoginResponse,
} from "./schema";

export class AuthService {
  private readonly request: ScopedRequest;

  constructor(request: ScopedRequest) {
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
}
