import { z } from "zod";
import { AppError } from "@/lib";
import {
  AipError,
  mapFetchToUnknownAipErrorData,
  REQUEST_ERROR_CODES,
  REQUEST_ERROR_MESSAGES,
  VALIDATION_ERROR_CODES,
  VALIDATION_ERROR_MESSAGES,
} from "./errors";
import { buildFullUrl, buildHeaders } from "./utils";
import type { ClientConfig } from "./client";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export interface RequestOptions<T extends z.ZodTypeAny> {
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

export interface RequestContext {
  id: string;
  startTime: number;
  attemptCount: number;
  maxAttempts: number;
  isAuthRetry?: boolean;
}

export async function request<T extends z.ZodTypeAny = z.ZodTypeAny>(
  config: Required<ClientConfig>,
  options: RequestOptions<T>,
): Promise<z.infer<T>> {
  const fullUrl = buildFullUrl(
    config.baseUrl,
    options.url,
    options.queryParams,
  );

  const context: RequestContext = {
    id: crypto.randomUUID(),
    startTime: performance.now(),
    attemptCount: 0,
    maxAttempts: config.maxAttempts,
  };

  const executeCall = async (): Promise<unknown> => {
    context.attemptCount++;

    if (context.attemptCount > context.maxAttempts) {
      throw new AppError({
        code: REQUEST_ERROR_CODES.CASCADE_LOOP_DETECTED,
        message:
          REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.CASCADE_LOOP_DETECTED],
        context: {
          url: fullUrl.toString(),
        },
      });
    }

    const headers = buildHeaders(config.headers, options.headers, options.data);

    await runBeforeRequestMiddleware(config, options, context, headers);

    const response = await sendFetchRequest(
      fullUrl,
      options,
      headers,
      config.timeout,
      config.credentials,
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
    if (error instanceof AipError || error instanceof AppError) {
      throw error;
    }
    console.error(`[System Error] at ${options.url}:`, error);
    throw error;
  }
}

const runBeforeRequestMiddleware = async <T extends z.ZodTypeAny>(
  config: Required<ClientConfig>,
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
  options: RequestOptions<T>,
  headers: Headers,
  timeoutMs: number,
  credentials?: RequestCredentials,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options.signal
    ? AbortSignal.any
      ? AbortSignal.any([options.signal, controller.signal])
      : options.signal
    : controller.signal;

  try {
    return await fetch(fullUrl.toString(), {
      method: options.method,
      signal,
      cache: options.cache,
      headers,
      credentials: credentials ?? "include",
      body: options.data ? JSON.stringify(options.data) : undefined,
    });
  } catch {
    const fallbackAppError = mapFetchToUnknownAipErrorData(
      new Response(null, { status: 0 }),
      {},
      fullUrl.toString(),
    );
    throw new AipError(fallbackAppError);
  } finally {
    clearTimeout(timeoutId);
  }
};

const handleResponseError = async <T extends z.ZodTypeAny>(
  config: Required<ClientConfig>,
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
  );
  throw new AipError(problem);
};

const runOnResponseSuccessMiddleware = async <T extends z.ZodTypeAny>(
  config: Required<ClientConfig>,
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
      code: VALIDATION_ERROR_CODES.RESPONSE_PARSE_ERROR,
      message: VALIDATION_ERROR_MESSAGES.RESPONSE_PARSE_ERROR,
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
  url?: string,
): z.infer<T> => {
  if (!schema) {
    return rawData as z.infer<T>;
  }

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    console.groupCollapsed(
      `🚨 [Contract Validation Failed] at ${method ?? "GET"} ${url ?? "unknown"}`,
    );
    console.error("Validation Errors:\n" + z.treeifyError(parsed.error));
    console.info("Raw Payload Received:", rawData);
    console.dir(parsed.error.issues);
    console.groupEnd();

    throw new AppError({
      code: VALIDATION_ERROR_CODES.RESPONSE_VALIDATION_ERROR,
      message: VALIDATION_ERROR_MESSAGES.RESPONSE_VALIDATION_ERROR,
      cause: parsed.error,
      context: {
        method,
        url,
        issues: parsed.error.issues,
        rawData,
      },
    });
  }

  return parsed.data;
};
