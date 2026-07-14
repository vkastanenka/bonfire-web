import { z } from "zod";
import { httpConfig } from "./config";
import {
  AuthMiddleware,
  RetryMiddleware,
  type BonfireHttpMiddleware,
} from "./middleware";
import {
  bonfireHttpRequest,
  type BonfireHttpRequestMeta,
  type BonfireHttpRequestOptions,
} from "./request";
import { sessionManager } from "../session";

export type BonfireScopedRequest<T extends z.ZodTypeAny = z.ZodTypeAny> = Omit<
  BonfireHttpRequestOptions<T>,
  "path"
> & {
  path?: string;
};

export type BonfireScopedClient = <T extends z.ZodTypeAny>(
  request: BonfireScopedRequest<T>,
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
    return bonfireHttpRequest(
      { baseURL: this.baseURL, middleware: this.middleware },
      options,
      meta,
    );
  }

  public scope(
    baseUrl: string,
    serviceName = "HttpClient",
  ): BonfireScopedClient {
    return <T extends z.ZodTypeAny>(
      subOptions: BonfireScopedRequest<T>,
    ): Promise<z.infer<T>> => {
      const combinedUrl = `${baseUrl}/${subOptions.path ?? ""}`.replace(
        /\/+/g,
        "/",
      );

      return this.request({ ...subOptions, url: combinedUrl }, { serviceName });
    };
  }
}

export const httpClient = new BonfireHttpClient({
  baseURL: httpConfig.baseURL,
  middleware: [new AuthMiddleware(sessionManager), new RetryMiddleware(3)],
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
// import { httpConfig, type httpConfig } from "./config";
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

//   constructor(config: httpConfig) {
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
