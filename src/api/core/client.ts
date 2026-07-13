import { z } from "zod";
import { httpConfig } from "./config";
import {
  ApiNetworkError,
  mapFetchToProblem,
  ResponseValidationError,
} from "./errors";
import { tokenProvider, type BonfireTokenProvider } from "./tokens";

export interface BonfireHttpRequestOptions<T extends z.ZodTypeAny> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
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

export interface BonfireHttpMiddleware {
  name: string;

  beforeRequest?<T extends z.ZodTypeAny>(
    options: BonfireHttpRequestOptions<T>,
    headers: Headers,
  ): Promise<void> | void;

  onResponseSuccess?<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ): Promise<unknown> | void;
}

export class AuthMiddleware implements BonfireHttpMiddleware {
  public readonly name = "AuthMiddleware";
  private provider: BonfireTokenProvider;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(provider: BonfireTokenProvider) {
    this.provider = provider;
  }

  async beforeRequest<T extends z.ZodTypeAny>(
    options: BonfireHttpRequestOptions<T>,
    headers: Headers,
  ) {
    if (!options.protected) return;

    const token = await this.provider.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ) {
    if (response.status !== 401 || !options.protected) return;

    try {
      if (!this.refreshPromise) {
        this.refreshPromise = this.provider.refreshAccessToken().finally(() => {
          this.refreshPromise = null;
        });
      }

      const newToken = await this.refreshPromise;

      if (!newToken) {
        throw new Error("Token refresh returned empty payload.");
      }

      return await retry();
    } catch (error) {
      console.warn(
        "[AuthMiddleware] Token refresh failed. Evicting session.",
        error,
      );
      await this.provider.onSessionExpired();
      throw error;
    }
  }
}

export class RetryMiddleware implements BonfireHttpMiddleware {
  public readonly name = "RetryMiddleware";
  private maxRetries = 0;

  private attempts = new WeakMap<
    BonfireHttpRequestOptions<z.ZodTypeAny>,
    number
  >();

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireHttpRequestOptions<T>,
    retry: () => Promise<unknown>,
  ) {
    if (options.skipRetry) return;

    const retryableStatuses = [429, 502, 503, 504];
    if (!retryableStatuses.includes(response.status)) return;

    const currentAttempt = this.attempts.get(options) ?? 0;

    if (currentAttempt < this.maxRetries) {
      this.attempts.set(options, currentAttempt + 1);

      const delay = Math.pow(2, currentAttempt) * 100 + Math.random() * 50;
      await new Promise((res) => setTimeout(res, delay));

      return retry();
    }
  }
}

export type BonfireScopedClient = <T extends z.ZodTypeAny>(
  request: Omit<BonfireHttpRequestOptions<T>, "path"> & { path?: string },
) => Promise<z.infer<T>>;

export class BonfireHttpClient {
  private readonly baseURL: string;
  private readonly middleware: BonfireHttpMiddleware[];

  constructor(options: {
    baseURL: string;
    middleware?: BonfireHttpMiddleware[];
  }) {
    this.baseURL = options.baseURL.replace(/\/$/, "");
    this.middleware = options.middleware || [];
  }

  public async request<T extends z.ZodTypeAny>(
    options: BonfireHttpRequestOptions<T>,
    meta?: BonfireHttpRequestMeta,
  ): Promise<z.infer<T>> {
    const serviceName = meta?.serviceName || "HttpClient";

    const fullUrl = new URL(
      `${this.baseURL}/${options.path.replace(/^\//, "")}`,
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
        throw new Error(
          `[${serviceName}] Cascade breakdown protection at ${options.path}`,
        );
      }

      for (const layer of this.middleware) {
        if (layer.beforeRequest) {
          await layer.beforeRequest(options, headers);
        }
      }

      const response = await fetch(fullUrl.toString(), {
        method: options.method,
        signal: options.signal,
        cache: options.cache,
        headers,
        body: options.data ? JSON.stringify(options.data) : undefined,
      });

      if (!response.ok) {
        for (const layer of this.middleware) {
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

      // FIX 4: Run success lifecycle hooks before passing off data
      for (const layer of this.middleware) {
        if (layer.onResponseSuccess) {
          await layer.onResponseSuccess(response, options);
        }
      }

      if (response.status === 204) return {};
      return response.json();
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
      )
        throw error;
      console.error(`[${serviceName} System Error] at ${options.path}:`, error);
      throw error;
    }
  }

  public scope(
    basePath: string,
    serviceName = "HttpClient",
  ): BonfireScopedClient {
    return <T extends z.ZodTypeAny>(
      subOptions: Omit<BonfireHttpRequestOptions<T>, "path"> & {
        path?: string;
      },
    ): Promise<z.infer<T>> => {
      const combinedPath = `${basePath}/${subOptions.path ?? ""}`.replace(
        /\/+/g,
        "/",
      );

      return this.request(
        { ...subOptions, path: combinedPath },
        { serviceName },
      );
    };
  }
}

export const bonfireHttpClient = new BonfireHttpClient({
  baseURL: httpConfig.baseURL,
  middleware: [new AuthMiddleware(tokenProvider), new RetryMiddleware(3)],
});
