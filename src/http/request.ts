import {
  clientErrors,
  HttpClientError,
  HttpError,
  NetworkError,
  requestErrors,
  responseErrors,
  TimeoutError,
} from "./errors";
import type {
  BaseHttpOptions,
  HttpRequestContext,
  HttpRequestOptions,
  ResolvedHttpRequestOptions,
  ResolvedRetryConfig,
  ResolveOptions,
  RetryConfig,
} from "./types";
import {
  appendQueryParams,
  buildHeaders,
  parseResponse,
  parseUrl,
  resolveFetch,
  resolveRequestBody,
  resolveTimeout,
  type ParsedResponse,
} from "./utils";

export const defaultRequestOptions = {
  headers: {
    Accept: "application/json",
  },
  timeout: 10_000,
  retry: {
    maxAttempts: 1,
    statusCodes: [408, 429, 500, 502, 503, 504],
    methods: ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"],
  },
} as const satisfies Partial<HttpRequestOptions>;

export const httpRequest = async (
  rawOptions: HttpRequestOptions,
): Promise<unknown> => {
  const options = resolveRequestOptions(rawOptions);
  const context = createContext();

  for (const hook of options.beforeRequest) {
    await hook({ options, context });
  }

  const executeCall = async (): Promise<unknown> => {
    context.attemptCount++;

    if (context.attemptCount > options.retry.maxAttempts) {
      throw new HttpClientError(
        requestErrors.maxRetriesExceeded.code,
        requestErrors.maxRetriesExceeded.message,
        {
          cause: {
            requestId: context.requestId,
            url: options.url,
            method: options.method,
            attemptCount: context.attemptCount - 1,
            maxAttempts: options.retry.maxAttempts,
          },
        },
      );
    }

    try {
      const result = await fetchAttempt(options);

      for (const hook of options.onResponseSuccess) {
        await hook({ options, context, result });
      }

      return result;
    } catch (error) {
      for (const hook of options.onResponseError) {
        const shortCircuit = await hook({
          options,
          context,
          error,
          retry: executeCall,
        });

        if (shortCircuit !== undefined) {
          return shortCircuit;
        }
      }

      if (isRetryable(error, context.attemptCount, options)) {
        const backoff = Math.pow(2, context.attemptCount - 1) * 100;
        const jitter = Math.random() * 50;
        const delayMs = Math.round(backoff + jitter);

        await new Promise((res) => setTimeout(res, delayMs));
        return executeCall();
      }

      throw error;
    }
  };

  return executeCall();
};

const fetchAttempt = async (
  options: ResolvedHttpRequestOptions,
): Promise<unknown> => {
  if (options.signal?.aborted) {
    throw new HttpClientError(
      requestErrors.requestAborted.code,
      requestErrors.requestAborted.message,
      { cause: options.signal.reason },
    );
  }

  const url = parseUrl(options.url);
  const fullUrl = appendQueryParams(url, options.queryParams);
  const body = resolveRequestBody(options.data);

  const timeoutSignal = AbortSignal.timeout(options.timeout);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  let parsedResponse: ParsedResponse;

  try {
    const response = await options.fetch(fullUrl.toString(), {
      method: options.method,
      headers: options.headers,
      body,
      signal,
      cache: options.cache,
      credentials: options.credentials,
    });

    parsedResponse = await parseResponse(response);

    if (!response.ok) {
      throw new HttpError(
        response.status,
        response.statusText,
        parsedResponse.rawData,
        parsedResponse.data,
        parsedResponse.error ? { cause: parsedResponse.error } : undefined,
      );
    }
  } catch (cause) {
    if (cause instanceof HttpError) {
      throw cause;
    }

    if (options.signal?.aborted) {
      throw new HttpClientError(
        requestErrors.requestAborted.code,
        requestErrors.requestAborted.message,
        { cause },
      );
    }

    if (timeoutSignal.aborted) {
      throw new TimeoutError({ cause });
    }

    throw new NetworkError({ cause });
  }

  if (parsedResponse.error) {
    throw new HttpClientError(
      responseErrors.parseError.code,
      responseErrors.parseError.message,
      { cause: parsedResponse.error },
    );
  }

  return parsedResponse.data;
};

export const resolveRetryConfig = (
  retry?: RetryConfig,
): ResolvedRetryConfig => {
  const maxAttempts =
    retry?.maxAttempts ?? defaultRequestOptions.retry.maxAttempts;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new HttpClientError(
      clientErrors.invalidMaxAttempts.code,
      clientErrors.invalidMaxAttempts.message,
      { cause: { maxAttempts: retry?.maxAttempts } },
    );
  }

  return {
    maxAttempts,
    statusCodes: retry?.statusCodes ?? [
      ...defaultRequestOptions.retry.statusCodes,
    ],
    methods: retry?.methods ?? [...defaultRequestOptions.retry.methods],
    shouldRetry: retry?.shouldRetry,
  };
};

export const resolveBaseOptions = <T extends BaseHttpOptions>(
  options: T,
  data?: unknown,
): ResolveOptions<T> => ({
  ...options,
  headers: buildHeaders(defaultRequestOptions.headers, options.headers, data),
  timeout: resolveTimeout(options.timeout, defaultRequestOptions.timeout),
  fetch: resolveFetch(options.fetch),
  retry: resolveRetryConfig(options.retry),
  beforeRequest: [...(options.beforeRequest ?? [])],
  onResponseSuccess: [...(options.onResponseSuccess ?? [])],
  onResponseError: [...(options.onResponseError ?? [])],
});

export const resolveRequestOptions = (
  options: HttpRequestOptions,
): ResolvedHttpRequestOptions => resolveBaseOptions(options, options.data);

const createContext = (): HttpRequestContext => ({
  requestId: crypto.randomUUID(),
  startTime: performance.now(),
  attemptCount: 0,
  meta: {},
});

const isRetryable = (
  error: unknown,
  attempt: number,
  options: ResolvedHttpRequestOptions,
): boolean => {
  if (attempt >= options.retry.maxAttempts) return false;
  if (options.retry.shouldRetry) {
    return options.retry.shouldRetry(error, attempt);
  }
  if (options.method && !options.retry.methods.includes(options.method)) {
    return false;
  }
  if (error instanceof HttpError) {
    return options.retry.statusCodes.includes(error.status);
  }
  return error instanceof TimeoutError || error instanceof NetworkError;
};
