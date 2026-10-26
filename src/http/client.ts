import { z } from "@/validation";
import { AppError } from "@/errs/app";
import {
  type CustomFetch,
  type QueryParams,
  type RequestOptions,
  type ResolvedRequestOptions,
  request,
  resolveRequestOptions,
} from "./request";
import { buildHeaders } from "./utils";
import {
  CLIENT_ERROR_CODES,
  CLIENT_ERROR_MESSAGES,
  REQUEST_ERROR_CODES,
  REQUEST_ERROR_MESSAGES,
} from "./errors";
import { logger as baseLogger, type Logger } from "@/logger";
import { REQUEST_LOGS } from "./logger";
import { AipError, RETRYABLE_STATUS_CODES } from "@/errs";

export interface ClientConfig {
  baseUrl: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  queryParams?: QueryParams;
  maxAttempts?: number;
  timeout?: number;
  protected?: boolean;
  fetch?: CustomFetch;
  beforeRequest?: BeforeRequestFn[];
  onResponseSuccess?: ResponseSuccessFn[];
  onResponseError?: ResponseErrorFn[];
}

export type ClientRequestOptions<T extends z.ZodTypeAny = z.ZodTypeAny> = Omit<
  RequestOptions<T>,
  "url"
> & {
  urlPath: string;
  schema?: T;
};

export interface RequestContext {
  readonly requestId: string;
  readonly startTime: number;
  attemptCount: number;
  meta: Record<string, unknown>;
  logger: Logger;
}

export type BeforeRequestFn = (
  options: ResolvedRequestOptions,
  context: RequestContext,
) => Promise<void> | void;

export type ResponseSuccessFn<T extends z.ZodTypeAny = z.ZodTypeAny> = (
  options: ResolvedRequestOptions<T>,
  context: RequestContext,
  result: z.infer<T>,
) => Promise<void> | void;

export type ResponseErrorFn<T extends z.ZodTypeAny = z.ZodTypeAny> = (
  options: ResolvedRequestOptions<T>,
  context: RequestContext,
  error: AppError,
  retry: () => Promise<z.infer<T>>,
) => Promise<z.infer<T> | void> | z.infer<T> | void;

export const defaultClientConfig = {
  headers: {
    Accept: "application/json",
  },
  credentials: "include",
  maxAttempts: 3,
  timeout: 10_000,
  protected: true,
  queryParams: {},
} as const satisfies Partial<ClientConfig>;

export type ResolvedClientConfig = Readonly<
  Omit<Required<ClientConfig>, "headers" | "cache"> & {
    headers: Headers;
    cache?: RequestCache;
  }
>;

export class Client {
  public readonly config: ResolvedClientConfig;

  constructor(config: ClientConfig) {
    this.config = resolveClientConfig(config);
  }

  public async get<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<ClientRequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "GET" });
  }

  public async post<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<ClientRequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "POST" });
  }

  public async put<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<ClientRequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "PUT" });
  }

  public async patch<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<ClientRequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "PATCH" });
  }

  public async delete<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: Omit<ClientRequestOptions<T>, "method">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "DELETE" });
  }

  private async request<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: ClientRequestOptions<T>,
  ): Promise<z.infer<T>> {
    const resolvedOptions = resolveRequestOptions(
      createFallbackOptions(this.config, options),
    );

    const context = createContext(resolvedOptions);

    if (this.config.beforeRequest) {
      for (const hook of this.config.beforeRequest) {
        await hook(resolvedOptions, context);
      }
    }

    const executeCall = async (): Promise<z.infer<T>> => {
      context.attemptCount++;

      if (context.attemptCount > resolvedOptions.maxAttempts) {
        throw new AppError({
          code: REQUEST_ERROR_CODES.MAX_RETRIES_EXCEEDED,
          message:
            REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.MAX_RETRIES_EXCEEDED],
          context: {
            requestId: context.requestId,
            url: resolvedOptions.url,
            method: resolvedOptions.method,
            attemptCount: context.attemptCount - 1,
            maxAttempts: resolvedOptions.maxAttempts,
          },
        });
      }

      context.logger.debug(REQUEST_LOGS.INITIATED, {
        attemptCount: context.attemptCount,
      });

      try {
        const result = await request(resolvedOptions);

        context.logger.debug(REQUEST_LOGS.SUCCEEDED, {
          durationMs: Math.round(performance.now() - context.startTime),
          result, // TODO: Remove in prod
        });

        if (this.config.onResponseSuccess) {
          for (const hook of this.config.onResponseSuccess) {
            await hook(resolvedOptions, context, result);
          }
        }

        return result;
      } catch (error) {
        const isOperationalError =
          error instanceof AipError || error instanceof AppError;

        if (isOperationalError) {
          const status = error instanceof AipError ? error.httpCode : 0;
          const isFinalAttempt =
            context.attemptCount >= resolvedOptions.maxAttempts;
          const logMethod = isFinalAttempt
            ? context.logger.error
            : context.logger.debug;

          logMethod.call(context.logger, REQUEST_LOGS.FAILED, {
            status,
            code: error.code,
            durationMs: Math.round(performance.now() - context.startTime),
            error: error instanceof AipError ? error.toAip() : undefined, // TODO: Remove in prod
          });

          if (this.config.onResponseError) {
            for (const hook of this.config.onResponseError) {
              const shortCircuit = await hook(
                resolvedOptions,
                context,
                error,
                executeCall,
              );
              if (shortCircuit !== undefined) {
                return shortCircuit as z.infer<T>;
              }
            }
          }

          if (
            error instanceof AipError &&
            context.attemptCount < resolvedOptions.maxAttempts &&
            RETRYABLE_STATUS_CODES.has(error.httpCode)
          ) {
            const backoff = Math.pow(2, context.attemptCount - 1) * 100;
            const jitter = Math.random() * 50;
            const delayMs = Math.round(backoff + jitter);

            context.logger.debug(REQUEST_LOGS.RETRYING, {
              status: error.httpCode,
              delayMs,
            });

            await new Promise((res) => setTimeout(res, delayMs));
            return await executeCall();
          }
        }

        throw error;
      }
    };

    return await executeCall();
  }
}

const resolveClientConfig = (config: ClientConfig): ResolvedClientConfig => {
  const fetchImpl = config.fetch ?? globalThis.fetch?.bind(globalThis);
  if (!fetchImpl || typeof fetchImpl !== "function") {
    throw new AppError({
      code: CLIENT_ERROR_CODES.MISSING_FETCH,
      message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.MISSING_FETCH],
      context: {
        hasCustomFetch: Boolean(config.fetch),
        hasGlobalFetch: typeof globalThis.fetch !== "undefined",
      },
    });
  }

  const baseUrl = config.baseUrl;
  if (!baseUrl || typeof baseUrl !== "string" || baseUrl.trim().length === 0) {
    throw new AppError({
      code: CLIENT_ERROR_CODES.INVALID_BASE_URL,
      message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_BASE_URL],
      context: { providedBaseUrl: baseUrl },
    });
  }

  try {
    new URL(baseUrl, "https://placeholder.local");
  } catch (cause) {
    throw new AppError({
      code: CLIENT_ERROR_CODES.INVALID_BASE_URL,
      message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_BASE_URL],
      context: { providedBaseUrl: baseUrl },
      cause,
    });
  }

  const timeout = config.timeout ?? defaultClientConfig.timeout;
  if (
    typeof timeout !== "number" ||
    timeout <= 0 ||
    !Number.isFinite(timeout)
  ) {
    throw new AppError({
      code: CLIENT_ERROR_CODES.INVALID_TIMEOUT,
      message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_TIMEOUT],
      context: { timeout: config.timeout },
    });
  }

  const maxAttempts = config.maxAttempts ?? defaultClientConfig.maxAttempts;
  if (
    typeof maxAttempts !== "number" ||
    maxAttempts < 1 ||
    !Number.isInteger(maxAttempts)
  ) {
    throw new AppError({
      code: CLIENT_ERROR_CODES.INVALID_MAX_ATTEMPTS,
      message: CLIENT_ERROR_MESSAGES[CLIENT_ERROR_CODES.INVALID_MAX_ATTEMPTS],
      context: { maxAttempts: config.maxAttempts },
    });
  }

  return Object.freeze({
    baseUrl: baseUrl.replace(/\/+$/, ""),
    credentials: config.credentials ?? defaultClientConfig.credentials,
    headers: buildHeaders(defaultClientConfig.headers, config.headers),
    cache: config.cache,
    queryParams: config.queryParams ?? defaultClientConfig.queryParams,
    maxAttempts,
    timeout,
    fetch: fetchImpl,
    protected: config.protected ?? defaultClientConfig.protected,
    beforeRequest: config.beforeRequest ?? [],
    onResponseSuccess: config.onResponseSuccess ?? [],
    onResponseError: config.onResponseError ?? [],
  });
};

const createFallbackOptions = <T extends z.ZodTypeAny = z.ZodTypeAny>(
  config: ResolvedClientConfig,
  options: ClientRequestOptions<T>,
): RequestOptions<T> => {
  return {
    ...options,
    url: `${config.baseUrl}${options.urlPath}`,
    headers: buildHeaders(config.headers, options.headers, options.data),
    credentials: options.credentials ?? config.credentials,
    cache: options.cache ?? config.cache,
    queryParams: { ...config.queryParams, ...options.queryParams },
    timeout: options.timeout ?? config.timeout,
    protected: options.protected ?? config.protected,
    maxAttempts: options.maxAttempts ?? config.maxAttempts,
    fetch: options.fetch ?? config.fetch,
  };
};

const createContext = (
  resolvedOptions: ResolvedRequestOptions,
): RequestContext => {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();
  return {
    requestId,
    startTime,
    attemptCount: 0,
    meta: {},
    logger: baseLogger.child({
      requestId,
      url: resolvedOptions.url,
      method: resolvedOptions.method,
      data: resolvedOptions?.data,
    }),
  };
};
