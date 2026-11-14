import {
  clientErrors,
  HttpClientError,
  HttpError,
  httpErrorTypes,
  NetworkError,
  requestErrors,
  responseErrors,
  TimeoutError,
} from "./errors";
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

export interface HttpRequestOptions<T = unknown> {
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
} as const satisfies Partial<HttpRequestOptions>;

export type ResolvedHttpRequestOptions<T = unknown> = Required<
  Pick<HttpRequestOptions<T>, "timeout" | "fetch" | "maxAttempts">
> &
  Omit<HttpRequestOptions<T>, "headers"> & {
    headers: Headers;
    logger: Logger;
  };

export const httpRequest = async <T = unknown>(
  options: HttpRequestOptions<T>,
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
      throw new NetworkError(requestErrors.requestAborted.message, cause);
    }

    if (
      (cause instanceof Error && cause.name === httpErrorTypes.timeout) ||
      timeoutSignal.aborted
    ) {
      throw new TimeoutError(requestErrors.requestTimeout.message, cause);
    }

    throw new NetworkError(
      cause instanceof Error && cause.message
        ? cause.message
        : requestErrors.fetchFailed.message,
      cause,
    );
  }

  const { data: responseBody, error: parseError } = await parseJSON(response);

  if (!response.ok) {
    throw new HttpError(
      response.status,
      response.statusText,
      parseError ? "Failed to parse error body as JSON" : "",
      responseBody,
    );
  }

  if (parseError) {
    throw new HttpClientError(
      responseErrors.parseError.code,
      `${responseErrors.parseError.message}: ${parseError.message}`,
      { cause: parseError },
    );
  }

  if (!resolvedOptions.schema) {
    return responseBody as T;
  }

  const parsed = resolvedOptions.schema.safeParse(responseBody);

  if (!parsed.success) {
    const issueSummary = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");

    throw new HttpClientError(
      responseErrors.validationError.code,
      `${responseErrors.validationError.message} ${issueSummary}`,
      { cause: parsed.error },
    );
  }

  return parsed.data;
};

export const resolveRequestOptions = <T = unknown>(
  options: HttpRequestOptions<T>,
): ResolvedHttpRequestOptions<T> => {
  const fetchImpl = options.fetch ?? globalThis.fetch?.bind(globalThis);

  if (!fetchImpl || typeof fetchImpl !== "function") {
    throw new HttpClientError(
      clientErrors.missingFetch.code,
      clientErrors.missingFetch.message,
      {
        cause: {
          hasCustomFetch: Boolean(options.fetch),
          hasGlobalFetch: typeof globalThis.fetch !== "undefined",
        },
      },
    );
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
