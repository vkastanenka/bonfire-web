import { AppError, AipError, retryableStatusCodes } from "@/errs";
import { clientErrors, requestErrors } from "./errors";
import { logger as defaultLogger, type Logger, logMessages } from "./logger";
import {
  type CustomFetch,
  type QueryParams,
  type HttpRequestOptions,
  type ResolvedHttpRequestOptions,
  httpRequest,
  resolveRequestOptions,
} from "./request";
import { buildHeaders } from "./utils";
import { type Validator } from "./validator";

export interface HttpClientConfig {
  baseUrl: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  queryParams?: QueryParams;
  maxAttempts?: number;
  timeout?: number;
  protected?: boolean;
  fetch?: CustomFetch;
  logger?: Logger;
  beforeRequest?: BeforeRequestFn[];
  onResponseSuccess?: ResponseSuccessFn[];
  onResponseError?: ResponseErrorFn[];
}

export type HttpClientRequestOptions<T = unknown> = Omit<
  HttpRequestOptions<T>,
  "url"
> & {
  urlPath: string;
  schema?: Validator<T>;
  logger?: Logger;
};

export interface HttpRequestContext {
  readonly requestId: string;
  readonly startTime: number;
  attemptCount: number;
  meta: Record<string, unknown>;
  logger?: Logger;
}

export type BeforeRequestFn = (
  options: ResolvedHttpRequestOptions,
  context: HttpRequestContext,
) => Promise<void> | void;

export type ResponseSuccessFn<T = unknown> = (
  options: ResolvedHttpRequestOptions<T>,
  context: HttpRequestContext,
  result: T,
) => Promise<void> | void;

export type ResponseErrorFn<T = unknown> = (
  options: ResolvedHttpRequestOptions<T>,
  context: HttpRequestContext,
  error: AppError,
  retry: () => Promise<T>,
) => Promise<T | void> | T | void;

export const defaultClientConfig = {
  headers: {
    Accept: "application/json",
  },
  credentials: "include",
  maxAttempts: 3,
  timeout: 10_000,
  protected: true,
  queryParams: {},
  logger: defaultLogger,
} as const satisfies Partial<HttpClientConfig>;

export type ResolvedClientConfig = Readonly<
  Omit<Required<HttpClientConfig>, "headers" | "cache" | "logger"> & {
    headers: Headers;
    cache?: RequestCache;
    logger: Logger;
  }
>;

export class HttpClient {
  public readonly config: ResolvedClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = resolveClientConfig(config);
  }

  public async get<T = unknown>(
    options: Omit<HttpClientRequestOptions<T>, "method">,
  ): Promise<T> {
    return this.request({ ...options, method: "GET" });
  }

  public async post<T = unknown>(
    options: Omit<HttpClientRequestOptions<T>, "method">,
  ): Promise<T> {
    return this.request({ ...options, method: "POST" });
  }

  public async put<T = unknown>(
    options: Omit<HttpClientRequestOptions<T>, "method">,
  ): Promise<T> {
    return this.request({ ...options, method: "PUT" });
  }

  public async patch<T = unknown>(
    options: Omit<HttpClientRequestOptions<T>, "method">,
  ): Promise<T> {
    return this.request({ ...options, method: "PATCH" });
  }

  public async delete<T = unknown>(
    options: Omit<HttpClientRequestOptions<T>, "method">,
  ): Promise<T> {
    return this.request({ ...options, method: "DELETE" });
  }

  public addBeforeRequest(hooks: BeforeRequestFn | BeforeRequestFn[]): void {
    const list = Array.isArray(hooks) ? hooks : [hooks];
    this.config.beforeRequest.unshift(...list);
  }

  public addResponseSuccess(
    hooks: ResponseSuccessFn | ResponseSuccessFn[],
  ): void {
    const list = Array.isArray(hooks) ? hooks : [hooks];
    this.config.onResponseSuccess.unshift(...list);
  }

  public addResponseError(hooks: ResponseErrorFn | ResponseErrorFn[]): void {
    const list = Array.isArray(hooks) ? hooks : [hooks];
    this.config.onResponseError.unshift(...list);
  }

  private async request<T = unknown>(
    options: HttpClientRequestOptions<T>,
  ): Promise<T> {
    const resolvedOptions = resolveRequestOptions(
      createFallbackOptions(this.config, options),
    );

    const context = createContext(resolvedOptions);

    if (this.config.beforeRequest) {
      for (const hook of this.config.beforeRequest) {
        await hook(resolvedOptions, context);
      }
    }

    const executeCall = async (): Promise<T> => {
      context.attemptCount++;

      if (context.attemptCount > resolvedOptions.maxAttempts) {
        throw new AppError({
          code: requestErrors.maxRetriesExceeded.code,
          message: requestErrors.maxRetriesExceeded.message,
          context: {
            requestId: context.requestId,
            url: resolvedOptions.url,
            method: resolvedOptions.method,
            attemptCount: context.attemptCount - 1,
            maxAttempts: resolvedOptions.maxAttempts,
          },
        });
      }

      context.logger?.debug(logMessages.initiated, {
        attemptCount: context.attemptCount,
      });

      try {
        const result = await httpRequest(resolvedOptions);

        context.logger?.debug(logMessages.succeeded, {
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

          if (context.logger) {
            const logMethod = isFinalAttempt
              ? context.logger.error
              : context.logger.debug;

            logMethod.call(context.logger, logMessages.failed, {
              status,
              code: error.code,
              durationMs: Math.round(performance.now() - context.startTime),
              error: error instanceof AipError ? error.toAip() : undefined, // TODO: Remove in prod
            });
          }

          if (this.config.onResponseError) {
            for (const hook of this.config.onResponseError) {
              const shortCircuit = await hook(
                resolvedOptions,
                context,
                error,
                executeCall,
              );
              if (shortCircuit !== undefined) {
                return shortCircuit as T;
              }
            }
          }

          if (
            error instanceof AipError &&
            context.attemptCount < resolvedOptions.maxAttempts &&
            retryableStatusCodes.has(error.httpCode)
          ) {
            const backoff = Math.pow(2, context.attemptCount - 1) * 100;
            const jitter = Math.random() * 50;
            const delayMs = Math.round(backoff + jitter);

            context.logger?.debug(logMessages.retrying, {
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

const resolveClientConfig = (
  config: HttpClientConfig,
): ResolvedClientConfig => {
  const fetchImpl = config.fetch ?? globalThis.fetch?.bind(globalThis);
  if (!fetchImpl || typeof fetchImpl !== "function") {
    throw new AppError({
      code: clientErrors.missingFetch.code,
      message: clientErrors.missingFetch.message,
      context: {
        hasCustomFetch: Boolean(config.fetch),
        hasGlobalFetch: typeof globalThis.fetch !== "undefined",
      },
    });
  }

  const baseUrl = config.baseUrl;
  if (!baseUrl || typeof baseUrl !== "string" || baseUrl.trim().length === 0) {
    throw new AppError({
      code: clientErrors.invalidBaseUrl.code,
      message: clientErrors.invalidBaseUrl.message,
      context: { providedBaseUrl: baseUrl },
    });
  }

  try {
    new URL(baseUrl, "https://placeholder.local");
  } catch (cause) {
    throw new AppError({
      code: clientErrors.invalidBaseUrl.code,
      message: clientErrors.invalidBaseUrl.message,
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
      code: clientErrors.invalidTimeout.code,
      message: clientErrors.invalidTimeout.message,
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
      code: clientErrors.invalidMaxAttempts.code,
      message: clientErrors.invalidMaxAttempts.message,
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
    logger: config.logger ?? defaultClientConfig.logger,
    protected: config.protected ?? defaultClientConfig.protected,
    beforeRequest: config.beforeRequest ?? [],
    onResponseSuccess: config.onResponseSuccess ?? [],
    onResponseError: config.onResponseError ?? [],
  });
};

const createFallbackOptions = <T = unknown>(
  config: ResolvedClientConfig,
  options: HttpClientRequestOptions<T>,
): HttpRequestOptions<T> => {
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
    logger: options.logger ?? config.logger,
  };
};

const createContext = (
  resolvedOptions: ResolvedHttpRequestOptions,
): HttpRequestContext => {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();
  const reqLogger = resolvedOptions.logger.child
    ? resolvedOptions.logger.child({
        requestId,
        url: resolvedOptions.url,
        method: resolvedOptions.method,
        data: resolvedOptions?.data,
      })
    : resolvedOptions.logger;

  return {
    requestId,
    startTime,
    attemptCount: 0,
    meta: {},
    logger: reqLogger,
  };
};
