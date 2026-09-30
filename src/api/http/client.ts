import { z } from "zod";
import { middleware, type HttpMiddleware } from "./middleware";
import { httpRequest, type HttpRequestOptions } from "./request";

export interface HttpClientConfig {
  baseURL: string;
  credentials: RequestCredentials;
  headers?: Record<string, string>;
  maxAttempts: number;
  timeout: number;
  middleware: HttpMiddleware[];
}

export const httpClientConfig: HttpClientConfig = {
  baseURL: process.env.BONFIRE_API_URL || "http://localhost:8080/api/v1",
  credentials:
    (process.env.BONFIRE_API_CREDENTIALS as RequestCredentials) || "include",
  maxAttempts: Number(process.env.BONFIRE_API_MAX_ATTEMPTS) || 5,
  timeout: Number(process.env.BONFIRE_API_TIMEOUT) || 10000,
  middleware: middleware,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
};

export class HttpClient {
  private readonly config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;
  }

  public async request<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: HttpRequestOptions<T>,
  ): Promise<z.infer<T>> {
    return httpRequest(this.config, options);
  }
}

export const httpClient = new HttpClient(httpClientConfig);
