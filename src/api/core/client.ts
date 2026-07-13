import { z } from "zod";
import { httpConfig } from "./config";
import {
  ApiNetworkError,
  mapFetchToProblem,
  ResponseValidationError,
} from "./errors";

export interface RequestOptions<T extends z.ZodTypeAny> {
  path: string;
  schema: T;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

  signal?: AbortSignal;
  headers?: Record<string, string>;
  cache?: RequestCache;

  data?: unknown;
  queryParams?: Record<string, string | number | boolean | undefined>;
  isPublic?: boolean;
}

export interface RequestMeta {
  serviceName: string;
}

export type ScopedClient = <T extends z.ZodTypeAny>(
  request: Omit<RequestOptions<T>, "path"> & { path?: string },
) => Promise<z.infer<T>>;

export interface HttpAuthStrategy {
  getAccessToken(): Promise<string | null> | string | null;
  refreshTokens(): Promise<string>;
  onAuthFailure(error: unknown): void | Promise<void>;
}

export class HttpClient {
  private readonly baseURL: string;
  private readonly authStrategy?: HttpAuthStrategy;
  private refreshPromise: Promise<string> | null = null;

  constructor(options: { baseURL: string; authStrategy?: HttpAuthStrategy }) {
    this.baseURL = options.baseURL.replace(/\/$/, "");
    this.authStrategy = options.authStrategy;
  }

  private async getAccessToken(forceRefresh = false): Promise<string | null> {
    if (!this.authStrategy) return null;

    if (forceRefresh) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.authStrategy.refreshTokens().finally(() => {
          this.refreshPromise = null;
        });
      }
      return this.refreshPromise;
    }

    return this.authStrategy.getAccessToken();
  }

  public async request<T extends z.ZodTypeAny>(
    options: RequestOptions<T>,
    meta?: RequestMeta,
  ): Promise<z.infer<T>> {
    const { path, schema, queryParams, data, isPublic, ...nativeOptions } =
      options;
    const serviceName = meta?.serviceName || "HttpClient";

    const fullUrl = new URL(`${this.baseURL}/${path.replace(/^\//, "")}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined) fullUrl.searchParams.append(key, String(val));
      });
    }

    const headers = new Headers(nativeOptions.headers);
    if (data && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let attemptCount = 0;

    const executeCall = async (
      tokenOverride?: string | null,
    ): Promise<unknown> => {
      attemptCount++;

      if (!isPublic) {
        const token =
          tokenOverride !== undefined
            ? tokenOverride
            : await this.getAccessToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      const response = await fetch(fullUrl.toString(), {
        ...nativeOptions,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.status === 401 && this.authStrategy && !isPublic) {
        if (attemptCount >= 2) {
          const authError = new Error(
            `Authentication failed loop protection at ${path}`,
          );
          await this.authStrategy.onAuthFailure(authError);
          throw authError;
        }

        const newToken = await this.getAccessToken(true);
        return executeCall(newToken);
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const problem = mapFetchToProblem(response, body, fullUrl.toString());
        throw new ApiNetworkError(problem);
      }

      if (response.status === 204) {
        return {};
      }

      return response.json();
    };

    try {
      const rawData = await executeCall();

      const parsed = schema.safeParse(rawData);
      if (!parsed.success) {
        // Throw custom validation error
        throw new ResponseValidationError(
          parsed.error,
          "Response failed contract verification.",
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

      console.error(`[${serviceName} System Error] at ${path}:`, error);
      throw error;
    }
  }

  public scope(basePath: string, serviceName = "HttpClient"): ScopedClient {
    return <T extends z.ZodTypeAny>(
      subOptions: Omit<RequestOptions<T>, "path"> & { path?: string },
    ): Promise<z.infer<T>> => {
      const combinedPath = `${basePath}/${subOptions.path ?? ""}`.replace(
        /\/+/g,
        "/",
      );
      return this.request(
        { ...subOptions, path: combinedPath } as RequestOptions<T>,
        { serviceName },
      );
    };
  }
}

export const httpClient = new HttpClient(httpConfig);
