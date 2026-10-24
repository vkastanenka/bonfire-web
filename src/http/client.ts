import { z } from "@/validation";
import { AppError } from "@/errs/app";
import { type RequestOptions, request } from "./request";
import type { RequestMiddleware } from "./middleware";
import { buildHeaders } from "./utils";
import { CLIENT_ERROR_CODES, CLIENT_ERROR_MESSAGES } from "./errors";
import type { Logger } from "./logger";

export type CustomFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface ClientConfig {
  logger: Logger;
  baseUrl: string;
  domain?: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  maxAttempts?: number;
  timeout?: number;
  protected?: boolean;
  middleware?: RequestMiddleware[];
  fetch?: CustomFetch;
}

export type ResolvedClientConfig = Client["config"];

export const DEFAULT_CLIENT_CONFIG = {
  domain: "http-client",
  headers: {
    Accept: "application/json",
  },
  credentials: "include",
  maxAttempts: 3,
  timeout: 10_000,
  protected: true,
} as const satisfies Partial<ClientConfig>;

export class Client {
  public readonly config: Readonly<
    Omit<Required<ClientConfig>, "headers"> & { headers: Headers }
  >;

  constructor(config: ClientConfig) {
    const fetchImpl = Client.resolveAndValidateFetch(config.fetch);
    const baseUrl = Client.validateBaseUrl(config.baseUrl);
    const timeout = Client.validateTimeout(config.timeout);
    const maxAttempts = Client.validateMaxAttempts(config.maxAttempts);

    this.config = Object.freeze({
      baseUrl,
      logger: config.logger,
      domain: config.domain ?? DEFAULT_CLIENT_CONFIG.domain,
      credentials: config.credentials ?? DEFAULT_CLIENT_CONFIG.credentials,
      headers: buildHeaders(DEFAULT_CLIENT_CONFIG.headers, config.headers),
      maxAttempts,
      timeout,
      middleware: [...(config.middleware ?? [])],
      fetch: fetchImpl,
      protected: config.protected ?? DEFAULT_CLIENT_CONFIG.protected,
    });
  }

  private static resolveAndValidateFetch(
    customFetch?: CustomFetch,
  ): CustomFetch {
    const fetchImpl = customFetch ?? globalThis.fetch?.bind(globalThis);

    if (!fetchImpl || typeof fetchImpl !== "function") {
      throw new AppError({
        code: CLIENT_ERROR_CODES.MISSING_FETCH,
        message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.MISSING_FETCH],
        context: {
          hasCustomFetch: Boolean(customFetch),
          hasGlobalFetch: typeof globalThis.fetch !== "undefined",
        },
      });
    }

    return fetchImpl;
  }

  private static validateBaseUrl(baseUrl: unknown): string {
    if (
      !baseUrl ||
      typeof baseUrl !== "string" ||
      baseUrl.trim().length === 0
    ) {
      throw new AppError({
        code: CLIENT_ERROR_CODES.INVALID_BASE_URL,
        message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_BASE_URL],
        context: { providedBaseUrl: baseUrl },
      });
    }

    try {
      new URL(baseUrl, "https://placeholder.local");
      return baseUrl;
    } catch (cause) {
      throw new AppError({
        code: CLIENT_ERROR_CODES.INVALID_BASE_URL,
        message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_BASE_URL],
        context: { providedBaseUrl: baseUrl },
        cause,
      });
    }
  }

  private static validateTimeout(timeoutInput?: number): number {
    const timeout = timeoutInput ?? DEFAULT_CLIENT_CONFIG.timeout;

    if (
      typeof timeout !== "number" ||
      timeout <= 0 ||
      !Number.isFinite(timeout)
    ) {
      throw new AppError({
        code: CLIENT_ERROR_CODES.INVALID_TIMEOUT,
        message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_TIMEOUT],
        context: { timeout: timeoutInput },
      });
    }

    return timeout;
  }

  private static validateMaxAttempts(maxAttemptsInput?: number): number {
    const maxAttempts = maxAttemptsInput ?? DEFAULT_CLIENT_CONFIG.maxAttempts;

    if (
      typeof maxAttempts !== "number" ||
      maxAttempts < 1 ||
      !Number.isInteger(maxAttempts)
    ) {
      throw new AppError({
        code: CLIENT_ERROR_CODES.INVALID_MAX_ATTEMPTS,
        message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_MAX_ATTEMPTS],
        context: { maxAttempts: maxAttemptsInput },
      });
    }

    return maxAttempts;
  }

  public extend(overrides: Partial<ClientConfig>): Client {
    return new Client({
      ...this.config,
      ...overrides,
      headers: overrides.headers
        ? buildHeaders(this.config.headers, overrides.headers)
        : this.config.headers,
      middleware: [...this.config.middleware, ...(overrides.middleware ?? [])],
    });
  }

  public async request<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: RequestOptions<T>,
  ): Promise<z.infer<T>> {
    return request(this.config, options);
  }

  public async get<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<RequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "GET" });
  }

  public async post<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<RequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "POST" });
  }

  public async put<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<RequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "PUT" });
  }

  public async patch<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<RequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "PATCH" });
  }

  public async delete<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<RequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "DELETE" });
  }
}
