import { AipError, AppError, mapFetchToUnknownAipErrorData } from "@/errs";
import { clientErrors, requestErrors, responseErrors } from "./errors";
import { logger as defaultLogger, type Logger } from "./logger";
import {
  appendQueryParams,
  buildHeaders,
  parseJSON,
  resolveRequestBody,
} from "./utils";
import { type Validator } from "./validator";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export type CustomFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface RequestOptions<T = unknown> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  schema?: Validator<T>;
  data?: unknown;
  signal?: AbortSignal;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  queryParams?: QueryParams;
  timeout?: number;
  protected?: boolean;
  maxAttempts?: number;
  fetch?: CustomFetch;
  logger?: Logger;
}

export const defaultRequestOptions = {
  headers: {
    Accept: "application/json",
  },
  timeout: 10_000,
  maxAttempts: 1,
} as const satisfies Partial<RequestOptions>;

export type ResolvedRequestOptions<T = unknown> = Required<
  Pick<RequestOptions<T>, "timeout" | "fetch" | "maxAttempts">
> &
  Omit<RequestOptions<T>, "headers"> & {
    headers: Headers;
    logger: Logger;
  };

export const request = async <T = unknown>(
  options: RequestOptions<T>,
): Promise<T> => {
  const resolvedOptions = resolveRequestOptions(options);

  const timeoutSignal = AbortSignal.timeout(resolvedOptions.timeout);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  const url = new URL(resolvedOptions.url);
  const fullUrl = appendQueryParams(url, resolvedOptions.queryParams);
  const body = resolveRequestBody(resolvedOptions.data);

  let response: Response;

  try {
    response = await resolvedOptions.fetch(fullUrl.toString(), {
      method: resolvedOptions.method,
      signal,
      cache: resolvedOptions.cache,
      headers: resolvedOptions.headers,
      credentials: resolvedOptions.credentials,
      body,
    });
  } catch (cause) {
    if (resolvedOptions.signal?.aborted) {
      throw new AppError({
        code: requestErrors.requestAborted.code,
        message: requestErrors.requestAborted.message,
        cause,
        context: { url: fullUrl.toString() },
      });
    }

    if (
      (cause instanceof Error && cause.name === "TimeoutError") ||
      timeoutSignal.aborted
    ) {
      throw new AppError({
        code: requestErrors.requestTimeout.code,
        message: requestErrors.requestTimeout.message,
        cause,
        context: { url: fullUrl.toString() },
      });
    }

    throw new AppError({
      code: requestErrors.fetchFailed.code,
      message:
        cause instanceof Error && cause.message
          ? cause.message
          : requestErrors.fetchFailed.message,
      cause,
      context: { url: fullUrl.toString() },
    });
  }

  if (!response.ok) {
    const { data: bodyData, error: parseError } = await parseJSON(response);

    const aipErrorData = mapFetchToUnknownAipErrorData(
      response,
      bodyData,
      resolvedOptions.url,
      parseError ? { cause: parseError } : {},
    );

    throw new AipError(aipErrorData);
  }

  let responseBody: unknown = null;

  if (
    !(response.status === 204 || response.headers.get("content-length") === "0")
  ) {
    const { data, error } = await parseJSON(response);

    if (error) {
      throw new AppError({
        code: responseErrors.parseError.code,
        message: responseErrors.parseError.message,
        cause: error,
        context: {
          status: response.status,
          url: fullUrl.toString(),
        },
      });
    }

    responseBody = data;
  }

  if (!resolvedOptions.schema) {
    return responseBody as T;
  }

  const parsed = resolvedOptions.schema.safeParse(responseBody);

  if (!parsed.success) {
    throw new AppError({
      code: responseErrors.validationError.code,
      message: responseErrors.validationError.message,
      cause: parsed.error,
      context: {
        method: resolvedOptions.method,
        urlPath: fullUrl.toString(),
        issues: parsed.error.issues,
        responseBody,
      },
    });
  }

  return parsed.data;
};

export const resolveRequestOptions = <T = unknown>(
  options: RequestOptions<T>,
): ResolvedRequestOptions<T> => {
  const fetchImpl = options.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!fetchImpl || typeof fetchImpl !== "function") {
    throw new AppError({
      code: clientErrors.missingFetch.code,
      message: clientErrors.missingFetch.message,
      context: {
        hasCustomFetch: Boolean(options.fetch),
        hasGlobalFetch: typeof globalThis.fetch !== "undefined",
      },
    });
  }

  return {
    ...options,
    headers: buildHeaders(
      options.headers ?? defaultRequestOptions.headers,
      undefined,
      options.data,
    ),
    timeout: options.timeout ?? defaultRequestOptions.timeout,
    maxAttempts: options.maxAttempts ?? defaultRequestOptions.maxAttempts,
    fetch: fetchImpl,
    logger: options.logger ?? defaultLogger,
  };
};
