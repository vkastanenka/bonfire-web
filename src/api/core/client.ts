import { z } from "zod";
import { httpConfig } from "./config";
import {
  ApiNetworkError,
  mapFetchToProblem,
  ResponseValidationError,
} from "./errors";
import { tokenProvider, type BonfireTokenProvider } from "./tokens";

export interface BonfireRequestOptions<T extends z.ZodTypeAny> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  schema: T;

  signal?: AbortSignal;
  headers?: Record<string, string>;
  cache?: RequestCache;

  data?: unknown;
  queryParams?: Record<string, string | number | boolean | undefined>;
  isPublic?: boolean;
}

export interface BonfireRequestMeta {
  serviceName: string;
}

export interface BonfireHttpStrategy {
  name: string;

  beforeRequest?<T extends z.ZodTypeAny>(
    options: BonfireRequestOptions<T>,
    headers: Headers,
  ): Promise<void> | void;

  onResponseSuccess?(
    response: Response,
    options: BonfireRequestOptions<z.ZodTypeAny>,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireRequestOptions<T>,
    retry: () => Promise<unknown>,
  ): Promise<unknown> | void;
}

export class AuthStrategy implements BonfireHttpStrategy {
  public readonly name = "AuthStrategy";
  private provider: BonfireTokenProvider;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(provider: BonfireTokenProvider) {
    this.provider = provider;
  }

  async beforeRequest(
    options: BonfireRequestOptions<z.ZodTypeAny>,
    headers: Headers,
  ) {
    if (options.isPublic) return;

    const token = await this.provider.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  async onResponseError(
    response: Response,
    options: BonfireRequestOptions<z.ZodTypeAny>,
    retry: () => Promise<unknown>,
  ) {
    // Skip if it's not a 401 or if the endpoint is explicitly public
    if (response.status !== 401 || options.isPublic) return;

    try {
      // Concurrency lock: ensures multiple parallel 401s only trigger ONE refresh call
      if (!this.refreshPromise) {
        this.refreshPromise = this.provider.refreshAccessToken().finally(() => {
          this.refreshPromise = null;
        });
      }

      const newToken = await this.refreshPromise;

      // If refresh didn't give us a token, token rotation failed
      if (!newToken) {
        throw new Error("Token refresh returned empty payload.");
      }

      // Retry the original request
      return await retry();
    } catch (error) {
      // FIX: This now safely bubbles up to trigger global logout logic
      console.warn(
        "[AuthStrategy] Token refresh failed. Evicting session.",
        error,
      );
      await this.provider.onSessionExpired();
      throw error;
    }
  }
}

export class RetryStrategy implements BonfireHttpStrategy {
  public readonly name = "RetryStrategy";
  private maxRetries = 0;
  private attempts = new Map<string, number>();

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  // Purely typed without any explicit 'any'
  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: BonfireRequestOptions<T>,
    retry: () => Promise<unknown>,
  ) {
    const retryableStatuses = [429, 502, 503, 504];
    if (!retryableStatuses.includes(response.status)) return;

    const cacheKey = `${options.method}:${options.path}`;
    const currentAttempt = this.attempts.get(cacheKey) ?? 0;

    if (currentAttempt < this.maxRetries) {
      this.attempts.set(cacheKey, currentAttempt + 1);

      const delay = Math.pow(2, currentAttempt) * 100 + Math.random() * 50;
      await new Promise((res) => setTimeout(res, delay));

      return retry();
    }

    this.attempts.delete(cacheKey);
  }
}

export type BonfireScopedClient = <T extends z.ZodTypeAny>(
  request: Omit<BonfireRequestOptions<T>, "path"> & { path?: string },
) => Promise<z.infer<T>>;

export class BonfireHttpClient {
  private readonly baseURL: string;
  private readonly strategies: BonfireHttpStrategy[];

  constructor(options: {
    baseURL: string;
    strategies?: BonfireHttpStrategy[];
  }) {
    this.baseURL = options.baseURL.replace(/\/$/, "");
    this.strategies = options.strategies || [];
  }

  public async request<T extends z.ZodTypeAny>(
    options: BonfireRequestOptions<T>,
    meta?: BonfireRequestMeta,
  ): Promise<z.infer<T>> {
    const { path, queryParams, data, schema, ...nativeOptions } = options;
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

    const executeCall = async (): Promise<unknown> => {
      attemptCount++;
      if (attemptCount > 5) {
        throw new Error(
          `[${serviceName}] Cascade breakdown protection at ${path}`,
        );
      }

      // 1. Run beforeRequest hooks across all registered strategies
      for (const strategy of this.strategies) {
        if (strategy.beforeRequest) {
          await strategy.beforeRequest(options, headers);
        }
      }

      const response = await fetch(fullUrl.toString(), {
        ...nativeOptions,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      // 2. Handle Errors via the Strategy Pipeline
      if (!response.ok) {
        for (const strategy of this.strategies) {
          if (strategy.onResponseError) {
            // Pass the execution context back as a recursive closure callback
            const shortCircuit = await strategy.onResponseError(
              response,
              options,
              () => executeCall(),
            );
            if (shortCircuit) return shortCircuit;
          }
        }

        // If no strategy successfully intercepted and retried the error, map and throw normally
        const body = await response.json().catch(() => ({}));
        const problem = mapFetchToProblem(response, body, fullUrl.toString());
        throw new ApiNetworkError(problem);
      }

      if (response.status === 204) return {};
      return response.json();
    };

    // --- Execution Validation ---
    try {
      const rawData = await executeCall();
      const parsed = schema.safeParse(rawData);
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
      console.error(`[${serviceName} System Error] at ${path}:`, error);
      throw error;
    }
  }

  public scope(
    basePath: string,
    serviceName = "HttpClient",
  ): BonfireScopedClient {
    return <T extends z.ZodTypeAny>(
      subOptions: Omit<BonfireRequestOptions<T>, "path"> & { path?: string },
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
  strategies: [new AuthStrategy(tokenProvider), new RetryStrategy(3)],
});

// import axios, {
//   type AxiosInstance,
//   AxiosError,
//   isCancel,
//   type AxiosRequestConfig,
//   AxiosHeaders,
//   type InternalAxiosRequestConfig,
//   type AxiosResponse,
// } from "axios";
// import { z } from "zod";
// import { httpConfig, type HttpConfig } from "./config";
// import {
//   ApiNetworkError,
//   ResponseValidationError,
//   mapErrorToProblem,
// } from "./errors";
// import { clearAuth, getAccessToken, setAccessToken } from "./store";
// import { refreshResponseSchema } from "./schema";

// export interface RequestConfig<T extends z.ZodTypeAny> extends Pick<
//   AxiosRequestConfig,
//   "url"
// > {
//   schema: T;
//   method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
//   data?: unknown;
//   queryParams?: Record<string, string | number | boolean | undefined>;
//   signal?: AbortSignal;
//   headers?: Record<string, string>;
// }

// export interface BonfireRequestMeta {
//   serviceName: string;
// }

// export type ScopedRequest = <T extends z.ZodTypeAny>(
//   request: Omit<RequestConfig<T>, "url"> & { url?: string },
// ) => Promise<z.infer<T>>;

// interface QueuedRequest {
//   resolve: (token: string) => void;
//   reject: (err: unknown) => void;
// }

// class HttpClient {
//   private readonly instance: AxiosInstance;
//   private isRefreshing = false;
//   private retriedRequests = new Set<AxiosRequestConfig>();
//   private failedQueue: QueuedRequest[] = [];

//   private readonly bypassAuthRoutes = [
//     "/auth/refresh",
//     "/auth/login",
//     "/auth/register",
//   ];

//   constructor(config: HttpConfig) {
//     this.instance = axios.create({
//       baseURL: config.baseURL,
//       timeout: config.timeout,
//       headers: { "Content-Type": "application/json" },
//       withCredentials: true,
//     });
//     this.setupInterceptors();
//   }

//   private setupInterceptors(): void {
//     this.instance.interceptors.request.use(
//       this.handleRequestAttachment.bind(this),
//       (error) => Promise.reject(error),
//     );

//     this.instance.interceptors.response.use(
//       this.handleResponseSuccess.bind(this),
//       this.handleResponseError.bind(this),
//     );
//   }

//   private handleRequestAttachment(
//     config: InternalAxiosRequestConfig,
//   ): InternalAxiosRequestConfig {
//     const token = getAccessToken();
//     if (token) {
//       config.headers = config.headers || new AxiosHeaders();
//       config.headers.set("Authorization", `Bearer ${token}`);
//     }
//     return config;
//   }

//   private handleResponseSuccess(response: AxiosResponse): AxiosResponse {
//     if (process.env.NODE_ENV !== "production") {
//       console.log(
//         `[HTTP Success] ${response.config.method?.toUpperCase()} ${response.config.url}`,
//       );
//     }
//     return response;
//   }

//   private async handleResponseError(error: AxiosError): Promise<unknown> {
//     const originalRequest = error.config;
//     if (!originalRequest || isCancel(error)) {
//       return Promise.reject(error);
//     }

//     const problem = mapErrorToProblem(error);

//     if (this.shouldTriggerTokenRefresh(problem.code, originalRequest.url)) {
//       return this.handleExpiredTokenLifecycle(originalRequest, problem);
//     }

//     this.retriedRequests.delete(originalRequest);
//     return Promise.reject(new ApiNetworkError(problem));
//   }

//   private shouldTriggerTokenRefresh(errorCode: string, url?: string): boolean {
//     if (errorCode !== "TOKEN_EXPIRED" || !url) return false;
//     return !this.bypassAuthRoutes.some((route) => url.includes(route));
//   }

//   /**
//    * Orchestrates synchronization loops across thread-locked concurrent token tasks
//    */
//   private async handleExpiredTokenLifecycle(
//     originalRequest: AxiosRequestConfig,
//     problem: ReturnType<typeof mapErrorToProblem>,
//   ): Promise<unknown> {
//     // Scenario A: Token update is already flying down the pipeline. Queue this request.
//     if (this.isRefreshing) {
//       return this.enqueueFailedRequest(originalRequest);
//     }

//     // Scenario B: Infinite circular fallback check. Absolute termination breaker.
//     if (this.retriedRequests.has(originalRequest)) {
//       this.backoutAndClearAuthentication(originalRequest);
//       return Promise.reject(new ApiNetworkError(problem));
//     }

//     // Scenario C: Primary executor thread context. Run the handshake update.
//     this.retriedRequests.add(originalRequest);
//     this.isRefreshing = true;

//     try {
//       const refreshRes = await this.instance.post("/auth/refresh");
//       const parsed = refreshResponseSchema.parse(refreshRes.data);
//       setAccessToken(parsed.access_token);

//       this.flushFailedQueue(null, parsed.access_token);

//       this.updateRequestAuthorizationHeader(
//         originalRequest,
//         parsed.access_token,
//       );
//       const retryResponse = await this.instance.request(originalRequest);

//       this.retriedRequests.delete(originalRequest);
//       return retryResponse;
//     } catch (refreshError) {
//       this.flushFailedQueue(refreshError);
//       this.backoutAndClearAuthentication(originalRequest);
//       return Promise.reject(new ApiNetworkError(problem));
//     } finally {
//       this.isRefreshing = false;
//     }
//   }

//   private enqueueFailedRequest(
//     originalRequest: AxiosRequestConfig,
//   ): Promise<unknown> {
//     return new Promise<string>((resolve, reject) => {
//       this.failedQueue.push({ resolve, reject });
//     }).then((token) => {
//       this.updateRequestAuthorizationHeader(originalRequest, token);
//       return this.instance.request(originalRequest);
//     });
//   }

//   private flushFailedQueue(error: unknown | null, token?: string): void {
//     if (error) {
//       this.failedQueue.forEach((item) => item.reject(error));
//     } else if (token) {
//       this.failedQueue.forEach((item) => item.resolve(token));
//     }
//     this.failedQueue = [];
//   }

//   private updateRequestAuthorizationHeader(
//     request: AxiosRequestConfig,
//     token: string,
//   ): void {
//     request.headers = request.headers || new AxiosHeaders();
//     if (request.headers instanceof AxiosHeaders) {
//       request.headers.set("Authorization", `Bearer ${token}`);
//     } else {
//       request.headers["Authorization"] = `Bearer ${token}`;
//     }
//   }

//   private backoutAndClearAuthentication(request: AxiosRequestConfig): void {
//     this.retriedRequests.delete(request);
//     clearAuth();
//   }

//   public async request<T extends z.ZodTypeAny>(
//     config: RequestConfig<T>,
//     meta?: BonfireRequestMeta,
//   ): Promise<z.infer<T>> {
//     const serviceName = meta?.serviceName || "HttpClient";
//     try {
//       const response = await this.instance.request({
//         url: config.url,
//         method: config.method,
//         data: config.data,
//         params: config.queryParams,
//         headers: config.headers,
//         signal: config.signal,
//       });

//       const result = config.schema.safeParse(response.data);
//       if (!result.success) {
//         console.error(
//           `[${serviceName} Contract Violation] at ${config.url}:`,
//           result.error,
//         );
//         throw new ResponseValidationError(
//           result.error,
//           "Response failed contract verification.",
//           config.url || "",
//         );
//       }
//       return result.data;
//     } catch (error) {
//       if (error instanceof ApiNetworkError) {
//         console.error(
//           `[${serviceName} Error ${error.status}]: ${error.message}`,
//         );
//       }
//       throw error;
//     }
//   }

//   public createScope(basePath: string, serviceName: string): ScopedRequest {
//     return <T extends z.ZodTypeAny>(
//       request: Omit<RequestConfig<T>, "url"> & { url?: string },
//     ) => {
//       const cleanUrl = `${basePath}/${request.url ?? ""}`
//         .replace(/\/+/g, "/")
//         .replace(/^\//, "");
//       return this.request({ ...request, url: cleanUrl }, { serviceName });
//     };
//   }
// }

// export const httpClient = new HttpClient(httpConfig);
