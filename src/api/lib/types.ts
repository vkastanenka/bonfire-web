import { z } from "zod";

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

export interface RequestMiddleware {
  beforeRequest?<T extends z.ZodTypeAny>(
    options: RequestOptions<T>,
    context: RequestContext,
    headers: Headers,
  ): Promise<void> | void;

  onResponseSuccess?<T extends z.ZodTypeAny>(
    response: Response,
    options: RequestOptions<T>,
    context: RequestContext,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    response: Response,
    options: RequestOptions<T>,
    context: RequestContext,
    retry: () => Promise<unknown>,
  ): Promise<unknown> | void;
}

export interface ClientConfig {
  baseURL: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
  maxAttempts?: number;
  timeout?: number;
  middleware?: RequestMiddleware[];
}
