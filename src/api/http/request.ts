import { z } from "zod";
import {
  ApiNetworkError,
  mapFetchToProblem,
  ResponseValidationError,
} from "./errors";
import type { BonfireHttpMiddleware } from "./middleware";

interface BonfireHttpRequestContext {
  baseURL: string;
  middleware: BonfireHttpMiddleware[];
}

export interface BonfireHttpRequestOptions<T extends z.ZodTypeAny> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  schema: T;

  signal?: AbortSignal;
  headers?: Record<string, string>;
  cache?: RequestCache;

  data?: unknown;
  queryParams?: Record<string, string | number | boolean | undefined>;

  protected?: boolean;
  skipRetry?: boolean;
}

export interface BonfireHttpRequestMeta {
  serviceName: string;
}

export async function bonfireHttpRequest<T extends z.ZodTypeAny>(
  context: BonfireHttpRequestContext,
  options: BonfireHttpRequestOptions<T>,
  meta?: BonfireHttpRequestMeta,
): Promise<z.infer<T>> {
  const serviceName = meta?.serviceName || "BonfireHttpClient";

  const fullUrl = new URL(
    `${context.baseURL}/${options.url.replace(/^\//, "")}`,
  );

  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, val]) => {
      if (val !== undefined) fullUrl.searchParams.append(key, String(val));
    });
  }

  const headers = new Headers(options.headers);
  if (options.data && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let attemptCount = 0;

  const executeCall = async (): Promise<unknown> => {
    attemptCount++;
    if (attemptCount > 5) {
      throw new ApiNetworkError({
        type: "https://api.bonfire.com/errors/cascade-breakdown",
        title: "Request Cascade Loop Detected",
        status: 0,
        detail:
          "The execution loop was terminated to prevent a stack overflow. A middleware layer is recursively replaying this request infinitely.",
        code: "CASCADE_BREAKDOWN",
        instance: fullUrl.toString(),
        req_id: "client-side-circuit-breaker",
        trace_id: "unknown",
        timestamp: new Date().toISOString(),
      });
    }

    for (const layer of context.middleware) {
      if (layer.beforeRequest) {
        await layer.beforeRequest(options, headers);
      }
    }

    let response: Response;

    try {
      response = await fetch(fullUrl.toString(), {
        method: options.method,
        signal: options.signal,
        cache: options.cache,
        headers,
        body: options.data ? JSON.stringify(options.data) : undefined,
      });
    } catch (networkError) {
      const problem = mapFetchToProblem(
        new Response(null, { status: 0 }),
        {},
        fullUrl.toString(),
      );
      throw new ApiNetworkError({
        ...problem,
        detail: `Network communication failed: ${(networkError as Error).message}`,
      });
    }

    if (!response.ok) {
      for (const layer of context.middleware) {
        if (layer.onResponseError) {
          const shortCircuit = await layer.onResponseError(
            response,
            options,
            () => executeCall(),
          );
          if (shortCircuit) return shortCircuit;
        }
      }

      const body = await response.json().catch(() => ({}));
      const problem = mapFetchToProblem(response, body, fullUrl.toString());
      throw new ApiNetworkError(problem);
    }

    for (const layer of context.middleware) {
      if (layer.onResponseSuccess) {
        await layer.onResponseSuccess(response, options);
      }
    }

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
        fullUrl.toString(),
      );
    }
  };

  try {
    const rawData = await executeCall();
    const parsed = options.schema.safeParse(rawData);
    if (!parsed.success) {
      throw new ResponseValidationError(
        parsed.error,
        "Contract failed.",
        fullUrl.toString(),
      );
    }
    return parsed.data;
  } catch (error) {
    if (
      error instanceof ApiNetworkError ||
      error instanceof ResponseValidationError
    ) {
      throw error;
    }
    console.error(`[${serviceName} System Error] at ${options.url}:`, error);
    throw error;
  }
}
