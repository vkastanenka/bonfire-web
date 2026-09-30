import { z } from "zod";
import { AppError } from "@/lib";
import {
  AipError,
  mapFetchToUnknownAipErrorData,
  REQUEST_ERROR_CODES,
  REQUEST_ERROR_MESSAGES,
  RESPONSE_ERROR_CODES,
} from "./errors";
import { buildUrl, buildHeaders, resolveRequestBody, parseJson } from "./utils";
import type { CustomFetch, ResolvedClientConfig } from "./client";
import { REQUEST_LOGS, type Logger } from "./logger";

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
  maxAttempts?: number;
  timeout?: number;
  retry?: boolean;
  fetch?: CustomFetch;
}

export interface RequestContext {
  requestId: string;
  url: URL;
  headers: Headers;
  startTime: number;
  attemptCount: number;
  maxAttempts: number;
  isAuthRetry?: boolean;
  logger: Logger;
}

export async function request<T extends z.ZodTypeAny = z.ZodTypeAny>(
  config: Required<ResolvedClientConfig>,
  options: RequestOptions<T>,
): Promise<z.infer<T>> {
  const context: RequestContext = {
    requestId: crypto.randomUUID(),
    url: buildUrl(config.baseUrl, options.urlPath, options.queryParams),
    headers: buildHeaders(config.headers, options.headers, options.data),
    startTime: performance.now(),
    attemptCount: 0,
    maxAttempts: options.maxAttempts ?? config.maxAttempts,
    logger: config.logger,
  };

  const executeCall = async (): Promise<unknown> => {
    context.attemptCount++;

    if (context.attemptCount > 1) {
      context.headers = buildHeaders(
        config.headers,
        options.headers,
        options.data,
      );
    }

    if (context.attemptCount > context.maxAttempts) {
      throw new AppError({
        code: REQUEST_ERROR_CODES.MAX_RETRIES_EXCEEDED,
        message:
          REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.MAX_RETRIES_EXCEEDED],
        context: {
          url: context.url.toString(),
          attemptCount: context.attemptCount - 1,
          maxAttempts: context.maxAttempts,
        },
      });
    }

    if (context.attemptCount > 1) {
      context.headers = buildHeaders(
        config.headers,
        options.headers,
        options.data,
      );
    }

    await runBeforeRequestMiddleware(config, options, context);

    const response = await sendFetchRequest(config, options, context);

    if (!response.ok) {
      return handleResponseError(
        config,
        options,
        context,
        response,
        executeCall,
      );
    }

    await runOnResponseSuccessMiddleware(config, response, options, context);

    return parseResponseBody(response, context.url.toString());
  };

  try {
    const rawData = await executeCall();
    return validateResponseSchema(rawData, options, context);
  } catch (error) {
    if (!(error instanceof AipError) && !(error instanceof AppError)) {
      context.logger.error(REQUEST_LOGS.FAILED, {
        requestId: context.requestId,
        method: options.method,
        urlPath: options.urlPath,
        error,
      });
    }

    throw error;
  }
}

const runBeforeRequestMiddleware = async <T extends z.ZodTypeAny>(
  config: Required<ResolvedClientConfig>,
  options: RequestOptions<T>,
  context: RequestContext,
): Promise<void> => {
  for (const layer of config.middleware) {
    if (layer.beforeRequest) {
      await layer.beforeRequest({ options, context });
    }
  }
};

const sendFetchRequest = async <T extends z.ZodTypeAny>(
  config: ResolvedClientConfig,
  options: RequestOptions<T>,
  context: RequestContext,
): Promise<Response> => {
  const timeoutMs = options.timeout ?? config.timeout;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  const body = resolveRequestBody(options.data);
  const fetchImpl = options.fetch ?? config.fetch;

  try {
    return await fetchImpl(context.url.toString(), {
      method: options.method,
      signal,
      cache: options.cache,
      headers: context.headers,
      credentials: config.credentials,
      body,
    });
  } catch (cause) {
    if (options.signal?.aborted) {
      throw new AppError({
        code: REQUEST_ERROR_CODES.REQUEST_ABORTED,
        message: REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.REQUEST_ABORTED],
        cause,
        context: { url: context.url.toString() },
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
        context: { url: context.url.toString(), timeoutMs },
      });
    }

    const fallbackAppError = mapFetchToUnknownAipErrorData(
      new Response(null, { status: 0 }),
      null,
      context.url.toString(),
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
  options: RequestOptions<T>,
  context: RequestContext,
  response: Response,
  retryCall: () => Promise<unknown>,
): Promise<never> => {
  for (const layer of config.middleware) {
    if (layer.onResponseError) {
      const shortCircuit = await layer.onResponseError({
        response,
        options,
        context,
        retry: retryCall,
      });

      if (shortCircuit !== undefined) {
        return shortCircuit as never;
      }
    }
  }

  const { data: body, error: parseError } = await parseJson(response);

  const problem = mapFetchToUnknownAipErrorData(
    response,
    body,
    context.url.toString(),
    {
      domain: config.domain,
      ...(parseError ? { cause: parseError } : {}),
    },
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
      await layer.onResponseSuccess({ response, options, context });
    }
  }
};

const parseResponseBody = async (
  response: Response,
  url?: string,
): Promise<unknown> => {
  const { data, error } = await parseJson(response);

  if (error) {
    throw new AppError({
      code: RESPONSE_ERROR_CODES.PARSE_ERROR,
      message: RESPONSE_ERROR_CODES.PARSE_ERROR,
      cause: error,
      context: {
        status: response.status,
        url,
      },
    });
  }

  return data;
};

const validateResponseSchema = <T extends z.ZodTypeAny>(
  rawData: unknown,
  options: RequestOptions<T>,
  context: RequestContext,
): z.infer<T> => {
  if (!options.schema) {
    return rawData as z.infer<T>;
  }

  const parsed = options.schema.safeParse(rawData);
  if (!parsed.success) {
    context.logger.error(REQUEST_LOGS.RESPONSE_VALIDATION_FAILED, {
      requestId: context.requestId,
      method: options.method,
      urlPath: options.urlPath,
      issues: parsed.error.issues,
      formattedError: z.treeifyError(parsed.error),
      rawData,
    });

    throw new AppError({
      code: RESPONSE_ERROR_CODES.VALIDATION_ERROR,
      message: RESPONSE_ERROR_CODES.VALIDATION_ERROR,
      cause: parsed.error,
      context: {
        method: options.method,
        urlPath: options.urlPath,
        issues: parsed.error.issues,
        rawData,
      },
    });
  }

  return parsed.data;
};
