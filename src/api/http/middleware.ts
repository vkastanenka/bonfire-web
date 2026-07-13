import { z } from "zod";
import { API_ERROR_CODES, isProblemDetails } from "./errors";
import { type BonfireTokenProvider } from "./tokens";
import type { BonfireHttpRequestOptions } from "./request";

export interface BonfireHttpMiddleware {
  name: string;

  beforeRequest?<T extends z.ZodTypeAny>(
    options: BonfireHttpRequestOptions<T>,
    headers: Headers,
  ): Promise<void> | void;

  onResponseSuccess?<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ): Promise<unknown> | void;
}

export class AuthMiddleware implements BonfireHttpMiddleware {
  public readonly name = "AuthMiddleware";
  private provider: BonfireTokenProvider;

  constructor(provider: BonfireTokenProvider) {
    this.provider = provider;
  }

  async beforeRequest<T extends z.ZodTypeAny>(
    options: BonfireHttpRequestOptions<T>,
    headers: Headers,
  ) {
    if (!options.protected) return;

    const token = await this.provider.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ) {
    if (response.status !== 401 || !options.protected) return;

    try {
      const errorBody = await response
        .clone()
        .json()
        .catch(() => null);

      const isExpired =
        isProblemDetails(errorBody) &&
        errorBody.code === API_ERROR_CODES.TOKEN_EXPIRED;

      if (!isExpired) return;

      const newToken = await this.provider.refreshAccessToken();
      if (!newToken) throw new Error("Token refresh failed.");

      return await retry();
    } catch (error) {
      await this.provider.onSessionExpired();
      throw error;
    }
  }
}

export class RetryMiddleware implements BonfireHttpMiddleware {
  public readonly name = "RetryMiddleware";
  private maxRetries = 0;

  private attempts = new WeakMap<
    BonfireHttpRequestOptions<z.ZodTypeAny>,
    number
  >();

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ) {
    if (options.skipRetry) return;

    const retryableStatuses = [429, 502, 503, 504];
    if (!retryableStatuses.includes(response.status)) return;

    const currentAttempt = this.attempts.get(options) ?? 0;

    if (currentAttempt < this.maxRetries) {
      this.attempts.set(options, currentAttempt + 1);

      const delay = Math.pow(2, currentAttempt) * 100 + Math.random() * 50;
      await new Promise((res) => setTimeout(res, delay));

      return retry();
    }
  }
}
