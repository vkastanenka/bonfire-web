import { z } from "zod";
import {
  ApiNetworkError,
  mapFetchToAppError,
  newCascadeLoopError,
  ResponseValidationError,
} from "./errors";
import type { HttpClientConfig } from "./client";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export interface HttpRequestOptions<T extends z.ZodTypeAny> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  schema?: T;

  signal?: AbortSignal;
  headers?: Record<string, string>;
  cache?: RequestCache;

  data?: unknown;
  queryParams?: QueryParams;

  protected?: boolean;
  skipRetry?: boolean;
}

export interface HttpRequestContext {
  id: string;
  startTime: number;
  attemptCount: number;
  isAuthRetry?: boolean;
}

export async function httpRequest<T extends z.ZodTypeAny = z.ZodTypeAny>(
  config: HttpClientConfig,
  options: HttpRequestOptions<T>,
): Promise<z.infer<T>> {
  const fullUrl = buildFullUrl(
    config.baseURL,
    options.url,
    options.queryParams,
  );

  const context: HttpRequestContext = {
    id: crypto.randomUUID(),
    startTime: performance.now(),
    attemptCount: 0,
  };

  const executeCall = async (): Promise<unknown> => {
    context.attemptCount++;
    if (context.attemptCount > config.maxAttempts) {
      throw newCascadeLoopError(fullUrl);
    }

    const headers = buildHeaders(config.headers, options.headers, options.data);

    await runBeforeRequestMiddleware(config, options, context, headers);

    const response = await sendFetchRequest(
      fullUrl,
      options,
      headers,
      config.timeout,
    );

    if (!response.ok) {
      return handleResponseError(
        config,
        response,
        options,
        context,
        fullUrl,
        executeCall,
      );
    }

    await runOnResponseSuccessMiddleware(config, response, options, context);

    return parseResponseBody(response);
  };

  try {
    const rawData = await executeCall();
    return validateResponseSchema(
      rawData,
      options.schema,
      options.method,
      options.url,
    );
  } catch (error) {
    if (
      error instanceof ApiNetworkError ||
      error instanceof ResponseValidationError
    ) {
      throw error;
    }
    console.error(`[System Error] at ${options.url}:`, error);
    throw error;
  }
}

export const buildFullUrl = (
  baseUrl: string,
  path: string,
  queryParams?: QueryParams,
): URL => {
  const cleanBaseURL = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\//, "");
  const url = new URL(
    cleanPath ? `${cleanBaseURL}/${cleanPath}` : cleanBaseURL,
  );

  if (!queryParams) return url;

  Object.entries(queryParams).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item !== undefined && item !== null) {
          url.searchParams.append(key, String(item));
        }
      });
    } else if (val !== undefined && val !== null) {
      url.searchParams.append(key, String(val));
    }
  });

  return url;
};

export const buildHeaders = (
  defaultHeaders?: Record<string, string>,
  requestHeaders?: Record<string, string>,
  data?: unknown,
): Headers => {
  const headers = new Headers(defaultHeaders);

  if (requestHeaders) {
    new Headers(requestHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (
    data !== undefined &&
    data !== null &&
    !headers.has("Content-Type") &&
    !(data instanceof FormData) &&
    !(data instanceof URLSearchParams) &&
    !(data instanceof Blob)
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
};

export const runBeforeRequestMiddleware = async <T extends z.ZodTypeAny>(
  config: HttpClientConfig,
  options: HttpRequestOptions<T>,
  context: HttpRequestContext,
  headers: Headers,
): Promise<void> => {
  for (const layer of config.middleware) {
    if (layer.beforeRequest) {
      await layer.beforeRequest(options, context, headers);
    }
  }
};

export const sendFetchRequest = async <T extends z.ZodTypeAny>(
  fullUrl: URL,
  options: HttpRequestOptions<T>,
  headers: Headers,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(fullUrl.toString(), {
      method: options.method,
      signal: options.signal || controller.signal,
      cache: options.cache,
      headers,
      credentials: "include",
      body: options.data ? JSON.stringify(options.data) : undefined,
    });
  } catch {
    const fallbackAppError = mapFetchToAppError(
      new Response(null, { status: 0 }),
      {},
      fullUrl.toString(),
    );
    throw new ApiNetworkError(fallbackAppError);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const handleResponseError = async <T extends z.ZodTypeAny>(
  config: HttpClientConfig,
  response: Response,
  options: HttpRequestOptions<T>,
  context: HttpRequestContext,
  fullUrl: URL,
  retryCall: () => Promise<unknown>,
): Promise<unknown> => {
  for (const layer of config.middleware) {
    if (layer.onResponseError) {
      const shortCircuit = await layer.onResponseError(
        response,
        options,
        context,
        retryCall,
      );
      if (shortCircuit) return shortCircuit;
    }
  }

  const body = await response.json().catch(() => ({}));
  const problem = mapFetchToAppError(response, body, fullUrl.toString());
  throw new ApiNetworkError(problem);
};

export const runOnResponseSuccessMiddleware = async <T extends z.ZodTypeAny>(
  config: HttpClientConfig,
  response: Response,
  options: HttpRequestOptions<T>,
  context: HttpRequestContext,
): Promise<void> => {
  for (const layer of config.middleware) {
    if (layer.onResponseSuccess) {
      await layer.onResponseSuccess(response, options, context);
    }
  }
};

export const parseResponseBody = async (
  response: Response,
): Promise<unknown> => {
  if (response.status === 204) return {};

  const rawText = await response.text();
  if (!rawText || rawText.trim() === "") {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch (syntaxError) {
    const fakeZodError = new z.ZodError([
      {
        code: "custom",
        path: [],
        message: `Failed to parse payload: ${(syntaxError as Error).message}`,
      },
    ]);
    throw new ResponseValidationError(
      fakeZodError,
      "The server returned a success status code, but the body content was malformed or non-JSON.",
    );
  }
};

export const validateResponseSchema = <T extends z.ZodTypeAny>(
  rawData: unknown,
  schema?: T,
  method?: string,
  url?: string,
): z.infer<T> => {
  if (!schema) {
    return rawData as z.infer<T>;
  }

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    console.groupCollapsed(
      `🚨 [Contract Validation Failed] at ${method} ${url}`,
    );
    console.error("Validation Errors:\n" + z.treeifyError(parsed.error));
    console.info("Raw Payload Received:", rawData);
    console.dir(parsed.error.issues);
    console.groupEnd();

    throw new ResponseValidationError(parsed.error, "Contract failed.");
  }

  return parsed.data;
};
