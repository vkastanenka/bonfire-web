import type { AxiosRequestConfig } from "axios";
import type { CustomAxiosInstance, ApiServiceConfig } from "./types";
import {
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
} from "./schema";

export class AuthService {
  private readonly client: CustomAxiosInstance;
  private readonly config: ApiServiceConfig;

  constructor(client: CustomAxiosInstance, config: ApiServiceConfig) {
    this.client = client;
    this.config = config;
  }

  public register = (
    data: RegisterRequest,
    config?: AxiosRequestConfig,
  ): Promise<RegisterResponse> => {
    return this.client.safeRequest({
      method: "POST",
      url: `${this.config.basePath}/register`,
      data,
      schema: registerResponseSchema,
      ...config,
    });
  };
}
