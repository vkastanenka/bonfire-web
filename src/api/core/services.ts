import type { AxiosRequestConfig } from "axios";
import { z } from "zod";
import type { ApiClient, ValidatedRequestConfig } from "./client";
import {
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
} from "./schema";

export class AuthService {
  constructor(private readonly api: ScopedClient) {}

  public register = (
    data: RegisterRequest,
    config?: AxiosRequestConfig,
  ): Promise<RegisterResponse> => {
    return this.api.request({
      method: "POST",
      url: "/register", // Clean relative path scoped exactly to this service domain
      data,
      schema: registerResponseSchema,
      ...config,
    });
  };
}
