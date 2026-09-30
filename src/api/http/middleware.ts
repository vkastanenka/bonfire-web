import { z } from "zod";
import type { HttpRequestContext, HttpRequestOptions } from "./request";
import { API_ERROR_CODES, getErrorInfoReason, isAppError } from "./errors";
import { authManager, type AuthManager } from "../auth";

export interface HttpMiddleware {
  beforeRequest?<T extends z.ZodTypeAny>(
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
    headers: Headers,
  ): Promise<void> | void;

  onResponseSuccess?<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
    retry: () => Promise<unknown>,
  ): Promise<unknown> | void;
}

export class LoggingMiddleware implements HttpMiddleware {
  beforeRequest<T extends z.ZodTypeAny>(
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
  ) {
    if (process.env.NODE_ENV === "production") return;
    console.log(
      `[HTTP Request] [${context.id}] ${options.method} ${options.url}`,
    );
  }

  onResponseSuccess<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
  ) {
    if (process.env.NODE_ENV === "production") return;
    const duration = (performance.now() - context.startTime).toFixed(0);
    console.log(
      `[HTTP Success] [${context.id}] ${options.method} ${options.url} | Status: ${response.status} | Took: ${duration}ms`,
    );
  }

  onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
  ) {
    if (process.env.NODE_ENV === "production") return;
    const duration = (performance.now() - context.startTime).toFixed(0);
    console.error(
      `[HTTP Error] [${context.id}] ${options.method} ${options.url} | Status: ${response.status} | Took: ${duration}ms`,
    );
  }
}

export class AuthMiddleware implements HttpMiddleware {
  private authManager: AuthManager;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
  }

  async beforeRequest<T extends z.ZodTypeAny>(
    options: HttpRequestOptions<T>,
    _context: HttpRequestContext,
    headers: Headers,
  ) {
    if (!options.protected) return;
    const token = await this.authManager.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  private async safeRefresh(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = Promise.resolve(
        this.authManager.refreshAccessToken(),
      ).finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
    retry: () => Promise<unknown>,
  ) {
    if (response.status !== 401 || !options.protected || context.isAuthRetry) {
      return;
    }

    try {
      const errorBody = await response
        .clone()
        .json()
        .catch(() => null);

      const isExpired =
        isAppError(errorBody) &&
        getErrorInfoReason(errorBody) === API_ERROR_CODES.TOKEN_EXPIRED;

      if (!isExpired) return;

      context.isAuthRetry = true;
      const newToken = await this.safeRefresh();
      if (!newToken) throw new Error("Token refresh failed.");

      return await retry();
    } catch (error) {
      await this.authManager.clearTokens();
      throw error;
    }
  }
}

export class RetryMiddleware implements HttpMiddleware {
  private maxRetries: number;

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    context: HttpRequestContext,
    retry: () => Promise<unknown>,
  ) {
    if (options.skipRetry) return;

    const retryableStatuses = [429, 502, 503, 504];
    if (!retryableStatuses.includes(response.status)) return;

    if (context.attemptCount <= this.maxRetries) {
      const backoff = Math.pow(2, context.attemptCount - 1) * 100;
      const jitter = Math.random() * 50;
      await new Promise((res) => setTimeout(res, backoff + jitter));

      return retry();
    }
  }
}

export const middleware = [
  new LoggingMiddleware(),
  new AuthMiddleware(authManager),
  new RetryMiddleware(),
];
