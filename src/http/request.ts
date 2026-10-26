import { AipError, AppError, mapFetchToUnknownAipErrorData } from "@/errs";
import { z } from "@/validation";
import {
  appendQueryParams,
  buildHeaders,
  parseJSON,
  resolveRequestBody,
} from "./utils";
import {
  REQUEST_ERROR_CODES,
  REQUEST_ERROR_MESSAGES,
  RESPONSE_ERROR_CODES,
} from "./errors";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export type CustomFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface RequestOptions<T extends z.ZodTypeAny = z.ZodTypeAny> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  schema?: T;
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
}

export const defaultRequestOptions = {
  headers: {
    Accept: "application/json",
  },
  timeout: 10_000,
  maxAttempts: 1,
} as const satisfies Partial<RequestOptions>;

export type ResolvedRequestOptions<T extends z.ZodTypeAny = z.ZodTypeAny> =
  Required<Pick<RequestOptions<T>, "timeout" | "fetch" | "maxAttempts">> &
    Omit<RequestOptions<T>, "headers"> & {
      headers: Headers;
    };

export const request = async <T extends z.ZodTypeAny = z.ZodTypeAny>(
  options: RequestOptions<T>,
): Promise<z.infer<T>> => {
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
        code: REQUEST_ERROR_CODES.REQUEST_ABORTED,
        message: REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.REQUEST_ABORTED],
        cause,
        context: { url: fullUrl.toString() },
      });
    }

    if (
      (cause instanceof Error && cause.name === "TimeoutError") ||
      timeoutSignal.aborted
    ) {
      throw new AppError({
        code: REQUEST_ERROR_CODES.REQUEST_TIMEOUT,
        message: REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.REQUEST_TIMEOUT],
        cause,
        context: { url: fullUrl.toString() },
      });
    }

    throw new AppError({
      code: REQUEST_ERROR_CODES.FETCH_FAILED,
      message:
        cause instanceof Error && cause.message
          ? cause.message
          : REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.FETCH_FAILED],
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
        code: RESPONSE_ERROR_CODES.PARSE_ERROR,
        message: RESPONSE_ERROR_CODES.PARSE_ERROR,
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
    return responseBody as z.infer<T>;
  }

  const parsed = resolvedOptions.schema.safeParse(responseBody);

  if (!parsed.success) {
    throw new AppError({
      code: RESPONSE_ERROR_CODES.VALIDATION_ERROR,
      message: RESPONSE_ERROR_CODES.VALIDATION_ERROR,
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

export const resolveRequestOptions = <T extends z.ZodTypeAny = z.ZodTypeAny>(
  options: RequestOptions<T>,
): ResolvedRequestOptions<T> => {
  const fetchImpl = options.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!fetchImpl || typeof fetchImpl !== "function") {
    throw new AppError({
      code: "MISSING_FETCH",
      message:
        "Global fetch is not available and no custom fetch was provided.",
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
  };
};
