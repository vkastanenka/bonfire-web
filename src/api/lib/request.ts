import { z } from "zod";
import type { ClientConfig, RequestContext, RequestOptions } from "./types";
import {
  ApiNetworkError,
  mapFetchToAppError,
  newCascadeLoopError,
  ResponseValidationError,
} from "./errors";
import { buildFullUrl, buildHeaders } from "./utils";

export async function request<T extends z.ZodTypeAny = z.ZodTypeAny>(
  config: Required<ClientConfig>,
  options: RequestOptions<T>,
): Promise<z.infer<T>> {
  const fullUrl = buildFullUrl(
    config.baseURL,
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
      throw newCascadeLoopError(fullUrl);
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
  const problem = mapFetchToAppError(response, body, fullUrl.toString());
  throw new ApiNetworkError(problem);
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

const parseResponseBody = async (response: Response): Promise<unknown> => {
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
