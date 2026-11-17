import type { ZodType } from "zod";
import {
  HttpClient,
  HttpError,
  type HttpMethod,
  type HttpRequestOptions,
} from "@/http";
import { AipError, isAipErrorResponse } from "../errors";

const errors = {
  invalidResponse: "Response payload failed schema validation.",
} as const;

export interface ServiceRequestOptions<T = unknown> extends Omit<
  HttpRequestOptions,
  "method"
> {
  method?: HttpMethod;
  schema?: ZodType<T>;
}

export abstract class BaseService {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  protected get<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "GET" });
  }

  protected post<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "POST" });
  }

  protected put<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "PUT" });
  }

  protected patch<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH" });
  }

  protected delete<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE" });
  }

  protected async request<T>(options: ServiceRequestOptions<T>): Promise<T> {
    const { schema, method = "GET", ...httpOptions } = options;

    try {
      const raw = await this.httpClient.request({
        ...httpOptions,
        method,
      });

      if (!schema) {
        return raw as T;
      }

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(errors.invalidResponse, {
          cause: parsed.error,
        });
      }

      return parsed.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: unknown): unknown {
    if (error instanceof HttpError && isAipErrorResponse(error.data)) {
      return new AipError(error.data.error, { cause: error });
    }

    return error;
  }
}

// export const attachRequestLogger = (client: HttpClient, logger: Logger): void => {
//   client.addBeforeRequest((options, context) => {
//     logger.debug("HTTP request initiated", {
//       requestId: context.requestId,
//       method: options.method,
//       url: options.url,
//     });
//   });

//   client.addResponseSuccess((options, context) => {
//     logger.debug("HTTP request succeeded", {
//       requestId: context.requestId,
//       method: options.method,
//       url: options.url,
//       attemptCount: context.attemptCount,
//       durationMs: Math.round(performance.now() - context.startTime),
//     });
//   });

//   client.addResponseError((options, context, error) => {
//     const isHttpError = error instanceof HttpError;
//     const isFinalAttempt = context.attemptCount >= options.retry.maxAttempts;
//     const log = isFinalAttempt ? logger.error.bind(logger) : logger.debug.bind(logger);

//     log("HTTP request failed", {
//       requestId: context.requestId,
//       method: options.method,
//       url: options.url,
//       attemptCount: context.attemptCount,
//       durationMs: Math.round(performance.now() - context.startTime),
//       status: isHttpError ? error.status : 0,
//       errorName: error instanceof Error ? error.name : "UnknownError",
//     });
//   });
// };

// context.logger?.debug("Request initiated", {
//   requestId: context.requestId,
//   attemptCount: context.attemptCount,
// });

// context.logger?.debug("Request succeeded", {
//   requestId: context.requestId,
//   durationMs: Math.round(performance.now() - context.startTime),
// });

// context.logger?.debug("Retrying request", {
//   requestId: context.requestId,
//   delayMs,
// });

// tokenRefreshFailed: {
//   code: "TOKEN_REFRESH_FAILED",
//   message: "Failed to refresh authentication token.",
// },
