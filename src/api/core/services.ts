import type { AxiosRequestConfig } from "axios";
import type { ApiClient } from "./types";
import {
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
} from "./schema";

export abstract class BaseApiService {
  protected readonly client: ApiClient;
  protected readonly basePath: string;

  constructor(client: ApiClient, basePath: string) {
    this.client = client;
    this.basePath = basePath;
  }
}

export class AuthService extends BaseApiService {
  public register = (
    data: RegisterRequest,
    config?: AxiosRequestConfig,
  ): Promise<RegisterResponse> => {
    return this.client.request({
      method: "POST",
      url: `${this.basePath}/register`,
      data,
      schema: registerResponseSchema,
      ...config,
    });
  };
}
