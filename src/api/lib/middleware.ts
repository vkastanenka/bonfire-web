import type { z } from "zod";
import { RETRYABLE_STATUS_CODES } from "./errors";
import type { RequestOptions, RequestContext } from "./request";
import { REQUEST_LOGS } from "./logger";

export interface BeforeRequestParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  options: RequestOptions<T>;
  context: RequestContext;
}

export interface ResponseSuccessParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  options: RequestOptions<T>;
  context: RequestContext;
  response: Response;
}

export interface ResponseErrorParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  options: RequestOptions<T>;
  context: RequestContext;
  response: Response;
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

export class LoggingMiddleware implements RequestMiddleware {
  beforeRequest<T extends z.ZodTypeAny>({
    options,
    context,
  }: BeforeRequestParams<T>) {
    context.logger.debug(REQUEST_LOGS.INITIATED, {
      requestId: context.requestId,
      method: options.method,
      urlPath: options.urlPath,
      attemptCount: context.attemptCount,
    });
  }

  onResponseSuccess<T extends z.ZodTypeAny>({
    options,
    context,
    response,
  }: ResponseSuccessParams<T>) {
    const durationMs = Math.round(performance.now() - context.startTime);

    context.logger.debug(REQUEST_LOGS.SUCCEEDED, {
      requestId: context.requestId,
      method: options.method,
      urlPath: options.urlPath,
      status: response.status,
      durationMs,
      attemptCount: context.attemptCount,
    });
  }

  onResponseError<T extends z.ZodTypeAny>({
    options,
    context,
    response,
  }: ResponseErrorParams<T>) {
    const durationMs = Math.round(performance.now() - context.startTime);

    context.logger.error(REQUEST_LOGS.FAILED, {
      requestId: context.requestId,
      method: options.method,
      urlPath: options.urlPath,
      status: response.status,
      durationMs,
      attemptCount: context.attemptCount,
    });
  }
}

export class RetryMiddleware implements RequestMiddleware {
  async onResponseError<T extends z.ZodTypeAny>({
    options,
    context,
    response,
    retry,
  }: ResponseErrorParams<T>) {
    if (options.retry === false) return;
    if (!RETRYABLE_STATUS_CODES.has(response.status)) return;

    if (context.attemptCount < context.maxAttempts) {
      const backoff = Math.pow(2, context.attemptCount - 1) * 100;
      const jitter = Math.random() * 50;

      context.logger.debug(REQUEST_LOGS.RETRYING, {
        requestId: context.requestId,
        status: response.status,
        method: options.method,
        urlPath: options.urlPath,
        attemptCount: context.attemptCount,
        maxAttempts: context.maxAttempts,
        delayMs: Math.round(backoff + jitter),
      });

      await new Promise((res) => setTimeout(res, backoff + jitter));

      return retry();
    }
  }
}
