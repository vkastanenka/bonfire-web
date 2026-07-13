import axios, {
  type AxiosInstance,
  AxiosError,
  isCancel,
  type AxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { z } from "zod";
import { httpConfig, type HttpConfig } from "./config";
import {
  ApiNetworkError,
  ResponseValidationError,
  mapErrorToProblem,
} from "./errors";
import { clearAuth, getAccessToken, setAccessToken } from "./store";
import { refreshResponseSchema } from "./schema";

export interface SdkRequestConfig<T extends z.ZodTypeAny> extends Pick<
  AxiosRequestConfig,
  "url"
> {
  schema: T;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: unknown;
  queryParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface SdkRequestMeta {
  serviceName: string;
}

export type ScopedRequest = <T extends z.ZodTypeAny>(
  request: Omit<SdkRequestConfig<T>, "url"> & { url?: string },
) => Promise<z.infer<T>>;

class HttpClient {
  private readonly instance: AxiosInstance;
  private isRefreshing = false;
  private retriedRequests = new Set<AxiosRequestConfig>();
  private failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (err: unknown) => void;
  }> = [];

  constructor(config: HttpConfig) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.set("Authorization", `Bearer ${token}`);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => {
        console.log(response);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest || isCancel(error)) return Promise.reject(error);

        const problem = mapErrorToProblem(error);
        const isAuthRoute =
          originalRequest.url?.includes("auth/refresh") ||
          originalRequest.url?.includes("auth/login") ||
          originalRequest.url?.includes("auth/register");

        if (problem.code === "TOKEN_EXPIRED" && !isAuthRoute) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers =
                  originalRequest.headers ||
                  new AxiosHeaders(originalRequest.headers);
                originalRequest.headers.set("Authorization", `Bearer ${token}`);
                return this.instance.request(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          if (this.retriedRequests.has(originalRequest)) {
            this.retriedRequests.delete(originalRequest);
            clearAuth();
            return Promise.reject(new ApiNetworkError(problem));
          }

          this.retriedRequests.add(originalRequest);
          this.isRefreshing = true;

          try {
            const refreshRes = await this.instance.post("/auth/refresh");
            const parsed = refreshResponseSchema.parse(refreshRes.data);
            setAccessToken(parsed.access_token);

            this.failedQueue.forEach((prom) =>
              prom.resolve(parsed.access_token),
            );
            this.failedQueue = [];

            originalRequest.headers =
              originalRequest.headers ||
              new AxiosHeaders(originalRequest.headers);
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${parsed.access_token}`,
            );

            const retryResponse = await this.instance.request(originalRequest);
            this.retriedRequests.delete(originalRequest);
            return retryResponse;
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.reject(refreshError));
            this.failedQueue = [];
            this.retriedRequests.delete(originalRequest);
            clearAuth();
            return Promise.reject(new ApiNetworkError(problem));
          } finally {
            this.isRefreshing = false;
          }
        }

        this.retriedRequests.delete(originalRequest);
        return Promise.reject(new ApiNetworkError(problem));
      },
    );
  }

  public async request<T extends z.ZodTypeAny>(
    config: SdkRequestConfig<T>,
    meta?: SdkRequestMeta,
  ): Promise<z.infer<T>> {
    const serviceName = meta?.serviceName || "HttpClient";
    try {
      const response = await this.instance.request({
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.queryParams,
        headers: config.headers,
        signal: config.signal,
      });
      const result = config.schema.safeParse(response.data);
      if (!result.success) {
        console.error(
          `[${serviceName} Contract Violation] at ${config.url}:`,
          result.error,
        );
        throw new ResponseValidationError(
          result.error,
          "Response failed contract verification.",
          config.url || "",
        );
      }
      return result.data;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        console.error(
          `[${serviceName} Error ${error.status}]: ${error.message}`,
        );
      }
      throw error;
    }
  }

  public createScope(basePath: string, serviceName: string): ScopedRequest {
    return <T extends z.ZodTypeAny>(
      request: Omit<SdkRequestConfig<T>, "url"> & { url?: string },
    ) => {
      const cleanUrl = `${basePath}/${request.url ?? ""}`
        .replace(/\/+/g, "/")
        .replace(/^\//, "");
      return this.request({ ...request, url: cleanUrl }, { serviceName });
    };
  }
}

export const httpClient = new HttpClient(httpConfig);
