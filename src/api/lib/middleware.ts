import type { z } from "zod";
import type { RequestOptions, RequestContext } from "./request";

export interface BeforeRequestParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  options: RequestOptions<T>;
  context: RequestContext;
  headers: Headers;
}

export interface ResponseSuccessParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  response: Response;
  options: RequestOptions<T>;
  context: RequestContext;
}

export interface ResponseErrorParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  response: Response;
  options: RequestOptions<T>;
  context: RequestContext;
  retry: () => Promise<unknown>;
}

export interface RequestMiddleware {
  beforeRequest?<T extends z.ZodTypeAny>(
    params: BeforeRequestParams<T>,
  ): Promise<void> | void;

  onResponseSuccess?<T extends z.ZodTypeAny>(
    params: ResponseSuccessParams<T>,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    params: ResponseErrorParams<T>,
  ): Promise<unknown> | void;
}

export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export class LoggingMiddleware implements RequestMiddleware {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  beforeRequest<T extends z.ZodTypeAny>({
    options,
    context,
  }: BeforeRequestParams<T>) {
    this.logger.debug(`HTTP Request: ${options.method} ${options.urlPath}`, {
      requestId: context.id,
      method: options.method,
      urlPath: options.urlPath,
      attemptCount: context.attemptCount,
    });
  }

  onResponseSuccess<T extends z.ZodTypeAny>({
    response,
    options,
    context,
  }: ResponseSuccessParams<T>) {
    const durationMs = Math.round(performance.now() - context.startTime);

    this.logger.info(
      `HTTP ${response.status} ${options.method} ${options.urlPath} (${durationMs}ms)`,
      {
        requestId: context.id,
        method: options.method,
        urlPath: options.urlPath,
        status: response.status,
        durationMs,
        attemptCount: context.attemptCount,
      },
    );
  }

  onResponseError<T extends z.ZodTypeAny>({
    response,
    options,
    context,
  }: ResponseErrorParams<T>) {
    const durationMs = Math.round(performance.now() - context.startTime);

    this.logger.error(
      `HTTP ${response.status} ${options.method} ${options.urlPath} failed (${durationMs}ms)`,
      {
        requestId: context.id,
        method: options.method,
        urlPath: options.urlPath,
        status: response.status,
        durationMs,
        attemptCount: context.attemptCount,
      },
    );
  }
}

export class RetryMiddleware implements RequestMiddleware {
  async onResponseError<T extends z.ZodTypeAny>({
    response,
    options,
    context,
    retry,
  }: ResponseErrorParams<T>) {
    if (options.retry === false) return;

    const retryableStatuses = [429, 502, 503, 504];
    if (!retryableStatuses.includes(response.status)) return;

    const maxAttempts =
      typeof options.retry === "number" ? options.retry : context.maxAttempts;

    if (context.attemptCount < maxAttempts) {
      const backoff = Math.pow(2, context.attemptCount - 1) * 100;
      const jitter = Math.random() * 50;

      await new Promise((res) => setTimeout(res, backoff + jitter));

      return retry();
    }
  }
}
