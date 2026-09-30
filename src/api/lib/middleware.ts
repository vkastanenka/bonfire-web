import type { z } from "zod";
import type {
  RequestContext,
  RequestOptions,
  RequestMiddleware,
} from "./types";

export class LoggingMiddleware implements RequestMiddleware {
  beforeRequest<T extends z.ZodTypeAny>(
    options: RequestOptions<T>,
    context: RequestContext,
  ) {
    if (process.env.NODE_ENV === "production") return;
    console.log(
      `[HTTP Request] [${context.id}] ${options.method} ${options.url}`,
    );
  }

  onResponseSuccess<T extends z.ZodTypeAny>(
    response: Response,
    options: RequestOptions<T>,
    context: RequestContext,
  ) {
    if (process.env.NODE_ENV === "production") return;
    const duration = (performance.now() - context.startTime).toFixed(0);
    console.log(
      `[HTTP Success] [${context.id}] ${options.method} ${options.url} | Status: ${response.status} | Took: ${duration}ms`,
    );
  }

  onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: RequestOptions<T>,
    context: RequestContext,
  ) {
    if (process.env.NODE_ENV === "production") return;
    const duration = (performance.now() - context.startTime).toFixed(0);
    console.error(
      `[HTTP Error] [${context.id}] ${options.method} ${options.url} | Status: ${response.status} | Took: ${duration}ms`,
    );
  }
}

export class RetryMiddleware implements RequestMiddleware {
  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: RequestOptions<T>,
    context: RequestContext,
    retry: () => Promise<unknown>,
  ) {
    if (options.skipRetry) return;

    const retryableStatuses = [429, 502, 503, 504];
    if (!retryableStatuses.includes(response.status)) return;

    if (context.attemptCount < context.maxAttempts) {
      const backoff = Math.pow(2, context.attemptCount - 1) * 100;
      const jitter = Math.random() * 50;

      await new Promise((res) => setTimeout(res, backoff + jitter));

      return retry();
    }
  }
}
