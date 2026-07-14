import { z } from "zod";
import { API_ERROR_CODES, isProblemDetails } from "./errors";
import type { HttpRequestOptions } from "./request";
import type { sessionManager } from "../session";

export interface HttpMiddleware {
  name: string;

  beforeRequest?<T extends z.ZodTypeAny>(
    options: HttpRequestOptions<T>,
    headers: Headers,
  ): Promise<void> | void;

  onResponseSuccess?<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ): Promise<unknown> | void;
}

export class LoggingMiddleware implements HttpMiddleware {
  public readonly name = "LoggingMiddleware";
  private startTimes = new WeakMap<HttpRequestOptions<z.ZodTypeAny>, number>();

  async beforeRequest<T extends z.ZodTypeAny>(options: HttpRequestOptions<T>) {
    if (process.env.NODE_ENV === "production") return;

    this.startTimes.set(options, performance.now());
    console.log(
      `[HTTP Request] ${options.method.toUpperCase()} ${options.url}`,
    );
  }

  async onResponseSuccess<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
  ) {
    if (process.env.NODE_ENV === "production") return;

    const startTime = this.startTimes.get(options) || performance.now();
    const duration = (performance.now() - startTime).toFixed(0);

    console.log(
      `[HTTP Success] ${options.method.toUpperCase()} ${options.url} | Status: ${response.status} | Took: ${duration}ms`,
    );
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
  ) {
    if (process.env.NODE_ENV === "production") return;

    const startTime = this.startTimes.get(options) || performance.now();
    const duration = (performance.now() - startTime).toFixed(0);

    console.error(
      `[HTTP Error] ${options.method.toUpperCase()} ${options.url} | Status: ${response.status} | Took: ${duration}ms`,
    );
  }
}

export class AuthMiddleware implements HttpMiddleware {
  public readonly name = "AuthMiddleware";
  private session: typeof sessionManager;

  constructor(session: typeof sessionManager) {
    this.session = session;
  }

  async beforeRequest<T extends z.ZodTypeAny>(
    options: HttpRequestOptions<T>,
    headers: Headers,
  ) {
    if (!options.protected) return;

    const token = await this.session.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
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

      const newToken = await this.session.refreshAccessToken();
      if (!newToken) throw new Error("Token refresh failed.");

      return await retry();
    } catch (error) {
      await this.session.handleSessionExpired();
      throw error;
    }
  }
}

export class RetryMiddleware implements HttpMiddleware {
  public readonly name = "RetryMiddleware";
  private maxRetries: number;

  private attempts = new Map<string, number>();

  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  private getKey(options: HttpRequestOptions<z.ZodTypeAny>): string {
    return `${options.method}:${options.url}`;
  }

  async onResponseSuccess<T extends z.ZodTypeAny>(
    _response: Response,
    options: HttpRequestOptions<T>,
  ) {
    const key = this.getKey(options);
    this.attempts.delete(key);

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: HttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ) {
    if (options.skipRetry) return;

    const retryableStatuses = [429, 502, 503, 504];
    if (!retryableStatuses.includes(response.status)) return;

    const key = this.getKey(options);
    const currentAttempt = this.attempts.get(key) ?? 0;

    if (currentAttempt < this.maxRetries) {
      this.attempts.set(key, currentAttempt + 1);

      if (this.timers.has(key)) clearTimeout(this.timers.get(key));
      this.timers.set(
        key,
        setTimeout(() => {
          this.attempts.delete(key);
          this.timers.delete(key);
        }, 5000),
      );

      const delay = Math.pow(2, currentAttempt) * 100 + Math.random() * 50;
      await new Promise((res) => setTimeout(res, delay));

      return retry();
    }
  }
}
