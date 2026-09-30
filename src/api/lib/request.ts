import { z } from "zod";
import { AppError } from "@/lib";
import {
  AipError,
  mapFetchToUnknownAipErrorData,
  REQUEST_ERROR_CODES,
  REQUEST_ERROR_MESSAGES,
  RESPONSE_ERROR_CODES,
} from "./errors";
import { buildUrl, buildHeaders, resolveRequestBody } from "./utils";
import type { CustomFetch, ResolvedClientConfig } from "./client";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export interface RequestOptions<T extends z.ZodTypeAny = z.ZodTypeAny> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  urlPath: string;
  schema?: T;
  signal?: AbortSignal;
  headers?: HeadersInit;
  cache?: RequestCache;
  data?: unknown;
  queryParams?: QueryParams;
  protected?: boolean;
  timeout?: number;
  retry?: boolean | number;
  fetch?: CustomFetch;
}

export interface RequestContext {
  id: string;
  startTime: number;
  attemptCount: number;
  maxAttempts: number;
  isAuthRetry?: boolean;
}

export async function request<T extends z.ZodTypeAny = z.ZodTypeAny>(
  config: Required<ResolvedClientConfig>,
  options: RequestOptions<T>,
): Promise<z.infer<T>> {
  const parsedUrl = buildUrl(
    config.baseUrl,
    options.urlPath,
    options.queryParams,
  );

  const ctx: RequestContext = {
    id: crypto.randomUUID(),
    startTime: performance.now(),
    attemptCount: 0,
    maxAttempts: config.maxAttempts,
  };

  const executeCall = async (): Promise<unknown> => {
    ctx.attemptCount++;

    if (ctx.attemptCount > ctx.maxAttempts) {
      throw new AppError({
        code: REQUEST_ERROR_CODES.MAX_RETRIES_EXCEEDED,
        message:
          REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.MAX_RETRIES_EXCEEDED],
        context: {
          url: parsedUrl.toString(),
          attemptCount: ctx.attemptCount - 1,
          maxAttempts: ctx.maxAttempts,
        },
      });
    }

    const headers = buildHeaders(config.headers, options.headers, options.data);

    await runBeforeRequestMiddleware(config, options, ctx, headers);

    const response = await sendFetchRequest(
      parsedUrl,
      headers,
      config,
      options,
    );

    if (!response.ok) {
      return handleResponseError(
        config,
        response,
        options,
        ctx,
        parsedUrl,
        executeCall,
      );
    }

    await runOnResponseSuccessMiddleware(config, response, options, ctx);

    return parseResponseBody(response, parsedUrl.toString());
  };

  try {
    const rawData = await executeCall();
    return validateResponseSchema(
      rawData,
      options.schema,
      options.method,
      options.urlPath,
    );
  } catch (error) {
    if (error instanceof AipError || error instanceof AppError) {
      throw error;
    }
    console.error(`[System Error] at ${options.urlPath}:`, error);
    throw error;
  }
}

const runBeforeRequestMiddleware = async <T extends z.ZodTypeAny>(
  config: Required<ResolvedClientConfig>,
  options: RequestOptions<T>,
  context: RequestContext,
  headers: Headers,
): Promise<void> => {
  for (const layer of config.middleware) {
    if (layer.beforeRequest) {
      await layer.beforeRequest(options, context, headers);
    }
  }
};

const sendFetchRequest = async <T extends z.ZodTypeAny>(
  fullUrl: URL,
  headers: Headers,
  config: ResolvedClientConfig,
  options: RequestOptions<T>,
): Promise<Response> => {
  const timeoutMs = options.timeout ?? config.timeout;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  const body = resolveRequestBody(options.data);
  const fetchImpl = options.fetch ?? config.fetch;

  try {
    return await fetchImpl(fullUrl.toString(), {
      method: options.method,
      signal,
      cache: options.cache,
      headers,
      credentials: config.credentials,
      body,
    });
  } catch (cause) {
    if (options.signal?.aborted) {
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
        context: { url: fullUrl.toString(), timeoutMs },
      });
    }

    const fallbackAppError = mapFetchToUnknownAipErrorData(
      new Response(null, { status: 0 }),
      null,
      fullUrl.toString(),
      {
        domain: config.domain,
        cause,
      },
    );

    throw new AipError(fallbackAppError, { cause });
  }
};

const handleResponseError = async <T extends z.ZodTypeAny>(
  config: Required<ResolvedClientConfig>,
  response: Response,
  options: RequestOptions<T>,
  context: RequestContext,
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
  const problem = mapFetchToUnknownAipErrorData(
    response,
    body,
    fullUrl.toString(),
    { domain: config.domain },
  );
  throw new AipError(problem);
};

const runOnResponseSuccessMiddleware = async <T extends z.ZodTypeAny>(
  config: Required<ResolvedClientConfig>,
  response: Response,
  options: RequestOptions<T>,
  context: RequestContext,
): Promise<void> => {
  for (const layer of config.middleware) {
    if (layer.onResponseSuccess) {
      await layer.onResponseSuccess(response, options, context);
    }
  }
};

/**
 * Safely parses the response body as JSON.
 * Throws AppError if the server returns 2xx with a non-JSON/malformed payload.
 */
const parseResponseBody = async (
  response: Response,
  url?: string,
): Promise<unknown> => {
  if (response.status === 204) return {};

  const rawText = await response.text();
  if (!rawText || rawText.trim() === "") {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch (syntaxError) {
    throw new AppError({
      code: RESPONSE_ERROR_CODES.PARSE_ERROR,
      message: RESPONSE_ERROR_CODES.PARSE_ERROR,
      cause: syntaxError,
      context: {
        status: response.status,
        url,
        rawText,
      },
    });
  }
};

/**
 * Validates raw parsed response data against an optional Zod schema.
 * Throws AppError if schema validation fails.
 */
const validateResponseSchema = <T extends z.ZodTypeAny>(
  rawData: unknown,
  schema?: T,
  method?: string,
  urlPath?: string,
): z.infer<T> => {
  if (!schema) {
    return rawData as z.infer<T>;
  }

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    console.groupCollapsed(
      `🚨 [Contract Validation Failed] at ${method ?? "GET"} ${urlPath ?? "unknown"}`,
    );
    console.error("Validation Errors:\n" + z.treeifyError(parsed.error));
    console.info("Raw Payload Received:", rawData);
    console.dir(parsed.error.issues);
    console.groupEnd();

    throw new AppError({
      code: RESPONSE_ERROR_CODES.VALIDATION_ERROR,
      message: RESPONSE_ERROR_CODES.VALIDATION_ERROR,
      cause: parsed.error,
      context: {
        method,
        urlPath,
        issues: parsed.error.issues,
        rawData,
      },
    });
  }

  return parsed.data;
};
