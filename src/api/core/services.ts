import type { AxiosRequestConfig } from "axios";
import { z } from "zod";
import type { ApiClient, ValidatedRequestConfig } from "./client";
import {
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
} from "./schema";

export abstract class BaseApiService {
  protected readonly client: ApiClient;
  protected readonly basePath: string;
  protected readonly serviceName: string;

  constructor(client: ApiClient, basePath: string, serviceName: string) {
    this.client = client;
    this.basePath = basePath;
    this.serviceName = serviceName;
  }

  /**
   * Internal proxy executor that automatically stamps the child class's operational domain
   * context on every outgoing query.
   */
  protected request<T extends z.ZodTypeAny>(
    config: Omit<ValidatedRequestConfig<T>, "context">,
  ): Promise<z.infer<T>> {
    return this.client.request({
      ...config,
      context: this.serviceName,
    });
  }
}

export class AuthService extends BaseApiService {
  constructor(client: ApiClient, basePath: string) {
    super(client, basePath, "AuthService");
  }

  public register = (
    data: RegisterRequest,
    config?: AxiosRequestConfig,
  ): Promise<RegisterResponse> => {
    return this.request({
      method: "POST",
      url: `${this.basePath}/register`,
      data,
      schema: registerResponseSchema,
      ...config,
    });
  };
}
